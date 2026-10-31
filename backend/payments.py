import asyncio
import json
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import iyzipay
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

PACKS = {
    "baslangic": {"name": "Başlangıç", "credits": 50, "price": "99.0"},
    "profesyonel": {"name": "Profesyonel", "credits": 200, "price": "299.0"},
    "isletme": {"name": "İşletme", "credits": 600, "price": "699.0"},
}


def _options():
    return {
        "api_key": os.environ.get("IYZICO_API_KEY", ""),
        "secret_key": os.environ.get("IYZICO_SECRET_KEY", ""),
        "base_url": os.environ.get("IYZICO_BASE_URL", "sandbox-api.iyzipay.com"),
    }


def payments_enabled() -> bool:
    o = _options()
    return bool(o["api_key"] and o["secret_key"])


def _call(fn, payload):
    return json.loads(fn(payload, _options()).read().decode("utf-8"))


class BuyerIn(BaseModel):
    pack_id: str
    origin_url: str
    name: str = Field(min_length=1, max_length=60)
    surname: str = Field(min_length=1, max_length=60)
    phone: str = Field(min_length=7, max_length=20)
    city: str = Field(min_length=2, max_length=40)
    address: str = Field(min_length=5, max_length=200)
    identity_number: str = Field(default="11111111111", pattern=r"^\d{11}$")


def build_router(db, current_member):
    router = APIRouter(prefix="/api")
    orders = db.orders

    @router.get("/packs")
    async def packs():
        return {"enabled": payments_enabled(),
                "packs": [{"id": k, **v, "price": float(v["price"])} for k, v in PACKS.items()]}

    @router.post("/payments/initialize")
    async def initialize(body: BuyerIn, request: Request, member: dict = Depends(current_member)):
        if not payments_enabled():
            raise HTTPException(503, "Ödeme sistemi henüz aktif değil")
        pack = PACKS.get(body.pack_id)
        if not pack:
            raise HTTPException(400, "Bilinmeyen paket")
        order_id = str(uuid.uuid4())
        origin = body.origin_url.rstrip("/")
        ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
              or (request.client.host if request.client else "85.34.78.112"))
        addr = {"contactName": f"{body.name} {body.surname}", "city": body.city,
                "country": "Turkey", "address": body.address}
        payload = {
            "locale": "tr", "conversationId": order_id, "price": pack["price"], "paidPrice": pack["price"],
            "currency": "TRY", "basketId": order_id, "paymentGroup": "PRODUCT",
            "callbackUrl": f"{origin}/api/payments/callback",
            "enabledInstallments": [1, 2, 3, 6],
            "buyer": {"id": member["user_id"], "name": body.name, "surname": body.surname,
                      "gsmNumber": body.phone, "email": member.get("email") or "musteri@kazandiran.app",
                      "identityNumber": body.identity_number, "registrationAddress": body.address,
                      "city": body.city, "country": "Turkey", "ip": ip},
            "billingAddress": addr,
            "basketItems": [{"id": body.pack_id, "name": f"{pack['name']} - {pack['credits']} kredi",
                             "category1": "Dijital Kredi", "itemType": "VIRTUAL", "price": pack["price"]}],
        }
        result = await asyncio.to_thread(_call, iyzipay.CheckoutFormInitialize().create, payload)
        if result.get("status") != "success":
            raise HTTPException(502, result.get("errorMessage") or "Ödeme başlatılamadı")
        await orders.insert_one({
            "id": order_id, "user_id": member["user_id"], "pack_id": body.pack_id,
            "credits": pack["credits"], "amount": pack["price"], "currency": "TRY",
            "status": "pending", "token": result["token"], "origin": origin,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"order_id": order_id, "payment_page_url": result.get("paymentPageUrl")}

    @router.post("/payments/callback")
    async def callback(request: Request):
        form = await request.form()
        token = str(form.get("token", ""))
        order = await orders.find_one({"token": token}, {"_id": 0}) if token else None
        if not order:
            raise HTTPException(404, "Ödeme bulunamadı")
        redirect = RedirectResponse(f"{order['origin']}/odeme/sonuc?order={order['id']}", status_code=303)
        result = await asyncio.to_thread(_call, iyzipay.CheckoutForm().retrieve,
                                         {"locale": "tr", "conversationId": order["id"], "token": token})
        if result.get("status") != "success" or result.get("paymentStatus") != "SUCCESS":
            await orders.update_one({"id": order["id"], "status": "pending"}, {"$set": {"status": "failed"}})
            return redirect
        res = iyzipay.CheckoutForm()
        paid, price = res.strip_zero(str(result["paidPrice"])), res.strip_zero(str(result["price"]))
        sig = res.calculate_hmac_sha256_signature(
            [result["paymentStatus"], result["paymentId"], result["currency"], result["basketId"],
             result["conversationId"], paid, price, result["token"]], _options()["secret_key"])
        if (sig != result.get("signature") or result["currency"] != "TRY"
                or Decimal(price) != Decimal(order["amount"]) or result["basketId"] != order["id"]):
            await orders.update_one({"id": order["id"], "status": "pending"}, {"$set": {"status": "failed"}})
            return redirect
        changed = await orders.update_one(
            {"id": order["id"], "status": "pending"},
            {"$set": {"status": "paid", "payment_id": result["paymentId"],
                      "paid_at": datetime.now(timezone.utc).isoformat()}})
        if changed.modified_count == 1:
            await db.users.update_one({"user_id": order["user_id"]}, {"$inc": {"credits": order["credits"]}})
        return redirect

    @router.get("/payments/status/{order_id}")
    async def status(order_id: str, member: dict = Depends(current_member)):
        o = await orders.find_one({"id": order_id, "user_id": member["user_id"]},
                                  {"_id": 0, "status": 1, "credits": 1, "pack_id": 1})
        if not o:
            raise HTTPException(404, "Bulunamadı")
        return o

    return router

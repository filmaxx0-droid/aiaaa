import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from pymongo import ReturnDocument
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage  # noqa: E402

try:
    from backend.clerk_auth import clerk_router, require_user
    from backend.payments import build_router
    from backend.prompts import BASE, build_prompt
except ModuleNotFoundError:
    from clerk_auth import clerk_router, require_user
    from payments import build_router
    from prompts import BASE, build_prompt

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
FREE_CREDITS = 5

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def _clerk_email(user_id: str) -> str:
    r = requests.get(f"https://api.clerk.com/v1/users/{user_id}", timeout=10,
                     headers={"Authorization": f"Bearer {os.environ['CLERK_SECRET_KEY']}", "User-Agent": "kazandiran"})
    r.raise_for_status()
    emails = r.json().get("email_addresses") or []
    return emails[0]["email_address"] if emails else ""


async def current_member(user: dict = Depends(require_user)) -> dict:
    uid = user["user_id"]
    member = await db.users.find_one({"user_id": uid}, {"_id": 0})
    if member is None:
        try:
            email = await run_in_threadpool(_clerk_email, uid)
        except requests.RequestException:
            raise HTTPException(503, "Hesap bilgisi alınamadı, lütfen tekrar deneyin")
        member = await db.users.find_one_and_update(
            {"user_id": uid},
            {"$setOnInsert": {"user_id": uid, "email": email, "credits": FREE_CREDITS,
                              "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    return member


@api_router.get("/")
async def root():
    return {"message": "Kazandıran API"}


@api_router.get("/me")
async def me(member: dict = Depends(current_member)):
    return {"email": member.get("email"), "credits": member.get("credits", 0)}


class GenerateIn(BaseModel):
    tool: str
    data: dict


@api_router.post("/generate")
async def generate(body: GenerateIn, member: dict = Depends(current_member)):
    label, prompt = build_prompt(body.tool, body.data)
    uid = member["user_id"]
    charged = await db.users.find_one_and_update(
        {"user_id": uid, "credits": {"$gte": 1}}, {"$inc": {"credits": -1}},
        projection={"_id": 0, "credits": 1}, return_document=ReturnDocument.AFTER)
    if not charged:
        raise HTTPException(402, "Krediniz bitti")
    gen_id = str(uuid.uuid4())

    async def stream():
        chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=gen_id,
                       system_message=BASE).with_model("anthropic", "claude-sonnet-5-5")
        parts = []
        try:
            yield f"data: {json.dumps({'type': 'start', 'credits': charged['credits'], 'id': gen_id})}\n\n"
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    parts.append(ev.content)
                    yield f"data: {json.dumps({'type': 'delta', 'text': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            text = "".join(parts)
            if not text.strip():
                raise RuntimeError("empty response")
            title = str(body.data.get("product_name") or body.data.get("position")
                        or body.data.get("topic") or label)[:80]
            await db.generations.insert_one({
                "id": gen_id, "user_id": uid, "tool": body.tool, "title": title, "input": body.data,
                "output": text, "created_at": datetime.now(timezone.utc).isoformat()})
            yield f"data: {json.dumps({'type': 'done', 'id': gen_id})}\n\n"
        except (asyncio.CancelledError, GeneratorExit):  # client left mid-stream: refund
            asyncio.get_running_loop().create_task(
                db.users.update_one({"user_id": uid}, {"$inc": {"credits": 1}}))
            raise
        except Exception as e:  # refund on failure
            logger.exception("generation failed: %s", e)
            await db.users.update_one({"user_id": uid}, {"$inc": {"credits": 1}})
            yield f"data: {json.dumps({'type': 'error', 'message': 'Üretim başarısız oldu, krediniz iade edildi.'})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api_router.get("/history")
async def history(member: dict = Depends(current_member)):
    return await db.generations.find({"user_id": member["user_id"]}, {"_id": 0, "output": 0, "input": 0}) \
        .sort("created_at", -1).to_list(200)


@api_router.get("/history/{gen_id}")
async def history_item(gen_id: str, member: dict = Depends(current_member)):
    doc = await db.generations.find_one({"id": gen_id, "user_id": member["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Bulunamadı")
    return doc


@api_router.delete("/history/{gen_id}")
async def delete_item(gen_id: str, member: dict = Depends(current_member)):
    res = await db.generations.delete_one({"id": gen_id, "user_id": member["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Bulunamadı")
    return {"ok": True}


@app.on_event("startup")
async def indexes():
    await db.users.create_index("user_id", unique=True)
    await db.generations.create_index([("user_id", 1), ("created_at", -1)])
    await db.orders.create_index("token")


app.include_router(api_router)
app.include_router(clerk_router)
app.include_router(build_router(db, current_member))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

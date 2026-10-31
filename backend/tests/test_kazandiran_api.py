# Kazandıran API regression: auth, /me, SSE generate + credits, history isolation, packs/payments
import json

import requests

from conftest import BASE_URL, TEST_USER_ID, auth

API = f"{BASE_URL}/api"
STATE = {}


def _sse(resp):
    events = []
    for line in resp.iter_lines(decode_unicode=True):
        if line and line.startswith("data: "):
            events.append(json.loads(line[6:]))
    return events


# Auth
class TestAuth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=20)
        assert r.status_code == 200 and "Kazandıran" in r.json()["message"]

    def test_me_no_token(self):
        assert requests.get(f"{API}/me", timeout=20).status_code == 401

    def test_me_bad_token(self):
        assert requests.get(f"{API}/me", headers=auth("garbage"), timeout=20).status_code == 401

    def test_history_no_token(self):
        assert requests.get(f"{API}/history", timeout=20).status_code == 401

    def test_me_user_a(self, user_a_token):
        r = requests.get(f"{API}/me", headers=auth(user_a_token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["credits"] == 5 and d["email"] == "tester+clerk_test@example.com"

    def test_new_user_gets_5_credits(self, user_b, db):
        r = requests.get(f"{API}/me", headers=auth(user_b["token"]), timeout=20)
        assert r.status_code == 200
        assert r.json()["credits"] == 5
        assert r.json()["email"] == user_b["email"]
        assert db.users.count_documents({"user_id": user_b["id"]}) == 1


# Packs / payments
class TestPayments:
    def test_packs(self):
        d = requests.get(f"{API}/packs", timeout=20).json()
        assert d["enabled"] is False
        assert {p["id"]: (p["credits"], p["price"]) for p in d["packs"]} == {
            "baslangic": (50, 99.0), "profesyonel": (200, 299.0), "isletme": (600, 699.0)}

    def test_initialize_503(self, user_a_token):
        r = requests.post(f"{API}/payments/initialize", headers=auth(user_a_token), timeout=20, json={
            "pack_id": "baslangic", "origin_url": BASE_URL, "name": "Ali", "surname": "Veli",
            "phone": "+905551112233", "city": "İstanbul", "address": "Test mah. no 1"})
        assert r.status_code == 503

    def test_initialize_no_auth(self):
        r = requests.post(f"{API}/payments/initialize", json={}, timeout=20)
        assert r.status_code in (401, 422)


# Generate SSE + credits + history
class TestGenerate:
    def test_unknown_tool_400_no_charge(self, user_a_token):
        r = requests.post(f"{API}/generate", headers=auth(user_a_token), json={"tool": "x", "data": {}}, timeout=20)
        assert r.status_code == 400
        assert requests.get(f"{API}/me", headers=auth(user_a_token), timeout=20).json()["credits"] == 5

    def test_generate_listing_stream(self, user_a_token):
        r = requests.post(f"{API}/generate", headers=auth(user_a_token), stream=True, timeout=180, json={
            "tool": "listing", "data": {"platform": "Trendyol", "product_name": "TEST_Bambu Havlu Seti",
                                        "features": "%100 bambu, 3 parça, hızlı kurur", "tone": "Samimi"}})
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("text/event-stream")
        ev = _sse(r)
        types = [e["type"] for e in ev]
        assert types[0] == "start", types
        assert ev[0]["credits"] == 4
        assert "error" not in types, ev[-1]
        assert "delta" in types and types[-1] == "done"
        text = "".join(e["text"] for e in ev if e["type"] == "delta")
        assert len(text) > 200
        STATE["gen_id"] = ev[-1]["id"]
        assert requests.get(f"{API}/me", headers=auth(user_a_token), timeout=20).json()["credits"] == 4

    def test_history_list_and_detail(self, user_a_token):
        gid = STATE["gen_id"]
        items = requests.get(f"{API}/history", headers=auth(user_a_token), timeout=20).json()
        row = next(x for x in items if x["id"] == gid)
        assert row["title"] == "TEST_Bambu Havlu Seti" and row["tool"] == "listing"
        assert "output" not in row and "_id" not in row
        d = requests.get(f"{API}/history/{gid}", headers=auth(user_a_token), timeout=20).json()
        assert len(d["output"]) > 200 and d["input"]["product_name"] == "TEST_Bambu Havlu Seti"

    def test_user_b_isolation(self, user_b):
        gid = STATE["gen_id"]
        h = auth(user_b["token"])
        assert requests.get(f"{API}/history/{gid}", headers=h, timeout=20).status_code == 404
        assert requests.delete(f"{API}/history/{gid}", headers=h, timeout=20).status_code == 404
        assert all(x["id"] != gid for x in requests.get(f"{API}/history", headers=h, timeout=20).json())

    def test_delete_history(self, user_a_token):
        gid = STATE["gen_id"]
        h = auth(user_a_token)
        assert requests.delete(f"{API}/history/{gid}", headers=h, timeout=20).json() == {"ok": True}
        assert requests.get(f"{API}/history/{gid}", headers=h, timeout=20).status_code == 404

    def test_402_when_zero_credits(self, user_b, db):
        db.users.update_one({"user_id": user_b["id"]}, {"$set": {"credits": 0}})
        r = requests.post(f"{API}/generate", headers=auth(user_b["token"]), timeout=30,
                          json={"tool": "social", "data": {"topic": "x"}})
        assert r.status_code == 402
        assert db.users.find_one({"user_id": user_b["id"]})["credits"] == 0


def test_restore_user_a(db):
    db.users.update_one({"user_id": TEST_USER_ID}, {"$set": {"credits": 5}})

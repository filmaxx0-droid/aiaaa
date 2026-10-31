# Shared fixtures: Clerk Backend API helpers to mint session tokens for test users
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

_be = dotenv_values(Path(__file__).resolve().parents[1] / ".env")
_fe = dotenv_values(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _fe["REACT_APP_BACKEND_URL"]).rstrip("/")
CLERK = "https://api.clerk.com/v1"
SK = _be.get("CLERK_SECRET_KEY")
MONGO_URL = _be.get("MONGO_URL")
DB_NAME = _be.get("DB_NAME")
H = {"Authorization": f"Bearer {SK}", "User-Agent": "kazandiran-tests", "Content-Type": "application/json"}
TEST_USER_ID = "user_3LSQPvRkN6Cf1FQJSOieUwTbbyE"


def clerk_token(user_id: str) -> str:
    s = requests.post(f"{CLERK}/sessions", headers=H, json={"user_id": user_id}, timeout=20)
    s.raise_for_status()
    t = requests.post(f"{CLERK}/sessions/{s.json()['id']}/tokens", headers=H, json={}, timeout=20)
    t.raise_for_status()
    return t.json()["jwt"]


@pytest.fixture(scope="session")
def db():
    from pymongo import MongoClient
    return MongoClient(MONGO_URL)[DB_NAME]


@pytest.fixture(scope="session")
def user_a_token(db):
    db.users.update_one({"user_id": TEST_USER_ID}, {"$set": {"credits": 5}})
    return clerk_token(TEST_USER_ID)


@pytest.fixture(scope="session")
def user_b():
    email = f"testb{uuid.uuid4().hex[:6]}+clerk_test@example.com"
    r = requests.post(f"{CLERK}/users", headers=H, json={"email_address": [email], "password": "Test-pass-12345!xyz",
                                                          "skip_password_checks": True}, timeout=20)
    r.raise_for_status()
    uid = r.json()["id"]
    yield {"id": uid, "email": email, "token": clerk_token(uid)}
    requests.delete(f"{CLERK}/users/{uid}", headers=H, timeout=20)


def auth(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}

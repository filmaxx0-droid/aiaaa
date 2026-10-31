# Helper: reset test user credits to 5 and print a Clerk sign-in ticket for UI tests
import requests
from conftest import CLERK, H, TEST_USER_ID, MONGO_URL, DB_NAME
from pymongo import MongoClient

MongoClient(MONGO_URL)[DB_NAME].users.update_one({"user_id": TEST_USER_ID}, {"$set": {"credits": 5}})
r = requests.post(f"{CLERK}/sign_in_tokens", headers=H, json={"user_id": TEST_USER_ID, "expires_in_seconds": 3600}, timeout=20)
r.raise_for_status()
print(r.json()["token"])

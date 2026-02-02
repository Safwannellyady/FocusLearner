
import requests
import sys
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_health():
    print("Testing Health Check...")
    try:
        resp = requests.get(f"{BASE_URL}/health")
        if resp.status_code == 200:
            print("Health Check: PASSED")
            return True
        else:
            print(f"Health Check: FAILED ({resp.status_code})")
            return False
    except Exception as e:
        print(f"Health Check: FAILED (Connection Error: {e})")
        return False

def test_login_register():
    print("\nTesting Registration/Login...")
    payload = {
        "username": "verify_user",
        "email": "verify@example.com",
        "password": "Password123!",
        "full_name": "Verify User"
    }
    try:
        # Try login first
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "verify_user", "password": "Password123!"})
        if login_resp.status_code == 200:
            print("User already exists. Logged in.")
            return login_resp.json()['access_token']

        resp = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if resp.status_code == 201:
            print("Registration: PASSED")
            return resp.json()['access_token']
        elif resp.status_code == 400 and "already exists" in resp.text:
             print("Registration: User exists (handled)")
             # Login to get token
             login_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "verify_user", "password": "Password123!"})
             return login_resp.json()['access_token']
        else:
            print(f"Registration: FAILED ({resp.status_code} - {resp.text})")
            return None
    except Exception as e:
        print(f"Registration/Login: FAILED ({e})")
        return None

def test_create_lecture(token):
    print("\nTesting Create Lecture...")
    if not token:
        print("Skipping (No Token)")
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Verification Lecture",
        "subject": "CS",
        "topic": "API Testing",
        "description": "Automated test lecture"
    }
    try:
        resp = requests.post(f"{BASE_URL}/lectures/", json=payload, headers=headers)
        if resp.status_code == 201:
            print("Create Lecture: PASSED")
        elif resp.status_code == 200:
             print("Create Lecture: PASSED (200 OK)")
        else:
            print(f"Create Lecture: FAILED ({resp.status_code} - {resp.text})")
    except Exception as e:
        print(f"Create Lecture: FAILED ({e})")

def test_video_search():
    print("\nTesting Video Search...")
    try:
        resp = requests.get(f"{BASE_URL}/content/search", params={"query": "Calculus", "subject_focus": "Math"})
        if resp.status_code == 200:
            results = resp.json().get('results', [])
            print(f"Video Search: PASSED (Found {len(results)} videos)")
            if len(results) > 0:
                print(f"Sample Video: {results[0].get('title')}")
        else:
            print(f"Video Search: FAILED ({resp.status_code})")
    except Exception as e:
         print(f"Video Search: FAILED ({e})")

def test_game_modules():
    print("\nTesting Game Modules...")
    try:
        resp = requests.get(f"{BASE_URL}/game/modules")
        if resp.status_code == 200:
            data = resp.json()
            count = data.get('count', 0)
            print(f"Game Modules: PASSED (Found {count} modules)")
            if count > 0:
                print(f"Modules: {list(data.get('modules', {}).keys())}")
        else:
            print(f"Game Modules: FAILED ({resp.status_code})")
    except Exception as e:
        print(f"Game Modules: FAILED ({e})")

def test_generate_activity(token):
    print("\nTesting Activity Generation...")
    if not token:
        print("Skipping (No Token)")
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "subject": "CS",
        "topic": "Algorithms",
        "type": "coding"
    }
    try:
        resp = requests.post(f"{BASE_URL}/game/activity/generate", json=payload, headers=headers)
        if resp.status_code == 200:
            print("Generate Activity: PASSED")
            activity = resp.json().get('activity', {})
            print(f"Activity Title: {activity.get('title')}")
        else:
            print(f"Generate Activity: FAILED ({resp.status_code} - {resp.text})")
    except Exception as e:
        print(f"Generate Activity: FAILED ({e})")

if __name__ == "__main__":
    if test_health():
        token = test_login_register()
        if token:
            test_create_lecture(token)
            test_video_search()
            test_game_modules()
            test_generate_activity(token)
        else:
            print("Authentication failed. Aborting auth-protected tests.")
    else:
        print("Backend unreachable. Aborting tests.")

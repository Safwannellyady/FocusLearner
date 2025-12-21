
import requests
import sys

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

def test_registration():
    print("\nTesting Registration...")
    payload = {
        "username": "verify_user",
        "email": "verify@example.com",
        "password": "password123",
        "full_name": "Verify User"
    }
    try:
        # Try login first to see if user exists
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "verify_user", "password": "password123"})
        if login_resp.status_code == 200:
            print("User already exists. Logged in.")
            return login_resp.json()['token']

        resp = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if resp.status_code == 201:
            print("Registration: PASSED")
            return resp.json()['token']
        elif resp.status_code == 400 and "already exists" in resp.text:
             print("Registration: User exists (handled)")
             # Login to get token
             login_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "verify_user", "password": "password123"})
             return login_resp.json()['token']
        else:
            print(f"Registration: FAILED ({resp.status_code} - {resp.text})")
            return None
    except Exception as e:
        print(f"Registration: FAILED ({e})")
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

if __name__ == "__main__":
    if test_health():
        token = test_registration()
        test_create_lecture(token)
        test_video_search()
    else:
        print("Backend unreachable. Aborting tests.")

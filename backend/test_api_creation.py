import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_flow():
    print("Testing API Flow...")
    
    # 1. Register/Login
    username = "debug_user_01"
    password = "password123"
    
    # Try login first
    print("Attempting login...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })
    
    token = None
    
    if login_res.status_code == 200:
        print("Login successful.")
        token = login_res.json().get('token')
    else:
        print(f"Login failed ({login_res.status_code}). Attempting registration...")
        reg_res = requests.post(f"{BASE_URL}/auth/register", json={
            "username": username,
            "email": "debug_01@example.com",
            "password": password,
            "full_name": "Debug User"
        })
        
        if reg_res.status_code in [201, 200]:
            print("Registration successful. Logging in...")
            login_res = requests.post(f"{BASE_URL}/auth/login", json={
                "username": username,
                "password": password
            })
            if login_res.status_code == 200:
                token = login_res.json().get('token')
            else:
                print(f"Login after registration failed: {login_res.text}")
        else:
            print(f"Registration failed: {reg_res.text}")
            
    if not token:
        print("Could not get auth token. Aborting.")
        return

    # 2. Test Create Course
    print("\nAttempting to Create Course...")
    headers = {"Authorization": f"Bearer {token}"}
    course_data = {
        "title": "Debug Physics Class",
        "subject": "Physics",
        "description": "Created via debug script"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/lectures/courses", json=course_data, headers=headers)
        if res.status_code in [200, 201]:
            print("SUCCESS: Course Created!")
            print(json.dumps(res.json(), indent=2))
        else:
            print(f"FAILURE: Could not create course. Status: {res.status_code}")
            with open("error.html", "w", encoding="utf-8") as f:
                f.write(res.text)
            print("Error details saved to error.html")
    except Exception as e:
        print(f"Exception during request: {e}")

if __name__ == "__main__":
    test_flow()

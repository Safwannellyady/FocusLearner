"""
FocusLearner Pro v2.0 - Automated Verification Test Harness
Tests SRS SuperMemo SM-2 algorithm, Multiplayer Study Rooms & Scheduled Discussions, Knowledge Graph, and Smart Pomodoro Recommendations.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import app
from models import db, User

def run_v2_tests():
    print("=== Starting FocusLearner Pro v2.0 Verification Suite ===")
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            user = User.query.filter_by(username="test_gamer").first()
            if not user:
                user = User(username="test_gamer", email="gamer@test.com", full_name="Gamer Test")
            user.set_password("password123")
            db.session.add(user)
            db.session.commit()
                
        # Login
        res = client.post('/api/auth/login', json={'username': 'test_gamer', 'password': 'password123'})
        assert res.status_code == 200, f"Login failed: {res.get_json()}"
        token = res.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # 1. Test SRS Card Creation & Due Check
        print("1. Testing SRS Card Creation & SuperMemo SM-2 Review...")
        res = client.post('/api/srs/create', json={
            'subject': 'Math/Linear Algebra',
            'topic': 'Eigenvalues',
            'question': 'What is the characteristic polynomial of matrix A?',
            'answer': 'det(A - lambda * I) = 0'
        }, headers=headers)
        assert res.status_code == 201, f"SRS create failed: {res.get_json()}"
        card_id = res.get_json()['card']['id']
        
        res = client.get('/api/srs/due', headers=headers)
        assert res.status_code == 200, f"SRS due check failed: {res.get_json()}"
        assert len(res.get_json()['cards']) >= 1
        
        res = client.post('/api/srs/review', json={
            'card_id': card_id,
            'quality': 5  # Perfect recall -> Ease factor should increase above 2.5
        }, headers=headers)
        assert res.status_code == 200, f"SRS review failed: {res.get_json()}"
        updated_card = res.get_json()['card']
        print(f"   Reviewed Card: New Ease Factor={updated_card['ease_factor']}, Interval={updated_card['interval']} days")
        
        # 2. Test Multiplayer Study Room & Discussion Scheduling
        print("2. Testing Multiplayer Study Room & Scheduled Discussion...")
        res = client.post('/api/rooms/create', json={
            'title': 'v2.0 Launch Focus Room',
            'subject_focus': 'CS/Algorithms',
            'target_duration': 50
        }, headers=headers)
        assert res.status_code == 201, f"Room create failed: {res.get_json()}"
        room_code = res.get_json()['room']['room_code']
        print(f"   Created Study Room: Code={room_code}")
        
        res = client.post(f'/api/rooms/{room_code}/schedule_review', json={
            'title': 'Classmate Review on Dynamic Programming',
            'topic_summary': 'We will discuss Knapsack and LCS after our 50m sprint.',
            'scheduled_at': '2026-07-17T15:00:00Z'
        }, headers=headers)
        assert res.status_code == 201, f"Schedule review failed: {res.get_json()}"
        print("   Review session scheduled successfully.")
        
        res = client.post(f'/api/rooms/{room_code}/messages', json={
            'message': 'Excited to review DP with everyone after the Pomodoro block!',
            'is_review_note': True
        }, headers=headers)
        assert res.status_code == 201, f"Send message failed: {res.get_json()}"
        
        res = client.get(f'/api/rooms/{room_code}/status', headers=headers)
        assert res.status_code == 200
        room_data = res.get_json()['room']
        assert len(room_data['scheduled_discussions']) == 1
        print(f"   Verified Room Status & Scheduled Discussions count: {len(room_data['scheduled_discussions'])}")
        
        # 3. Test Knowledge Graph Taxonomy Endpoint
        print("3. Testing Knowledge Graph Visual Taxonomy...")
        res = client.get('/api/taxonomy/graph?subject=Math/Linear Algebra', headers=headers)
        assert res.status_code == 200, f"Graph endpoint failed: {res.get_json()}"
        graph_data = res.get_json()
        assert len(graph_data['nodes']) >= 1
        print(f"   Knowledge Graph generated: {len(graph_data['nodes'])} nodes, {len(graph_data['links'])} prerequisite links.")
        
        # 4. Test Smart Pomodoro Recommendation
        print("4. Testing Smart Pomodoro AI Recommendation...")
        res = client.get('/api/focus/recommendation', headers=headers)
        assert res.status_code == 200, f"Recommendation failed: {res.get_json()}"
        rec = res.get_json()['recommendation']
        print(f"   Recommendation: {rec['sprint_minutes']}m sprint ({rec['mode']}) - {rec['reasoning'][:80]}...")
        
        print("\n[SUCCESS] v2.0 Verification Complete: All new backend subsystems functional!")

if __name__ == '__main__':
    run_v2_tests()

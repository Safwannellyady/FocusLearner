from app import app
from models import db, User, GameProgress, SubjectFocus, ContentItem, Lecture, UserPreferences
from datetime import datetime, timedelta

def seed_data():
    with app.app_context():
        print("Starting database seed...")
        db.create_all()
        
        # 1. Create Demo User
        demo_user = User.query.filter_by(username='test_gamer').first()
        if not demo_user:
            print("Creating demo user 'test_gamer'...")
            demo_user = User(
                username='test_gamer',
                email='demo@focuslearner.com',
                full_name='Demo User',
                is_active=True,
                streak_days=5,
                last_login_at=datetime.utcnow()
            )
            demo_user.set_password('password123')
            db.session.add(demo_user)
            db.session.commit() # Commit to get ID
            print("Demo user created successfully!")
        else:
            print("Demo user already exists.")

        # 2. Add Content Items (Educational Videos/Playlists)
        # We use known high-quality playlists/videos. 
        # Note: In a real app, these might come from an API, but seeding is good for dev.
        content_items = [
            # CS - Algorithms
            {
                "title": "Algorithms & Data Structures by Abdul Bari",
                "description": "Comprehensive guide to Algorithms by Abdul Bari. Excellent for concept building.",
                "source": "youtube",
                "source_id": "PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O", # Playlist ID
                "url": "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
                "subject_focus": SubjectFocus.CS_ALGORITHMS
            },
            # CS - Data Structures (Using NPTEL)
            {
                "title": "Data Structures And Algorithms - NPTEL (IIT Kharagpur)",
                "description": "In-depth academic course on Data Structures.",
                "source": "youtube",
                "source_id": "PLBF3763AF2E1C572F", 
                "url": "https://www.youtube.com/playlist?list=PLBF3763AF2E1C572F",
                "subject_focus": SubjectFocus.CS_DATA_STRUCTURES
            },
            # ECE - Network Analysis
            {
                "title": "Network Analysis - NPTEL",
                "description": "Fundamental concepts of Network Analysis from IIT Kharagpur.",
                "source": "youtube",
                "source_id": "PLgwJf8NK-2e5Hnu8291w24w6s74hM6ZJ", # Assumed valid NPTEL playlist
                "url": "https://www.youtube.com/playlist?list=PLgwJf8NK-2e5Hnu8291w24w6s74hM6ZJ",
                "subject_focus": SubjectFocus.ECE_NETWORK_ANALYSIS
            },
             # ECE - Circuit Theory
            {
                "title": "Circuit Theory - Gate Academy",
                "description": "Circuit Theory concepts explained for GATE exam.",
                "source": "youtube",
                "source_id": "PL9RcWoqXmzaLTy8k3qK-q_yI8tF9X8G_E", # Example playlist
                "url": "https://www.youtube.com/playlist?list=PL9RcWoqXmzaLTy8k3qK-q_yI8tF9X8G_E",
                "subject_focus": SubjectFocus.ECE_CIRCUIT_THEORY
            },
            # Math - Linear Algebra
            {
                "title": "Essence of Linear Algebra - 3Blue1Brown",
                "description": "Visualizing linear algebra concepts. Great for intuition.",
                "source": "youtube",
                "source_id": "PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
                "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
                "subject_focus": SubjectFocus.MATH_LINEAR_ALGEBRA
            },
            # Math - Calculus
            {
                "title": "Calculus 1 - Professor Leonard",
                "description": "Full Calculus 1 course. Very clear and engaging.",
                "source": "youtube",
                "source_id": "PLF797E961509B4EB5",
                "url": "https://www.youtube.com/playlist?list=PLF797E961509B4EB5",
                "subject_focus": SubjectFocus.MATH_CALCULUS
            }
        ]

        print("Seeding Content Items...")
        for item_data in content_items:
            existing = ContentItem.query.filter_by(source_id=item_data['source_id']).first()
            if not existing:
                item = ContentItem(**item_data)
                db.session.add(item)
                print(f"Added content: {item_data['title']}")
        db.session.commit()

        # 3. Add Game Progress
        if not GameProgress.query.filter_by(user_id=demo_user.id).first():
            print("Adding game progress...")
            progress = GameProgress(
                user_id=demo_user.id,
                game_module='kcl_challenge',
                level=5,
                score=2500,
                mastery_points=45,
                subject_focus=SubjectFocus.ECE_CIRCUIT_THEORY
            )
            db.session.add(progress)
            
            # Add another subject progress
            progress2 = GameProgress(
                user_id=demo_user.id,
                game_module='algo_master',
                level=2,
                score=800,
                mastery_points=15,
                subject_focus=SubjectFocus.CS_ALGORITHMS
            )
            db.session.add(progress2)
            db.session.commit()

        # 4. Add User Preferences
        if not UserPreferences.query.filter_by(user_id=demo_user.id).first():
            print("Adding user preferences...")
            import json
            prefs = UserPreferences(
                user_id=demo_user.id,
                preferred_subjects=json.dumps(["CS/Algorithms", "Math/Linear Algebra"]),
                preferred_topics=json.dumps(["Sorting", "Eigenvectors"]),
                difficulty_level='intermediate',
                learning_style='visual'
            )
            db.session.add(prefs)
            db.session.commit()

        # 5. Add a Sample Lecture
        if not Lecture.query.filter_by(user_id=demo_user.id).first():
            print("Adding sample lecture...")
            import json
            lec = Lecture(
                user_id=demo_user.id,
                title="My Algorithm Prep",
                subject="CS/Algorithms",
                topic="Sorting",
                description="Preparing for interviews with sorting algorithms.",
                video_ids=json.dumps(["PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O"]),
                is_active=True
            )
            db.session.add(lec)
            db.session.commit()
            
        print("Database seed completed successfully!")

if __name__ == "__main__":
    seed_data()

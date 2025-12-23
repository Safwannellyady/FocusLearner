from app import app
from models import db, User, GameProgress, SubjectFocus
from datetime import datetime, timedelta

def seed_data():
    with app.app_context():
        db.create_all()
        
        # Check if demo user exists
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
            db.session.commit()
            
            # Add some game progress
            progress = GameProgress(
                user_id=demo_user.id,
                level=1,
                current_xp=50,
                next_level_xp=100,
                total_xp=50,
                subject_focus=SubjectFocus.CS_ALGORITHMS
            )
            db.session.add(progress)
            db.session.commit()
            print("Demo user created successfully!")
        else:
            print("Demo user already exists.")

if __name__ == "__main__":
    seed_data()

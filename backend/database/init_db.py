"""
FocusLearner Pro - Database Initialization Script
Creates database tables and seeds initial test data
"""

from app import app, db
from models import User, FocusSession, GameProgress, ContentItem, ChatMessage

def init_database():
    """Initialize database with tables and seed data"""
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("✓ Tables created successfully")
        
        # Check if test user already exists
        test_user = User.query.filter_by(username='testuser').first()
        
        if not test_user:
            # Create test user
            print("\nCreating test user...")
            test_user = User(
                username='testuser',
                email='test@focuslearner.com'
            )
            test_user.set_password('password123')
            db.session.add(test_user)
            db.session.commit()
            print(f"✓ Test user created (ID: {test_user.id})")
        else:
            print(f"\n✓ Test user already exists (ID: {test_user.id})")
        
        # Display database status
        print("\n" + "="*50)
        print("Database Initialization Complete!")
        print("="*50)
        print(f"Test User ID: {test_user.id}")
        print(f"Username: {test_user.username}")
        print(f"Email: {test_user.email}")
        print("\nYou can now use user_id={} in the frontend".format(test_user.id))
        print("="*50)

if __name__ == '__main__':
    init_database()


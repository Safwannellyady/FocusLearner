from app import app, db
from sqlalchemy import text
from models import LearningLoopState
# Import the model to ensure SQLAlchemy knows about it

def migrate_loop_db():
    print("Migrating Loop Tables...")
    with app.app_context():
        # Create table if not exists (using SQLAlchemy create_all is safer for new tables)
        # But we only want to create specific tables or update schema
        # Since I am not using Flask-Migrate, I will use create_all which only creates missing tables
        db.create_all()
        print("Database schema updated.")

if __name__ == "__main__":
    migrate_loop_db()

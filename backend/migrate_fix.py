from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Migrating LearningLoopState...")
        with db.engine.connect() as conn:
            try:
                # Direct SQL execution
                conn.execute(text("ALTER TABLE learning_loop_states ADD COLUMN last_feedback TEXT"))
                conn.commit()
                print("Added last_feedback column.")
            except Exception as e:
                print(f"Skipping: {e}")

if __name__ == "__main__":
    migrate()

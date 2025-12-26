from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Migrating LearningLoopState...")
        try:
            with db.engine.connect() as conn:
                # Check if column exists first to avoid error
                # SQLite doesn't support IF NOT EXISTS in ADD COLUMN easily, so we try/except
                try:
                    conn.execute(text("ALTER TABLE learning_loop_states ADD COLUMN last_feedback TEXT"))
                    conn.commit()
                    print("Added last_feedback column.")
                except Exception as e:
                    print(f"Column likely exists or other error: {e}")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()

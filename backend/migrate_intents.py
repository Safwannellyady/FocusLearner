from app import app, db
from sqlalchemy import text

def migrate_db():
    print("Migrating database...")
    with app.app_context():
        # Check if column exists in lectures
        try:
            db.session.execute(text("ALTER TABLE lectures ADD COLUMN learning_intent_id INTEGER REFERENCES learning_intents(id)"))
            print("Added learning_intent_id to lectures")
        except Exception as e:
            print(f"Column may already exist in lectures: {e}")

        # Check if column exists in game_challenges
        try:
            db.session.execute(text("ALTER TABLE game_challenges ADD COLUMN learning_intent_id INTEGER REFERENCES learning_intents(id)"))
            print("Added learning_intent_id to game_challenges")
        except Exception as e:
            print(f"Column may already exist in game_challenges: {e}")
            
        db.session.commit()

if __name__ == "__main__":
    migrate_db()

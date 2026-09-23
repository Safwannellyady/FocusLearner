"""
Ad-hoc migration: docked documents + todos backend for study rooms.

- Creates the docked_documents, room_todos, and docked_item_comments tables
  (via db.create_all(); harmless if they already exist).
- Adds the is_system column to room_messages.
"""

from sqlalchemy.exc import OperationalError
from app import app, db


def migrate():
    print("Migrating database for docked documents + todos...")

    # 1. Create new dock tables
    with app.app_context():
        db.create_all()
        print("db.create_all() executed (docked_documents, room_todos, docked_item_comments).")

    # 2. Add is_system to room_messages if missing
    with app.app_context():
        # Postgres: idempotent add
        try:
            db.session.execute(db.text(
                "ALTER TABLE room_messages ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE"))
            db.session.commit()
            print("'is_system' column ensured on 'room_messages' (Postgres).")
        except OperationalError as e:
            db.session.rollback()
            print(f"Postgres-style ALTER failed ({e}); trying plain ALTER TABLE (SQLite)...")
            try:
                db.session.execute(db.text(
                    "ALTER TABLE room_messages ADD COLUMN is_system BOOLEAN DEFAULT FALSE"))
                db.session.commit()
                print("'is_system' column added to 'room_messages' (SQLite fallback).")
            except OperationalError:
                db.session.rollback()
                print("'is_system' column already exists in 'room_messages'.")

    print("Migration complete.")


if __name__ == "__main__":
    migrate()

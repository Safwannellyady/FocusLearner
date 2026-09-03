import sqlite3
from app import app, db

def migrate():
    print("Migrating database for Phase 11 (Courses)...")
    
    # 1. Create Courses Table (handled by db.create_all usually, but let's ensure)
    with app.app_context():
        db.create_all()
        print("db.create_all() executed.")
        
    # 2. Add course_id to lectures if missing
    conn = sqlite3.connect('instance/focuslearner.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT course_id FROM lectures LIMIT 1")
        print("'course_id' column already exists in 'lectures'.")
    except sqlite3.OperationalError:
        print("Adding 'course_id' column to 'lectures'...")
        try:
            cursor.execute("ALTER TABLE lectures ADD COLUMN course_id INTEGER REFERENCES courses(id)")
            conn.commit()
            print("Column added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")
            
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()

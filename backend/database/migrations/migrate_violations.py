import sqlite3
import os

# Database path
DB_PATH = 'instance/focuslearner_v3.db'

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH}, trying root...")
    DB_PATH = 'focuslearner_v3.db'

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(activity_results)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'focus_violations' not in columns:
            print("Adding focus_violations column to activity_results...")
            cursor.execute("ALTER TABLE activity_results ADD COLUMN focus_violations INTEGER DEFAULT 0")
            print("Migration successful.")
        else:
            print("Column focus_violations already exists.")
            
        conn.commit()
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()

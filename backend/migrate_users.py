import sqlite3
from app import app, db

def migrate():
    print("Migrating database for User updates...")
    
    conn = sqlite3.connect('instance/focuslearner_v3.db')
    cursor = conn.cursor()
    
    # Check and add last_login_at
    try:
        cursor.execute("SELECT last_login_at FROM users LIMIT 1")
        print("'last_login_at' column already exists.")
    except sqlite3.OperationalError:
        print("Adding 'last_login_at' column...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN last_login_at DATETIME")
            conn.commit()
            print("Column added.")
        except Exception as e:
            print(f"Error adding last_login_at: {e}")

    # Check and add streak_days
    try:
        cursor.execute("SELECT streak_days FROM users LIMIT 1")
        print("'streak_days' column already exists.")
    except sqlite3.OperationalError:
        print("Adding 'streak_days' column...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 0")
            conn.commit()
            print("Column added.")
        except Exception as e:
            print(f"Error adding streak_days: {e}")
            
    conn.close()
    print("User migration complete.")

if __name__ == "__main__":
    migrate()

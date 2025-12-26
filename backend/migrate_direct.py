import sqlite3
import os

paths = [
    r"backend\instance\focuslearner_v3.db",
    r"instance\focuslearner_v3.db"
]

for path in paths:
    if os.path.exists(path):
        print(f"Migrating {path}...")
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            try:
                cursor.execute("ALTER TABLE learning_loop_states ADD COLUMN last_feedback TEXT")
                conn.commit()
                print("Success.")
            except Exception as e:
                print(f"Error (likely already exists): {e}")
            conn.close()
        except Exception as e:
            print(f"Connection failed: {e}")
    else:
        print(f"Path not found: {path}")

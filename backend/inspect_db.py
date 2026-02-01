import sqlite3

def inspect():
    db_path = 'instance/focuslearner_v3.db'
    print(f"Inspecting {db_path}...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables found: {tables}")
        
        if 'courses' in tables:
            print("Table 'courses' EXISTS.")
            cursor.execute("PRAGMA table_info(courses)")
            cols = [row[1] for row in cursor.fetchall()]
            print(f"Courses columns: {cols}")
        else:
            print("Table 'courses' MISSING.")
            
        if 'lectures' in tables:
            print("Table 'lectures' EXISTS.")
            cursor.execute("PRAGMA table_info(lectures)")
            cols = [row[1] for row in cursor.fetchall()]
            print(f"Lectures columns: {cols}")
            if 'course_id' in cols:
                print("'course_id' column found in lectures.")
            else:
                print("'course_id' column MISSING from lectures.")
                
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()

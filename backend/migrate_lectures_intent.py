import sqlite3

def migrate():
    db_path = 'instance/focuslearner_v3.db'
    print(f"Migrating {db_path}...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists
    try:
        cursor.execute("SELECT learning_intent_id FROM lectures LIMIT 1")
        print("'learning_intent_id' already exists.")
    except sqlite3.OperationalError:
        print("Adding 'learning_intent_id' column...")
        try:
            cursor.execute("ALTER TABLE lectures ADD COLUMN learning_intent_id INTEGER REFERENCES learning_intents(id)")
            conn.commit()
            print("Column added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")
            
    conn.close()

if __name__ == "__main__":
    migrate()

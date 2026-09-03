
from app import app, db
from models import LearningIntent
from utils.taxonomy_data import SUBJECTS, TOPIC_TAXONOMY
import json

def seed_learning_intents():
    print("Seeding Learning Intent Taxonomy...")
    
    with app.app_context():
        # Create tables if they don't exist (just in case)
        db.create_all()
        
        count = 0
        for subject in SUBJECTS:
            # Determine topics for this subject
            topics = TOPIC_TAXONOMY.get(subject, TOPIC_TAXONOMY["default"])
            
            for topic_name in topics:
                # Check if exists
                exists = LearningIntent.query.filter_by(subject=subject, topic=topic_name).first()
                if not exists:
                    intent = LearningIntent(
                        subject=subject,
                        topic=topic_name,
                        sub_topic=None, # For now
                        difficulty="Intermediate", # Default
                        required_outcomes=json.dumps(["Understand core concepts", "Apply knowledge in scenarios"])
                    )
                    db.session.add(intent)
                    count += 1
        
        db.session.commit()
        print(f"Successfully seeded {count} new learning intents.")

if __name__ == "__main__":
    seed_learning_intents()

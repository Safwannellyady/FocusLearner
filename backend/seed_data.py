"""
FocusLearner Pro - Seed Data Script
Adds sample content and test data to the database
"""

from app import app, db
from models import User, ContentItem
from datetime import datetime

def seed_content():
    """Seed database with sample educational content"""
    with app.app_context():
        # Get or create test user
        user = User.query.filter_by(username='testuser').first()
        if not user:
            print("Test user not found. Please run init_db.py first.")
            return
        
        # Sample educational content
        sample_content = [
            {
                'title': 'Introduction to Network Analysis - Kirchhoff\'s Laws',
                'description': 'Comprehensive tutorial on network analysis covering KCL and KVL with practical examples.',
                'source': 'youtube',
                'source_id': 'dQw4w9WgXcQ',
                'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'subject_focus': 'ECE/Network Analysis',
                'is_approved': True,
                'is_filtered': False
            },
            {
                'title': 'Circuit Theory Fundamentals - Node Analysis',
                'description': 'Learn the fundamentals of circuit theory and node analysis techniques.',
                'source': 'youtube',
                'source_id': 'jNQXAC9IVRw',
                'url': 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                'subject_focus': 'ECE/Circuit Theory',
                'is_approved': True,
                'is_filtered': False
            },
            {
                'title': 'Data Structures and Algorithms - Binary Trees',
                'description': 'Deep dive into binary tree data structures and traversal algorithms.',
                'source': 'youtube',
                'source_id': 'example123',
                'url': 'https://www.youtube.com/watch?v=example123',
                'subject_focus': 'CS/Data Structures',
                'is_approved': True,
                'is_filtered': False
            }
        ]
        
        print("Seeding content items...")
        added_count = 0
        
        for content_data in sample_content:
            # Check if content already exists
            existing = ContentItem.query.filter_by(
                source_id=content_data['source_id'],
                source=content_data['source']
            ).first()
            
            if not existing:
                content = ContentItem(**content_data)
                db.session.add(content)
                added_count += 1
                print(f"  ✓ Added: {content_data['title']}")
            else:
                print(f"  - Skipped (exists): {content_data['title']}")
        
        db.session.commit()
        print(f"\n✓ Seeded {added_count} new content items")

if __name__ == '__main__':
    seed_content()


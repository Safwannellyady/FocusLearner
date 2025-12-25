"""
FocusLearner Pro - Lecture Routes
API endpoints for managing user-created lectures
"""

from flask import Blueprint, request, jsonify
import sys
import os
import json

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import Lecture, db
from utils.auth import token_required
from services.ai_service import AIService

lecture_routes = Blueprint('lecture', __name__, url_prefix='/api/lectures')
ai_service = AIService()


@lecture_routes.route('/', methods=['GET'])
@token_required
def get_lectures():
    """Get all lectures for current user"""
    user_id = request.current_user_id
    lectures = Lecture.query.filter_by(user_id=user_id, is_active=True).all()
    
    return jsonify({
        'lectures': [lecture.to_dict() for lecture in lectures],
        'count': len(lectures)
    }), 200


@lecture_routes.route('/', methods=['POST'])
@token_required
def create_lecture():
    """Create a new lecture"""
    user_id = request.current_user_id
    data = request.get_json()
    
    title = data.get('title')
    subject = data.get('subject')
    topic = data.get('topic')
    description = data.get('description', '')
    video_ids = data.get('video_ids', [])
    
    if not title or not subject or not topic:
        return jsonify({'error': 'Title, subject, and topic are required'}), 400
    
    # Auto-generate content if no videos provided
    if not video_ids:
        print(f"Auto-generating content for: {subject} - {topic}")
        from services.youtube_service import YouTubeService
        youtube_service = YouTubeService()
        
        # Construct a targeted query
        query = f"{topic} lecture tutorial"
        
        # Search for videos
        videos = youtube_service.search_videos(query, subject_focus=subject, max_results=5)
        
        # Extract IDs
        video_ids = [v['video_id'] for v in videos]
        print(f"Found {len(video_ids)} videos: {video_ids}")

    lecture = Lecture(
        user_id=user_id,
        title=title,
        subject=subject,
        topic=topic,
        description=description,
        video_ids=json.dumps(video_ids) if video_ids else None
    )
    
    db.session.add(lecture)
    db.session.commit()
    
    return jsonify({
        'message': 'Lecture created successfully',
        'lecture': lecture.to_dict()
    }), 201


@lecture_routes.route('/<int:lecture_id>', methods=['GET'])
@token_required
def get_lecture(lecture_id):
    """Get a specific lecture"""
    user_id = request.current_user_id
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    
    if not lecture:
        return jsonify({'error': 'Lecture not found'}), 404
    
    return jsonify({'lecture': lecture.to_dict()}), 200


@lecture_routes.route('/<int:lecture_id>', methods=['PUT'])
@token_required
def update_lecture(lecture_id):
    """Update a lecture"""
    user_id = request.current_user_id
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    
    if not lecture:
        return jsonify({'error': 'Lecture not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        lecture.title = data['title']
    if 'subject' in data:
        lecture.subject = data['subject']
    if 'topic' in data:
        lecture.topic = data['topic']
    if 'description' in data:
        lecture.description = data['description']
    if 'video_ids' in data:
        lecture.video_ids = json.dumps(data['video_ids']) if data['video_ids'] else None
    
    db.session.commit()
    
    return jsonify({
        'message': 'Lecture updated successfully',
        'lecture': lecture.to_dict()
    }), 200


@lecture_routes.route('/<int:lecture_id>', methods=['DELETE'])
@token_required
def delete_lecture(lecture_id):
    """Delete (deactivate) a lecture"""
    user_id = request.current_user_id
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    
    if not lecture:
        return jsonify({'error': 'Lecture not found'}), 404
    
    lecture.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Lecture deleted successfully'}), 200


@lecture_routes.route('/quiz/generate', methods=['POST'])
@token_required
def generate_quiz():
    """Generate an AI quiz for a topic"""
    data = request.get_json()
    subject = data.get('subject')
    topic = data.get('topic')
    count = data.get('count', 5)
    
    if not subject or not topic:
        return jsonify({'error': 'Subject and topic are required'}), 400
        
    try:
        quiz = ai_service.generate_quiz(subject, topic, count)
        return jsonify({'quiz': quiz}), 200
    except Exception as e:
        print(f"Quiz generation error: {e}")
        return jsonify({'error': 'Failed to generate quiz'}), 500


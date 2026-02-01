"""
FocusLearner Pro - Lecture Routes
API endpoints for managing user-created lectures
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import sys
import os
import json

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import Lecture, LearningIntent, Course, db
from utils.auth import token_required
from services.ai_service import AIService
from services.learning_loop_service import LearningLoopService

lecture_routes = Blueprint('lecture', __name__, url_prefix='/api/lectures')
ai_service = AIService()
loop_service = LearningLoopService()


@lecture_routes.route('/courses', methods=['GET'])
@token_required
def get_courses():
    """Get all courses for current user"""
    user_id = request.current_user_id
    courses = Course.query.filter_by(user_id=user_id).order_by(Course.created_at.desc()).all()
    
    return jsonify({
        'courses': [course.to_dict() for course in courses],
        'count': len(courses)
    }), 200


@lecture_routes.route('/courses', methods=['POST'])
@token_required
def create_course():
    """Create a new course (Class/Book)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = request.current_user_id
        title = data.get('title', '').strip()
        subject = data.get('subject', '').strip()
        description = data.get('description', '').strip()
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        if not subject:
            return jsonify({'error': 'Subject is required'}), 400
        
        if len(title) > 200:
            return jsonify({'error': 'Title must be less than 200 characters'}), 400
        
        course = Course(
            user_id=user_id,
            title=title,
            subject=subject,
            description=description if description else None
        )
        
        db.session.add(course)
        db.session.commit()
        
        current_app.logger.info(f'Course created: user={user_id}, title={title}')
        
        return jsonify({
            'message': 'Course created successfully',
            'course': course.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Error creating course: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Failed to create course'}), 500


@lecture_routes.route('/', methods=['GET'])
@token_required
def get_lectures():
    """Get all lectures for current user"""
    user_id = request.current_user_id
    course_id = request.args.get('course_id')
    
    query = Lecture.query.filter_by(user_id=user_id, is_active=True)
    if course_id:
        query = query.filter_by(course_id=course_id)
        
    lectures = query.order_by(Lecture.created_at.desc()).all()
    
    return jsonify({
        'lectures': [lecture.to_dict() for lecture in lectures],
        'count': len(lectures)
    }), 200


@lecture_routes.route('/', methods=['POST'])
@token_required
def create_lecture():
    """Create a new lecture"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = request.current_user_id
        course_id = data.get('course_id')
        title = data.get('title', '').strip()
        subject = data.get('subject', '').strip()
        topic = data.get('topic', '').strip()
        description = data.get('description', '').strip()
        video_ids = data.get('video_ids', [])
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        if not subject:
            return jsonify({'error': 'Subject is required'}), 400
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        # Validate course_id if provided
        if course_id:
            course = Course.query.filter_by(id=course_id, user_id=user_id).first()
            if not course:
                return jsonify({'error': 'Course not found'}), 404
        
        # Validate video_ids
        if video_ids and not isinstance(video_ids, list):
            return jsonify({'error': 'video_ids must be a list'}), 400
        
        # Auto-generate content if no videos provided
        if not video_ids:
            current_app.logger.info(f"Auto-generating content for: {subject} - {topic}")
            from services.youtube_service import YouTubeService
            youtube_service = YouTubeService()
            
            # Construct a targeted query
            query = f"{topic} lecture tutorial"
            
            # Search for videos
            videos = youtube_service.search_videos(query, subject_focus=subject, max_results=5)
            
            # Extract IDs
            video_ids = [v.get('video_id') for v in videos if v.get('video_id')]
            current_app.logger.info(f"Found {len(video_ids)} videos for lecture")

        # Look up Learning Intent
        intent = LearningIntent.query.filter_by(subject=subject, topic=topic).first()
        intent_id = intent.id if intent else None

        lecture = Lecture(
            user_id=user_id,
            course_id=course_id if course_id else None,
            title=title,
            subject=subject,
            topic=topic,
            description=description if description else None,
            video_ids=json.dumps(video_ids) if video_ids else None,
            learning_intent_id=intent_id
        )
        
        db.session.add(lecture)
        db.session.commit()
        
        current_app.logger.info(f'Lecture created: user={user_id}, title={title}')
        
        return jsonify({
            'message': 'Lecture created successfully',
            'lecture': lecture.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Error creating lecture: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Failed to create lecture'}), 500


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
    try:
        user_id = request.current_user_id
        lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
        
        if not lecture:
            return jsonify({'error': 'Lecture not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        updated = False
        
        if 'title' in data:
            title = data['title'].strip() if data['title'] else None
            if title and title != lecture.title:
                lecture.title = title
                updated = True
        
        if 'subject' in data:
            subject = data['subject'].strip() if data['subject'] else None
            if subject and subject != lecture.subject:
                lecture.subject = subject
                updated = True
        
        if 'topic' in data:
            topic = data['topic'].strip() if data['topic'] else None
            if topic and topic != lecture.topic:
                lecture.topic = topic
                updated = True
        
        if 'description' in data:
            description = data['description'].strip() if data['description'] else None
            if description != lecture.description:
                lecture.description = description
                updated = True
        
        if 'video_ids' in data:
            video_ids = data['video_ids']
            if not isinstance(video_ids, list):
                return jsonify({'error': 'video_ids must be a list'}), 400
            new_video_ids = json.dumps(video_ids) if video_ids else None
            if new_video_ids != lecture.video_ids:
                lecture.video_ids = new_video_ids
                updated = True
        
        if updated:
            lecture.updated_at = datetime.utcnow()
            db.session.commit()
            current_app.logger.info(f'Lecture updated: user={user_id}, lecture_id={lecture_id}')
        
        return jsonify({
            'message': 'Lecture updated successfully',
            'lecture': lecture.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error updating lecture: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Failed to update lecture'}), 500


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
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        subject = data.get('subject', '').strip()
        topic = data.get('topic', '').strip()
        count = data.get('count', 5)
        
        if not subject:
            return jsonify({'error': 'Subject is required'}), 400
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        if not isinstance(count, int) or count < 1 or count > 20:
            return jsonify({'error': 'Count must be between 1 and 20'}), 400
        
        quiz = ai_service.generate_quiz(subject, topic, count)
        
        current_app.logger.info(f'Quiz generated: subject={subject}, topic={topic}, count={count}')
        
        return jsonify({'quiz': quiz}), 200
        
    except Exception as e:
        current_app.logger.error(f'Quiz generation error: {e}', exc_info=True)
        return jsonify({'error': 'Failed to generate quiz'}), 500


@lecture_routes.route('/<int:lecture_id>/complete', methods=['POST'])
@token_required
def complete_lecture(lecture_id):
    """Mark lecture as complete and advance learning loop"""
    try:
        user_id = request.current_user_id
        lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id, is_active=True).first()
        
        if not lecture:
            return jsonify({'error': 'Lecture not found'}), 404
        
        loop_status = None
        if lecture.learning_intent_id:
            loop_status = loop_service.update_stage(user_id, lecture.learning_intent_id, success=True)
        
        current_app.logger.info(f'Lecture completed: user={user_id}, lecture_id={lecture_id}')
        
        return jsonify({
            'message': 'Lecture completed',
            'loop_status': loop_status
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error completing lecture: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Failed to complete lecture'}), 500

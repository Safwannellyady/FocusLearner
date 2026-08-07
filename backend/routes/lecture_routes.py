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

from models import Lecture, LearningIntent, Course, db
from utils.auth import token_required
from services.ai_service import AIService

lecture_routes = Blueprint('lecture', __name__, url_prefix='/api/lectures')
ai_service = AIService()


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
    user_id = request.current_user_id
    data = request.get_json()
    
    title = data.get('title')
    subject = data.get('subject')
    description = data.get('description', '')
    
    if not title or not subject:
        return jsonify({'error': 'Title and subject are required'}), 400
        
    course = Course(
        user_id=user_id,
        title=title,
        subject=subject,
        description=description
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'message': 'Course created successfully',
        'course': course.to_dict()
    }), 201


@lecture_routes.route('/courses/<int:course_id>', methods=['PUT'])
@token_required
def update_course(course_id):
    """Update a course"""
    user_id = request.current_user_id
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
        
    data = request.get_json()
    
    if 'title' in data:
        course.title = data['title']
    if 'subject' in data:
        course.subject = data['subject']
    if 'description' in data:
        course.description = data['description']
        
    db.session.commit()
    
    return jsonify({
        'message': 'Course updated successfully',
        'course': course.to_dict()
    }), 200


@lecture_routes.route('/courses/<int:course_id>', methods=['DELETE'])
@token_required
def delete_course(course_id):
    """Delete a course"""
    user_id = request.current_user_id
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted successfully'}), 200


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
    """Create a new lecture with safe fallbacks"""
    try:
        user_id = request.current_user_id
        data = request.get_json() or {}
        
        course_id = data.get('course_id')
        title = data.get('title')
        subject = data.get('subject')
        topic = data.get('topic')
        description = data.get('description', '')
        video_ids = data.get('video_ids', [])
        
        if not title or not subject or not topic:
            return jsonify({'error': 'Title, subject, and topic are required'}), 400
        
        # Auto-generate content if no videos provided
        if not video_ids:
            try:
                print(f"Auto-generating content for: {subject} - {topic}")
                from services.youtube_service import YouTubeService
                youtube_service = YouTubeService()
                videos = youtube_service.search_videos(topic, subject_focus=subject, max_results=5)
                video_ids = [v['video_id'] for v in videos if 'video_id' in v]
            except Exception as yt_err:
                print(f"YouTube search warning: {yt_err}")
                video_ids = []

        # Look up Learning Intent safely
        intent_id = None
        try:
            intent = LearningIntent.query.filter_by(subject=subject, topic=topic).first()
            if intent:
                intent_id = intent.id
        except Exception as int_err:
            print(f"Intent lookup warning: {int_err}")

        # Deep-learn user session details safely with fallback
        deep_learned_suite = {}
        try:
            deep_learned_suite = ai_service.deep_learn_session(title, subject, topic, description) or {}
        except Exception as ai_err:
            print(f"AI Deep-learn fallback warning: {ai_err}")

        lecture = Lecture(
            user_id=user_id,
            course_id=course_id,
            title=title,
            subject=subject,
            topic=topic,
            description=description,
            video_ids=json.dumps(video_ids) if video_ids else None,
            lab_config=json.dumps(deep_learned_suite.get('lab_config')) if deep_learned_suite.get('lab_config') else None,
            game_config=json.dumps(deep_learned_suite.get('game_config')) if deep_learned_suite.get('game_config') else None,
            quiz_config=json.dumps(deep_learned_suite.get('quiz_config')) if deep_learned_suite.get('quiz_config') else None,
            learning_intent_id=intent_id
        )
        
        db.session.add(lecture)
        db.session.commit()
        
        return jsonify({
            'message': 'Lecture created successfully',
            'lecture': lecture.to_dict()
        }), 201

    except Exception as e:
        print(f"Error in create_lecture: {e}")
        db.session.rollback()
        return jsonify({'error': f'Failed to create lecture: {str(e)}'}), 500



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
    video_context = data.get('video_context')
    
    print(f"[DEBUG] generate_quiz called with subject={subject}, topic={topic}, video_context={video_context}")
    
    if not subject or not topic:
        return jsonify({'error': 'Subject and topic are required'}), 400
        
    try:
        quiz = ai_service.generate_quiz(subject, topic, count, video_context)
        return jsonify({'quiz': quiz}), 200
    except Exception as e:
        print(f"Quiz generation error: {e}")
        return jsonify({'error': 'Failed to generate quiz'}), 500


from datetime import datetime
from models import ActivityResult
from services.learning_loop_service import LearningLoopService
loop_service = LearningLoopService()

@lecture_routes.route('/<int:lecture_id>/complete', methods=['POST'])
@token_required
def complete_lecture(lecture_id):
    """Mark lecture as complete, award scaled XP based on study time, and advance learning loop"""
    user_id = request.current_user_id
    lecture = Lecture.query.filter_by(id=lecture_id, user_id=user_id).first()
    
    if not lecture:
        return jsonify({'error': 'Lecture not found'}), 404
        
    data = request.get_json() or {}
    elapsed_minutes = data.get('elapsed_minutes', 30)
    try:
        elapsed_minutes = int(elapsed_minutes)
    except (ValueError, TypeError):
        elapsed_minutes = 30
        
    if elapsed_minutes < 30:
        return jsonify({'error': 'Minimum 30 minutes required to complete session'}), 400

    # Calculate scaled XP reward
    if elapsed_minutes >= 90:
        xp_earned = 650
        label = "Elite Focus!"
    elif elapsed_minutes >= 60:
        xp_earned = 400
        label = "Brilliant!"
    elif elapsed_minutes >= 45:
        xp_earned = 250
        label = "Deep Focus!"
    else:
        xp_earned = 150
        label = "Solid Session!"

    lecture.is_completed = True
    lecture.completed_at = datetime.utcnow()
    lecture.study_minutes_logged = elapsed_minutes
    
    # Save activity result for XP credit
    act = ActivityResult(
        user_id=user_id,
        module_id="focus_session",
        score=100,
        xp_earned=xp_earned,
        summary=f"Completed {lecture.subject}: {lecture.topic} ({elapsed_minutes}m) - {label}"
    )
    db.session.add(act)

    loop_status = None
    if lecture.learning_intent_id:
        loop_status = loop_service.update_stage(user_id, lecture.learning_intent_id, success=True)
        
    db.session.commit()
    
    return jsonify({
        'message': 'Lecture completed successfully',
        'xp_earned': xp_earned,
        'label': label,
        'elapsed_minutes': elapsed_minutes,
        'lecture': lecture.to_dict(),
        'loop_status': loop_status
    }), 200

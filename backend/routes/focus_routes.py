"""
FocusLearner Pro - Focus Session Routes
API endpoints for managing focus sessions and focus lock
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import FocusSession, User, db
from services.youtube_service import YouTubeService
from utils.auth import token_required

focus_routes = Blueprint('focus', __name__, url_prefix='/api/focus')
youtube_service = YouTubeService()


@focus_routes.route('/lock', methods=['POST'])
@token_required
def lock_focus():
    """Lock a focus session with a specific subject"""
    data = request.get_json()
    user_id = request.current_user_id
    subject_focus = data.get('subject_focus')
    
    if not subject_focus:
        return jsonify({'error': 'subject_focus is required'}), 400
    
    # Verify user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # End any existing active sessions
    active_sessions = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).all()
    
    for session in active_sessions:
        session.is_locked = False
        session.ended_at = datetime.utcnow()
    
    # Create new focus session
    new_session = FocusSession(
        user_id=user_id,
        subject_focus=subject_focus,
        is_locked=True
    )
    
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({
        'message': 'Focus locked successfully',
        'session': new_session.to_dict()
    }), 201


@focus_routes.route('/unlock', methods=['POST'])
@token_required
def unlock_focus():
    """Unlock the current focus session"""
    user_id = request.current_user_id
    
    # Find active session
    session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    if not session:
        return jsonify({'error': 'No active focus session found'}), 404
    
    session.is_locked = False
    session.ended_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Focus unlocked successfully',
        'session': session.to_dict()
    }), 200


@focus_routes.route('/current', methods=['GET'])
@token_required
def get_current_focus():
    """Get the current active focus session"""
    user_id = request.current_user_id
    
    session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    if not session:
        return jsonify({
            'message': 'No active focus session',
            'session': None
        }), 200
    
    return jsonify({
        'session': session.to_dict()
    }), 200


@focus_routes.route('/update-video', methods=['POST'])
@token_required
def update_current_video():
    """Update the current video being watched in the focus session"""
    data = request.get_json()
    user_id = request.current_user_id
    video_id = data.get('video_id')
    timestamp = data.get('timestamp', 0)
    
    session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    if not session:
        return jsonify({'error': 'No active focus session found'}), 404
    
    session.current_video_id = video_id
    session.current_timestamp = timestamp
    db.session.commit()
    
    return jsonify({
        'message': 'Video updated successfully',
        'session': session.to_dict()
    }), 200


@focus_routes.route('/content', methods=['GET'])
@token_required
def get_focused_content():
    """Get filtered content for the current focus session"""
    user_id = request.current_user_id
    query = request.args.get('query', '')
    
    session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    if not session:
        return jsonify({'error': 'No active focus session found'}), 404
    
    # Get filtered YouTube videos
    videos = youtube_service.search_videos(
        query=query or session.subject_focus,
        subject_focus=session.subject_focus,
        max_results=10
    )
    
    return jsonify({
        'subject_focus': session.subject_focus,
        'videos': videos,
        'count': len(videos)
    }), 200


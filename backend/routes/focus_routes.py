"""
FocusLearner Pro - Focus Session Routes
API endpoints for managing focus sessions and focus lock
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
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

# Initialize Analytics Service
from services.analytics_service import AnalyticsService
analytics_service = AnalyticsService()

@focus_routes.route('/analytics/summary', methods=['GET'])
@token_required
def get_analytics_summary():
    """Get aggregated analytics for dashboard"""
    user_id = request.current_user_id
    
    try:
        trends = analytics_service.get_weekly_focus_trends(user_id)
        distribution = analytics_service.get_subject_distribution(user_id)
        
        return jsonify({
            'trends': trends,
            'distribution': distribution
        }), 200
    except Exception as e:
        print(f"Analytics Error: {e}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500


# Distraction Logging Endpoints
from models import DistractionLog

@focus_routes.route('/distraction/log', methods=['POST'])
@token_required
def log_distraction():
    """Log a completed distraction event"""
    data = request.get_json()
    user_id = request.current_user_id
    
    duration = data.get('duration')
    reason = data.get('reason', 'tab_switch')
    timestamp = data.get('timestamp') # ISO string
    
    # Get current active session if any
    active_session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    log = DistractionLog(
        user_id=user_id,
        focus_session_id=active_session.id if active_session else None,
        duration=duration,
        reason=reason,
        started_at=datetime.fromisoformat(timestamp.replace('Z', '+00:00')) if timestamp else datetime.utcnow()
    )
    # If we have duration, set ended_at based on started_at + duration
    if duration:
        log.ended_at = log.started_at + timedelta(seconds=duration)
        
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Distraction logged', 'log': log.to_dict()}), 201


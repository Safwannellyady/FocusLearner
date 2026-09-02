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
    """Lock a focus session with a specific subject, topic, and lab"""
    data = request.get_json() or {}
    user_id = request.current_user_id
    subject_focus = data.get('subject_focus') or data.get('subjectFocus') or 'General Science'
    topic = data.get('topic') or data.get('title') or ''
    selected_lab = data.get('selected_lab') or data.get('selectedLab') or ''
    duration_minutes = data.get('duration_minutes') or data.get('duration') or 30
    youtube_id = data.get('youtube_id') or data.get('youtubeId') or ''
    
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
    
    # Create new focus session immediately in PostgreSQL
    new_session = FocusSession(
        user_id=user_id,
        subject_focus=subject_focus,
        topic=topic,
        selected_lab=selected_lab,
        duration_minutes=int(duration_minutes),
        current_video_id=youtube_id,
        is_locked=True,
        status='active'
    )
    
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({
        'message': 'Focus locked & saved successfully',
        'session': new_session.to_dict()
    }), 201


@focus_routes.route('/autosave', methods=['POST'])
@token_required
def autosave_session():
    """Autosave session progress incrementally every 30s"""
    data = request.get_json() or {}
    user_id = request.current_user_id
    session_id = data.get('session_id') or data.get('sessionId')
    elapsed_seconds = data.get('elapsed_seconds') or data.get('elapsedSec') or 0
    notes = data.get('notes') or ''
    selected_lab = data.get('selected_lab') or data.get('selectedLab')
    video_id = data.get('video_id') or data.get('videoId')
    timestamp = data.get('timestamp') or 0

    session = None
    if session_id:
        session = FocusSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        session = FocusSession.query.filter_by(user_id=user_id, is_locked=True).first()

    if not session:
        return jsonify({'error': 'No active session found'}), 404

    session.elapsed_seconds = int(elapsed_seconds)
    if notes:
        session.notes = notes
    if selected_lab:
        session.selected_lab = selected_lab
    if video_id:
        session.current_video_id = video_id
    if timestamp:
        session.current_timestamp = int(timestamp)

    db.session.commit()
    return jsonify({'message': 'Autosaved successfully', 'session': session.to_dict()}), 200


@focus_routes.route('/sessions', methods=['GET'])
@token_required
def get_user_sessions():
    """Get all focus sessions for current user"""
    user_id = request.current_user_id
    sessions = FocusSession.query.filter_by(user_id=user_id)\
        .order_by(FocusSession.started_at.desc()).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]}), 200


@focus_routes.route('/<int:session_id>', methods=['PUT'])
@token_required
def update_session(session_id):
    """Modify session metadata (title, topic, subject, lab, duration)"""
    user_id = request.current_user_id
    session = FocusSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    data = request.get_json() or {}
    if 'topic' in data:
        session.topic = data['topic']
    if 'subject_focus' in data or 'subjectFocus' in data:
        session.subject_focus = data.get('subject_focus') or data.get('subjectFocus')
    if 'selected_lab' in data or 'selectedLab' in data:
        session.selected_lab = data.get('selected_lab') or data.get('selectedLab')
    if 'duration_minutes' in data or 'duration' in data:
        session.duration_minutes = int(data.get('duration_minutes') or data.get('duration'))
    if 'notes' in data:
        session.notes = data['notes']

    db.session.commit()
    return jsonify({'message': 'Session updated successfully', 'session': session.to_dict()}), 200


@focus_routes.route('/<int:session_id>', methods=['DELETE'])
@token_required
def delete_session(session_id):
    """Delete focus session from PostgreSQL (supports instant creation undo & 3-dots delete)"""
    user_id = request.current_user_id
    session = FocusSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully', 'id': session_id}), 200



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
    data = request.get_json() or {}
    user_id = request.current_user_id
    video_id = data.get('video_id') or data.get('videoId')
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
    """Get filtered content for the current focus session or custom search query"""
    user_id = request.current_user_id
    query = request.args.get('query', '').strip()
    requested_subject = request.args.get('subject_focus', '').strip()
    
    session = FocusSession.query.filter_by(
        user_id=user_id,
        is_locked=True
    ).first()
    
    # The browser keeps the current session's intended subject.  Accept it as
    # a fallback for resumed sessions where the active-session record no longer
    # exists, rather than treating a topic-only query as the whole subject.
    subject_focus = session.subject_focus if session else (requested_subject or query or "General Science")
    search_term = query or subject_focus
    
    # Get filtered YouTube videos (up to 20 items)
    videos = youtube_service.search_videos(
        query=search_term,
        subject_focus=subject_focus,
        max_results=20
    )
    
    return jsonify({
        'subject_focus': subject_focus,
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
        totals = analytics_service.get_user_totals(user_id)
        
        return jsonify({
            'trends': trends,
            'distribution': distribution,
            'streak_days': totals['streak_days'],
            'total_hours': totals['total_hours'],
            'total_sessions': totals['total_sessions'],
            'total_xp': totals['total_xp'],
            'today_xp': totals['today_xp']
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
    data = request.get_json() or {}
    user_id = request.current_user_id
    
    duration = data.get('duration', 0)
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


@focus_routes.route('/recommendation', methods=['GET'])
@token_required
def get_focus_recommendation():
    """AI-driven Smart Pomodoro recommendations based on recent distraction patterns and streak"""
    user_id = request.current_user_id
    
    # Check distraction logs in the past 24 hours
    twenty_four_hrs_ago = datetime.utcnow() - timedelta(hours=24)
    recent_distractions = DistractionLog.query.filter(
        DistractionLog.user_id == user_id,
        DistractionLog.started_at >= twenty_four_hrs_ago
    ).count()
    
    total_duration_distracted = db.session.query(db.func.sum(DistractionLog.duration)).filter(
        DistractionLog.user_id == user_id,
        DistractionLog.started_at >= twenty_four_hrs_ago
    ).scalar() or 0
    
    if recent_distractions > 5 or total_duration_distracted > 300:
        recommendation = {
            'sprint_minutes': 15,
            'break_minutes': 5,
            'mode': 'Cognitive Recovery Sprint',
            'soundscape': 'Lo-Fi Ambient Beats',
            'reasoning': 'High recent context-switching detected. A shorter 15-minute focused sprint will help reset attention cadence.'
        }
    elif recent_distractions == 0:
        recommendation = {
            'sprint_minutes': 50,
            'break_minutes': 10,
            'mode': 'Deep Work Flow State',
            'soundscape': 'Binaural Theta Waves (6Hz)',
            'reasoning': 'Zero distractions logged today! Your focus cadence is primed for a 50-minute deep engineering block.'
        }
    else:
        recommendation = {
            'sprint_minutes': 25,
            'break_minutes': 5,
            'mode': 'Standard Pomodoro Sprint',
            'soundscape': 'Soft White Noise & Rain',
            'reasoning': 'Balanced attention cadence. 25 minutes of high-density focus followed by a 5-minute consolidation break.'
        }
        
    return jsonify({
        'recommendation': recommendation,
        'metrics': {
            'recent_distraction_count': recent_distractions,
            'distraction_seconds_24h': total_duration_distracted
        }
    }), 200


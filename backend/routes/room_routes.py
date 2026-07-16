"""
FocusLearner Pro v2.0 - Multiplayer Study Rooms & Discussion API
Handles room creation, joining, live participant focus status, scheduled review sessions, and class chats.
"""

from flask import Blueprint, request, jsonify
from utils.auth import token_required
from models import db, StudyRoom, StudyRoomParticipant, ScheduledDiscussion, RoomMessage, User
import random, string
from datetime import datetime

room_routes = Blueprint('rooms', __name__, url_prefix='/api/rooms')

def generate_room_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@room_routes.route('/create', methods=['POST'])
@token_required
def create_room():
    """Create a new multiplayer study room"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    title = data.get('title', 'Engineering Focus Arena')
    subject_focus = data.get('subject_focus', 'Math/Linear Algebra')
    target_duration = int(data.get('target_duration', 25))
    
    # Generate unique code
    code = generate_room_code()
    while StudyRoom.query.filter_by(room_code=code).first():
        code = generate_room_code()
        
    room = StudyRoom(
        room_code=code,
        title=title,
        subject_focus=subject_focus,
        target_duration=target_duration,
        created_by=user_id,
        is_active=True
    )
    db.session.add(room)
    db.session.commit()
    
    # Add creator as first participant
    participant = StudyRoomParticipant(
        room_id=room.id,
        user_id=user_id,
        is_focused=True,
        current_streak=1
    )
    db.session.add(participant)
    db.session.commit()
    
    return jsonify({
        'message': 'Study Room created successfully',
        'room': room.to_dict(include_participants=True)
    }), 201

@room_routes.route('/join', methods=['POST'])
@token_required
def join_room():
    """Join an existing study room using room code"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    code = (data.get('room_code') or '').strip().upper()
    if not code:
        return jsonify({'error': 'room_code is required'}), 400
        
    room = StudyRoom.query.filter_by(room_code=code).first()
    if not room or not room.is_active:
        return jsonify({'error': 'Study room not found or inactive'}), 404
        
    participant = StudyRoomParticipant.query.filter_by(room_id=room.id, user_id=user_id).first()
    if not participant:
        participant = StudyRoomParticipant(
            room_id=room.id,
            user_id=user_id,
            is_focused=True,
            current_streak=1
        )
        db.session.add(participant)
    else:
        participant.last_active_at = datetime.utcnow()
        participant.is_focused = True
        
    db.session.commit()
    
    return jsonify({
        'message': 'Joined study room successfully',
        'room': room.to_dict(include_participants=True)
    }), 200

@room_routes.route('/<code>/status', methods=['GET'])
@token_required
def get_room_status(code):
    """Retrieve live status of a study room, its participants, and scheduled discussions"""
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404
        
    return jsonify({
        'room': room.to_dict(include_participants=True)
    }), 200

@room_routes.route('/<code>/schedule_review', methods=['POST'])
@token_required
def schedule_review(code):
    """Schedule an after-study review/discussion session with classmates"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404
        
    title = data.get('title', 'Post-Study Quiz & Concept Review')
    topic_summary = data.get('topic_summary', '')
    scheduled_at_str = data.get('scheduled_at')
    
    if not scheduled_at_str:
        return jsonify({'error': 'scheduled_at timestamp is required'}), 400
        
    try:
        scheduled_at = datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
    except Exception:
        return jsonify({'error': 'Invalid ISO format for scheduled_at'}), 400
        
    discussion = ScheduledDiscussion(
        room_id=room.id,
        title=title,
        topic_summary=topic_summary,
        scheduled_at=scheduled_at.replace(tzinfo=None),
        created_by=user_id
    )
    db.session.add(discussion)
    db.session.commit()
    
    return jsonify({
        'message': 'Scheduled review session added successfully',
        'discussion': discussion.to_dict()
    }), 201

@room_routes.route('/<code>/messages', methods=['GET'])
@token_required
def get_messages(code):
    """Get discussion room chat messages"""
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404
        
    messages = RoomMessage.query.filter_by(room_id=room.id).order_by(RoomMessage.created_at.asc()).limit(100).all()
    return jsonify({
        'messages': [m.to_dict() for m in messages]
    }), 200

@room_routes.route('/<code>/messages', methods=['POST'])
@token_required
def send_message(code):
    """Send a chat/review note inside the study room"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404
        
    message_text = data.get('message', '').strip()
    is_review = bool(data.get('is_review_note', False))
    
    if not message_text:
        return jsonify({'error': 'message text is required'}), 400
        
    msg = RoomMessage(
        room_id=room.id,
        user_id=user_id,
        message=message_text,
        is_review_note=is_review
    )
    db.session.add(msg)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'chat_message': msg.to_dict()
    }), 201

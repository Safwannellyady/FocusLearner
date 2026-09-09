"""
FocusLearner Pro v2.0 - Multiplayer Study Rooms & Discussion API
Handles room creation, joining, live participant focus status, scheduled review sessions, and class chats.
"""

from flask import Blueprint, request, jsonify, current_app
from utils.auth import token_required
from models import db, StudyRoom, StudyRoomParticipant, ScheduledDiscussion, RoomMessage, User, RoomInvite
import random, string
from datetime import datetime
import os, uuid, shutil, tempfile

room_routes = Blueprint('rooms', __name__, url_prefix='/api/rooms')

UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'focuslearner_rooms')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MAX_MESSAGES_PER_ROOM = 60  # hard cap to prevent glitching

def generate_room_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def _save_upload(file_storage, allowed_types):
    """Save an uploaded file to temp storage. Returns (url, filename, filetype)."""
    ext = os.path.splitext(file_storage.filename or 'file')[1].lower()
    fname = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_FOLDER, fname)
    file_storage.save(path)
    return f"/uploads/rooms/{fname}", file_storage.filename or fname, allowed_types


@room_routes.route('/create', methods=['POST'])
@token_required
def create_room():
    """Create a new private study room (invite-only)."""
    user_id = request.current_user_id
    data = request.get_json() or {}

    title = data.get('title', 'Engineering Focus Arena')
    avatar = data.get('avatar', '📚')
    subject_focus = data.get('subject_focus', 'Math/Linear Algebra')
    is_private = bool(data.get('is_private', True))

    # Generate unique code
    code = generate_room_code()
    while StudyRoom.query.filter_by(room_code=code).first():
        code = generate_room_code()

    room = StudyRoom(
        room_code=code,
        title=title,
        avatar=avatar,
        subject_focus=subject_focus,
        is_private=is_private,
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


@room_routes.route('/<code>/invite', methods=['POST'])
@token_required
def invite_user(code):
    """Invite a user by username to a private study room"""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # Only creator or existing participant can invite
    is_member = room.created_by == user_id or StudyRoomParticipant.query.filter_by(
        room_id=room.id, user_id=user_id).first() is not None
    if not is_member:
        return jsonify({'error': 'Only room members can invite'}), 403

    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    if not username:
        return jsonify({'error': 'username is required'}), 400

    target_user = User.query.filter_by(username=username).first()
    if not target_user:
        return jsonify({'error': f'User "{username}" not found'}), 404
    if target_user.id == user_id:
        return jsonify({'error': 'Cannot invite yourself'}), 400

    existing = RoomInvite.query.filter_by(room_id=room.id, invited_user_id=target_user.id).first()
    if existing:
        if existing.status == 'pending':
            return jsonify({'error': f'{username} already has a pending invite'}), 409
        existing.status = 'pending'
        existing.invited_by_id = user_id
        existing.created_at = datetime.utcnow()
    else:
        invite = RoomInvite(
            room_id=room.id,
            invited_user_id=target_user.id,
            invited_by_id=user_id,
            status='pending'
        )
        db.session.add(invite)

    db.session.commit()
    return jsonify({
        'message': f'{username} invited to the room',
        'invited_username': username
    }), 200


@room_routes.route('/<code>/invites', methods=['GET'])
@token_required
def list_invites(code):
    """List pending and accepted invites for a room"""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    invites = RoomInvite.query.filter_by(room_id=room.id).all()
    result = []
    for inv in invites:
        d = inv.to_dict()
        d['invited_username'] = User.query.get(inv.invited_user_id).username if User.query.get(inv.invited_user_id) else None
        d['invited_by_username'] = User.query.get(inv.invited_by_id).username if User.query.get(inv.invited_by_id) else None
        result.append(d)
    return jsonify({'invites': result}), 200


@room_routes.route('/<code>/invites/<int:invite_id>', methods=['POST'])
@token_required
def respond_invite(code, invite_id):
    """Accept or decline a room invite"""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    invite = RoomInvite.query.filter_by(id=invite_id, invited_user_id=user_id).first()
    if not invite:
        return jsonify({'error': 'Invite not found'}), 404

    data = request.get_json() or {}
    action = data.get('action', '').strip().lower()
    if action not in ('accept', 'decline'):
        return jsonify({'error': 'action must be "accept" or "decline"'}), 400

    if action == 'accept':
        existing = StudyRoomParticipant.query.filter_by(room_id=room.id, user_id=user_id).first()
        if not existing:
            participant = StudyRoomParticipant(
                room_id=room.id,
                user_id=user_id,
                is_focused=True,
                current_streak=1
            )
            db.session.add(participant)
        invite.status = 'accepted'
    else:
        invite.status = 'declined'

    db.session.commit()
    return jsonify({
        'message': f'Invite {action}ed',
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


@room_routes.route('/<code>/settings', methods=['PUT'])
@token_required
def update_room_settings(code):
    """Modify room settings: title, avatar, privacy, name, security"""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    if room.created_by != user_id:
        return jsonify({'error': 'Only the room creator can modify settings'}), 403

    data = request.get_json() or {}
    if 'title' in data:
        room.title = str(data['title']).strip() or room.title
    if 'avatar' in data:
        room.avatar = str(data['avatar']) or room.avatar
    if 'is_private' in data:
        room.is_private = bool(data['is_private'])

    db.session.commit()
    return jsonify({
        'message': 'Room settings updated',
        'room': room.to_dict(include_participants=True)
    }), 200


@room_routes.route('/<code>', methods=['DELETE'])
@token_required
def delete_room(code):
    """Delete a study room (creator only). Cascades participants, messages, invites."""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    if room.created_by != user_id:
        return jsonify({'error': 'Only the room creator can delete this room'}), 403

    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Study room deleted'}), 200


@room_routes.route('/<code>/upload', methods=['POST'])
@token_required
def upload_room_file(code):
    """Upload an image or document to a study room. Returns a shareable URL."""
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if not file or not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    filename = (file.filename or '').lower()
    if any(filename.endswith(ext) for ext in ('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        filetype = 'image'
    elif any(filename.endswith(ext) for ext in ('.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx')):
        filetype = 'document'
    else:
        return jsonify({'error': 'Unsupported file type. Use image or document formats.'}), 400

    url, name, ftype = _save_upload(file, filetype)
    return jsonify({
        'url': url,
        'name': name,
        'type': ftype
    }), 200


@room_routes.route('/<code>/messages', methods=['GET'])
@token_required
def get_messages(code):
    """Get discussion room chat messages (capped at 60 to prevent glitching)"""
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    messages = RoomMessage.query.filter_by(room_id=room.id)\
        .order_by(RoomMessage.created_at.asc())\
        .limit(MAX_MESSAGES_PER_ROOM).all()
    return jsonify({
        'messages': [m.to_dict() for m in messages]
    }), 200


@room_routes.route('/<code>/messages', methods=['POST'])
@token_required
def send_message(code):
    """Send a chat message with optional image/document attachment"""
    user_id = request.current_user_id
    room = StudyRoom.query.filter_by(room_code=code.upper()).first()
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # Check message cap
    msg_count = RoomMessage.query.filter_by(room_id=room.id).count()
    if msg_count >= MAX_MESSAGES_PER_ROOM:
        return jsonify({
            'error': f'Message limit reached ({MAX_MESSAGES_PER_ROOM}). Delete old messages or create a new room.'
        }), 429

    message_text = (request.form.get('message') or '').strip()
    is_review = bool(request.form.get('is_review_note'))
    attachment_url = None
    attachment_name = None
    attachment_type = None

    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename:
            filename = (file.filename or '').lower()
            if any(filename.endswith(ext) for ext in ('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                attachment_type = 'image'
            elif any(filename.endswith(ext) for ext in ('.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx')):
                attachment_type = 'document'
            else:
                return jsonify({'error': 'Unsupported file type'}), 400
            attachment_url, attachment_name, attachment_type = _save_upload(file, attachment_type)

    if not message_text and not attachment_url:
        return jsonify({'error': 'Message text or attachment is required'}), 400

    msg = RoomMessage(
        room_id=room.id,
        user_id=user_id,
        message=message_text or None,
        is_review_note=is_review,
        attachment_url=attachment_url,
        attachment_name=attachment_name,
        attachment_type=attachment_type
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({
        'message': 'Message sent successfully',
        'chat_message': msg.to_dict()
    }), 201

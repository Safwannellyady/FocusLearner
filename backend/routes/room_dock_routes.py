"""
FocusLearner Pro v2.0 - Study Room Dock API
Docked documents, room todos, per-item comments, and dock activity feed.
"""

from flask import Blueprint, request, jsonify
from utils.auth import token_required
from models import (
    db, StudyRoom, StudyRoomParticipant, RoomMessage,
    DockedDocument, RoomTodo, DockedItemComment,
)

room_dock = Blueprint('room_dock', __name__, url_prefix='/api/rooms')

VALID_TODO_STATUSES = ('open', 'done')
VALID_ACTIVITY_KINDS = ('dock', 'comment', 'todo_done', 'tutor')


def _get_room(code):
    return StudyRoom.query.filter_by(room_code=(code or '').upper()).first()


def _room_or_404(code):
    room = _get_room(code)
    if not room:
        return None, (jsonify({'error': 'Room not found'}), 404)
    return room, None


def _is_room_member(room, user_id):
    """True if user is the room creator or an active participant."""
    if room.created_by == user_id:
        return True
    return StudyRoomParticipant.query.filter_by(room_id=room.id, user_id=user_id).first() is not None


def _validate_assignee(room, assignee_id):
    """Return (ok, error_response). assignee_id may be None (unassigned)."""
    if assignee_id is None:
        return True, None
    if not _is_room_member(room, assignee_id):
        return False, (jsonify({'error': 'Assignee must be a room participant'}), 400)
    return True, None


def _get_doc(room, doc_id):
    return DockedDocument.query.filter_by(id=doc_id, room_id=room.id).first()


def _get_todo(room, todo_id):
    return RoomTodo.query.filter_by(id=todo_id, room_id=room.id).first()


def _can_edit_doc(room, user_id, doc):
    return user_id == doc.created_by or user_id == room.created_by


def _can_edit_todo(room, user_id, todo):
    return user_id in (todo.created_by, room.created_by, todo.assignee_id)


# ---------------- Documents ----------------

@room_dock.route('/<code>/dock/documents', methods=['GET'])
@token_required
def list_documents(code):
    room, err = _room_or_404(code)
    if err:
        return err
    docs = DockedDocument.query.filter_by(room_id=room.id).order_by(DockedDocument.created_at.asc()).all()
    return jsonify({'documents': [d.to_dict() for d in docs]})


@room_dock.route('/<code>/dock/documents', methods=['POST'])
@token_required
def create_document(code):
    room, err = _room_or_404(code)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    doc = DockedDocument(
        room_id=room.id,
        title=title,
        content=data.get('content') or '',
        created_by=request.current_user_id,
    )
    db.session.add(doc)
    db.session.commit()
    return jsonify({'document': doc.to_dict()}), 201


@room_dock.route('/<code>/dock/documents/<int:doc_id>', methods=['PUT'])
@token_required
def update_document(code, doc_id):
    room, err = _room_or_404(code)
    if err:
        return err
    doc = _get_doc(room, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404
    if not _can_edit_doc(room, request.current_user_id, doc):
        return jsonify({'error': 'Not authorized'}), 403
    data = request.get_json(silent=True) or {}
    if 'title' in data:
        title = (data.get('title') or '').strip()
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        doc.title = title
    if 'content' in data:
        doc.content = data.get('content') or ''
    db.session.commit()
    return jsonify({'document': doc.to_dict()})


@room_dock.route('/<code>/dock/documents/<int:doc_id>', methods=['DELETE'])
@token_required
def delete_document(code, doc_id):
    room, err = _room_or_404(code)
    if err:
        return err
    doc = _get_doc(room, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404
    if not _can_edit_doc(room, request.current_user_id, doc):
        return jsonify({'error': 'Not authorized'}), 403
    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted'})


# ---------------- Todos ----------------

@room_dock.route('/<code>/dock/todos', methods=['GET'])
@token_required
def list_todos(code):
    room, err = _room_or_404(code)
    if err:
        return err
    todos = RoomTodo.query.filter_by(room_id=room.id).all()
    # open first, then oldest-first
    todos.sort(key=lambda t: (t.status != 'open', t.created_at))
    return jsonify({'todos': [t.to_dict() for t in todos]})


@room_dock.route('/<code>/dock/todos', methods=['POST'])
@token_required
def create_todo(code):
    room, err = _room_or_404(code)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    assignee_id = data.get('assignee_id')
    ok, err_resp = _validate_assignee(room, assignee_id)
    if not ok:
        return err_resp
    todo = RoomTodo(
        room_id=room.id,
        title=title,
        assignee_id=assignee_id,
        status='open',
        created_by=request.current_user_id,
    )
    db.session.add(todo)
    db.session.commit()
    return jsonify({'todo': todo.to_dict()}), 201


@room_dock.route('/<code>/dock/todos/<int:todo_id>', methods=['PUT'])
@token_required
def update_todo(code, todo_id):
    room, err = _room_or_404(code)
    if err:
        return err
    todo = _get_todo(room, todo_id)
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    if not _can_edit_todo(room, request.current_user_id, todo):
        return jsonify({'error': 'Not authorized'}), 403
    data = request.get_json(silent=True) or {}
    if 'title' in data:
        title = (data.get('title') or '').strip()
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        todo.title = title
    if 'assignee_id' in data:
        assignee_id = data.get('assignee_id')
        ok, err_resp = _validate_assignee(room, assignee_id)
        if not ok:
            return err_resp
        todo.assignee_id = assignee_id
    if 'status' in data:
        status = data.get('status')
        if status not in VALID_TODO_STATUSES:
            return jsonify({'error': "Status must be 'open' or 'done'"}), 400
        todo.status = status
    db.session.commit()
    return jsonify({'todo': todo.to_dict()})


@room_dock.route('/<code>/dock/todos/<int:todo_id>', methods=['DELETE'])
@token_required
def delete_todo(code, todo_id):
    room, err = _room_or_404(code)
    if err:
        return err
    todo = _get_todo(room, todo_id)
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    user_id = request.current_user_id
    if user_id != todo.created_by and user_id != room.created_by:
        return jsonify({'error': 'Not authorized'}), 403
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted'})


# ---------------- Comments ----------------

def _list_comments(room, item_type, item_id):
    comments = DockedItemComment.query.filter_by(
        room_id=room.id, item_type=item_type, item_id=item_id
    ).order_by(DockedItemComment.created_at.asc()).all()
    return jsonify({'comments': [c.to_dict() for c in comments]})


def _create_comment(room, item_type, item_id):
    data = request.get_json(silent=True) or {}
    message = (data.get('message') or '').strip()
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    comment = DockedItemComment(
        item_type=item_type,
        item_id=item_id,
        room_id=room.id,
        user_id=request.current_user_id,
        message=message,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'comment': comment.to_dict()}), 201


@room_dock.route('/<code>/dock/documents/<int:doc_id>/comments', methods=['GET'])
@token_required
def list_document_comments(code, doc_id):
    room, err = _room_or_404(code)
    if err:
        return err
    if not _get_doc(room, doc_id):
        return jsonify({'error': 'Document not found'}), 404
    return _list_comments(room, 'document', doc_id)


@room_dock.route('/<code>/dock/documents/<int:doc_id>/comments', methods=['POST'])
@token_required
def create_document_comment(code, doc_id):
    room, err = _room_or_404(code)
    if err:
        return err
    if not _get_doc(room, doc_id):
        return jsonify({'error': 'Document not found'}), 404
    return _create_comment(room, 'document', doc_id)


@room_dock.route('/<code>/dock/todos/<int:todo_id>/comments', methods=['GET'])
@token_required
def list_todo_comments(code, todo_id):
    room, err = _room_or_404(code)
    if err:
        return err
    if not _get_todo(room, todo_id):
        return jsonify({'error': 'Todo not found'}), 404
    return _list_comments(room, 'todo', todo_id)


@room_dock.route('/<code>/dock/todos/<int:todo_id>/comments', methods=['POST'])
@token_required
def create_todo_comment(code, todo_id):
    room, err = _room_or_404(code)
    if err:
        return err
    if not _get_todo(room, todo_id):
        return jsonify({'error': 'Todo not found'}), 404
    return _create_comment(room, 'todo', todo_id)


# ---------------- Activity feed ----------------

@room_dock.route('/<code>/dock/activity', methods=['POST'])
@token_required
def log_activity(code):
    room, err = _room_or_404(code)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    kind = data.get('kind')
    if kind not in VALID_ACTIVITY_KINDS:
        return jsonify({'error': 'Invalid kind'}), 400
    text = (data.get('text') or '').strip()
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    msg = RoomMessage(
        room_id=room.id,
        user_id=request.current_user_id,
        message=text,
        is_system=True,
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Activity logged'}), 201

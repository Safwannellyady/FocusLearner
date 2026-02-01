"""
FocusLearner Pro - Chat Routes
API endpoints for AI Tutor chat
"""

from flask import Blueprint, request, jsonify, current_app
from services.ai_service import AIService
from utils.auth import token_required
from models import ChatMessage, FocusSession, db

chat_routes = Blueprint('chat', __name__, url_prefix='/api/chat')
ai_service = AIService()

# Simple in-memory history for demo purposes (production would use DB)
# Key: user_id, Value: List of messages
chat_histories = {} 

@chat_routes.route('/send', methods=['POST'])
@token_required
def send_message():
    """Send message to AI Tutor"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        user_id = request.current_user_id
        message = data.get('message', '').strip()
        context = data.get('context', '').strip()  # Video title/subject
        video_id = data.get('video_id', '').strip()
        timestamp = data.get('timestamp')
        focus_session_id = data.get('focus_session_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if len(message) > 2000:
            return jsonify({'error': 'Message is too long (max 2000 characters)'}), 400
        
        # Get or create active focus session
        if not focus_session_id:
            active_session = FocusSession.query.filter_by(
                user_id=user_id,
                is_locked=True
            ).first()
            focus_session_id = active_session.id if active_session else None
        
        # Get history
        history = chat_histories.get(user_id, [])
        
        # Call AI
        response_text = ai_service.chat(message, context, history)
        
        if not response_text:
            response_text = "I'm having trouble connecting to my brain right now. Please try again."

        # Update History
        history.append({'role': 'user', 'parts': [message]})
        history.append({'role': 'model', 'parts': [response_text]})
        
        # Limit history size
        if len(history) > 20:
            history = history[-20:]
        
        chat_histories[user_id] = history
        
        # Save to database
        try:
            chat_message = ChatMessage(
                user_id=user_id,
                focus_session_id=focus_session_id,
                message=message,
                response=response_text,
                video_id=video_id if video_id else None,
                timestamp=int(timestamp) if timestamp else None
            )
            db.session.add(chat_message)
            db.session.commit()
        except Exception as db_error:
            current_app.logger.warning(f'Failed to save chat message to DB: {db_error}')
            db.session.rollback()
        
        current_app.logger.info(f'Chat message sent: user={user_id}, message_length={len(message)}')
        
        return jsonify({
            'response': response_text,
            'history': history
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Chat error: {e}', exc_info=True)
        return jsonify({'error': 'Failed to process message'}), 500

@chat_routes.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get chat history from database and memory"""
    try:
        user_id = request.current_user_id
        limit = request.args.get('limit', 50, type=int)
        
        # Get from database
        messages = ChatMessage.query.filter_by(user_id=user_id)\
            .order_by(ChatMessage.created_at.desc())\
            .limit(limit).all()
        
        # Convert to history format
        db_history = []
        for msg in reversed(messages):  # Reverse to get chronological order
            if msg.message:
                db_history.append({'role': 'user', 'parts': [msg.message]})
            if msg.response:
                db_history.append({'role': 'model', 'parts': [msg.response]})
        
        # Merge with in-memory history (prefer in-memory for recent)
        memory_history = chat_histories.get(user_id, [])
        
        # Combine and deduplicate
        combined_history = memory_history + db_history
        # Simple deduplication by keeping first occurrence
        seen = set()
        unique_history = []
        for item in combined_history:
            key = (item.get('role'), item.get('parts', [''])[0])
            if key not in seen:
                seen.add(key)
                unique_history.append(item)
        
        # Limit total history
        if len(unique_history) > 50:
            unique_history = unique_history[-50:]
        
        return jsonify({
            'history': unique_history,
            'count': len(unique_history)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching chat history: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch chat history'}), 500


@chat_routes.route('/clear', methods=['POST'])
@token_required
def clear_history():
    """Clear chat history"""
    try:
        user_id = request.current_user_id
        
        # Clear in-memory history
        chat_histories[user_id] = []
        
        # Optionally clear database history (commented out to preserve data)
        # ChatMessage.query.filter_by(user_id=user_id).delete()
        # db.session.commit()
        
        current_app.logger.info(f'Chat history cleared: user={user_id}')
        
        return jsonify({'message': 'History cleared'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Error clearing chat history: {e}', exc_info=True)
        return jsonify({'error': 'Failed to clear history'}), 500

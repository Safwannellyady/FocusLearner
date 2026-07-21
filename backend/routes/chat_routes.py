"""
FocusLearner Pro - Chat Routes
API endpoints for AI Tutor chat
"""

from flask import Blueprint, request, jsonify
from services.ai_service import AIService
from utils.auth import token_required
from models import db, ChatMessage

chat_routes = Blueprint('chat', __name__, url_prefix='/api/chat')
ai_service = AIService()


def _format_db_history(db_messages):
    """Convert DB ChatMessage instances to frontend history format"""
    history = []
    for msg in db_messages:
        if msg.message:
            history.append({'role': 'user', 'parts': [msg.message]})
        if msg.response:
            history.append({'role': 'model', 'parts': [msg.response]})
    return history


@chat_routes.route('/send', methods=['POST'])
@token_required
def send_message():
    """Send message to AI Tutor and save to database"""
    data = request.get_json() or {}
    user_id = request.current_user_id
    message = data.get('message')
    context = data.get('context')  # Video title/subject
    video_id = data.get('videoId') or data.get('video_id')
    timestamp = data.get('timestamp')  # Current video timestamp in seconds
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
        
    try:
        # Get last 20 messages for context window
        recent_msgs = ChatMessage.query.filter_by(user_id=user_id)\
            .order_by(ChatMessage.created_at.asc()).limit(20).all()
        history_context = _format_db_history(recent_msgs)
        
        # Call AI with RAG support
        ai_result = ai_service.chat(message, context, history_context, video_id, timestamp)
        response_text = ai_result.get('response', "I'm having trouble connecting to my brain right now. Please try again.")
        sources = ai_result.get('sources', [])

        # Save to Database
        new_msg = ChatMessage(
            user_id=user_id,
            video_id=video_id,
            message=message,
            response=response_text,
            timestamp=data.get('timestamp')
        )
        db.session.add(new_msg)
        db.session.commit()
        
        # Fetch updated history for UI
        all_msgs = ChatMessage.query.filter_by(user_id=user_id)\
            .order_by(ChatMessage.created_at.asc()).limit(50).all()
        updated_history = _format_db_history(all_msgs)
        
        return jsonify({
            'response': response_text,
            'history': updated_history,
            'sources': sources
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Chat Error: {e}")
        return jsonify({'error': 'Failed to process message'}), 500


@chat_routes.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get chat history from database"""
    user_id = request.current_user_id
    try:
        msgs = ChatMessage.query.filter_by(user_id=user_id)\
            .order_by(ChatMessage.created_at.asc()).limit(50).all()
        return jsonify({'history': _format_db_history(msgs)}), 200
    except Exception as e:
        print(f"Get History Error: {e}")
        return jsonify({'error': 'Failed to load history'}), 500


@chat_routes.route('/clear', methods=['POST'])
@token_required
def clear_history():
    """Clear chat history for current user from database"""
    user_id = request.current_user_id
    try:
        ChatMessage.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({'message': 'History cleared'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Clear History Error: {e}")
        return jsonify({'error': 'Failed to clear history'}), 500


@chat_routes.route('/reindex', methods=['POST'])
@token_required
def reindex_transcript():
    """Manually trigger transcript re-indexing for a video"""
    data = request.get_json() or {}
    video_id = data.get('videoId') or data.get('video_id')
    
    if not video_id:
        return jsonify({'error': 'Video ID is required'}), 400
    
    try:
        from services.vector_service import vector_service
        from services.youtube_service import YouTubeService
        
        # Fetch transcript
        yt_service = YouTubeService()
        transcript_data = yt_service.get_video_transcript(video_id)
        
        if not transcript_data:
            return jsonify({'error': 'Failed to fetch transcript'}), 400
        
        # Index in vector database
        transcript_text = transcript_data.get('transcript', '')
        metadata = {
            'title': transcript_data.get('title', ''),
            'subject': data.get('subject', ''),
            'topic': data.get('topic', '')
        }
        
        success = vector_service.index_transcript(video_id, transcript_text, metadata)
        
        if success:
            return jsonify({'message': 'Transcript indexed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to index transcript'}), 500
            
    except Exception as e:
        print(f"Reindex Error: {e}")
        return jsonify({'error': 'Failed to reindex transcript'}), 500

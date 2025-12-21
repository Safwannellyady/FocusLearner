"""
FocusLearner Pro - Chat Routes
API endpoints for AI Tutor chat
"""

from flask import Blueprint, request, jsonify
from services.ai_service import AIService
from utils.auth import token_required

chat_routes = Blueprint('chat', __name__, url_prefix='/api/chat')
ai_service = AIService()

# Simple in-memory history for demo purposes (production would use DB)
# Key: user_id, Value: List of messages
chat_histories = {} 

@chat_routes.route('/send', methods=['POST'])
@token_required
def send_message():
    """Send message to AI Tutor"""
    data = request.get_json()
    user_id = request.current_user_id
    message = data.get('message')
    context = data.get('context') # Video title/subject
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
        
    # Get history
    history = chat_histories.get(user_id, [])
    
    try:
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
        
        return jsonify({
            'response': response_text,
            'history': history
        }), 200
        
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({'error': 'Failed to process message'}), 500

@chat_routes.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get chat history"""
    user_id = request.current_user_id
    history = chat_histories.get(user_id, [])
    return jsonify({'history': history}), 200

@chat_routes.route('/clear', methods=['POST'])
@token_required
def clear_history():
    """Clear chat history"""
    user_id = request.current_user_id
    chat_histories[user_id] = []
    return jsonify({'message': 'History cleared'}), 200

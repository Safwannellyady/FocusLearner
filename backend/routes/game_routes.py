"""
FocusLearner Pro - Game Routes
API endpoints for gamified learning challenges
"""

from flask import Blueprint, request, jsonify
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from services.game_service import GameService
from services.ai_service import AIService
from utils.auth import token_required

game_routes = Blueprint('game', __name__, url_prefix='/api/game')
game_service = GameService()
ai_service = AIService()


@game_routes.route('/modules', methods=['GET'])
def get_modules():
    """Get all available game modules"""
    modules_dict = game_service.GAME_MODULES
    return jsonify({
        'modules': modules_dict,
        'count': len(modules_dict)
    }), 200


@game_routes.route('/modules/<module_id>', methods=['GET'])
def get_module(module_id: str):
    """Get specific game module information"""
    module = game_service.get_game_module(module_id)
    
    if not module:
        return jsonify({'error': 'Game module not found'}), 404
    
    return jsonify({'module': module}), 200


@game_routes.route('/submit', methods=['POST'])
@token_required
def submit_result():
    """Submit game result and update progress"""
    data = request.get_json()
    user_id = request.current_user_id
    module_id = data.get('module_id')
    score = data.get('score')
    level = data.get('level')
    subject_focus = data.get('subject_focus')
    
    if not all([module_id, score is not None, level, subject_focus]):
        return jsonify({
            'error': 'module_id, score, level, and subject_focus are required'
        }), 400
    
    # Validate module exists
    module = game_service.get_game_module(module_id)
    if not module:
        return jsonify({'error': 'Invalid game module'}), 400
    
    progress = game_service.submit_game_result(
        user_id=user_id,
        module_id=module_id,
        score=score,
        level=level,
        subject_focus=subject_focus
    )
    
    return jsonify({
        'message': 'Game result submitted successfully',
        'progress': progress
    }), 200


@game_routes.route('/progress', methods=['GET'])
@token_required
def get_progress():
    """Get user's game progress"""
    user_id = request.current_user_id
    module_id = request.args.get('module_id')
    
    progress = game_service.get_user_progress(user_id, module_id)
    
    return jsonify({
        'progress': progress,
        'count': len(progress)
    }), 200


@game_routes.route('/leaderboard/<module_id>', methods=['GET'])
def get_leaderboard(module_id: str):
    """Get leaderboard for a game module"""
    limit = request.args.get('limit', 10, type=int)
    
    leaderboard = game_service.get_leaderboard(module_id, limit)
    
    return jsonify({
        'module_id': module_id,
        'leaderboard': leaderboard
    }), 200



@game_routes.route('/challenge/generate', methods=['POST'])
@token_required
def generate_challenge():
    """Generate a standard challenge"""
    data = request.get_json()
    subject = data.get('subject')
    level = data.get('level', 1)
    
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400
        
    try:
        challenge = ai_service.generate_game_content(subject, level)
        return jsonify({'challenge': challenge}), 200
    except Exception as e:
        print(f"Challenge generation error: {e}")
        return jsonify({'error': 'Failed to generate challenge'}), 500


@game_routes.route('/activity/generate', methods=['POST'])
@token_required
def generate_activity():
    """Generate a specific activity (Coding, Lab, Crossword) based on subject/topic"""
    data = request.get_json()
    subject = data.get('subject')
    topic = data.get('topic')
    activity_type = data.get('type', 'auto') # 'coding', 'lab', 'crossword', 'auto'
    
    if not subject or not topic:
        return jsonify({'error': 'Subject and topic are required'}), 400
        
    try:
        activity = ai_service.generate_result_based_activity(subject, topic, activity_type)
        return jsonify({'activity': activity}), 200
    except Exception as e:
        print(f"Activity generation error: {e}")
        return jsonify({'error': 'Failed to generate activity'}), 500

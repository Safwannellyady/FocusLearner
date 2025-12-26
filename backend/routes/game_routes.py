"""
FocusLearner Pro - Game Routes
API endpoints for gamified learning challenges
"""

from flask import Blueprint, request, jsonify
import json
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from services.game_service import GameService
from services.ai_service import AIService
from utils.auth import token_required
from models import LearningIntent, GameChallenge
from services.learning_loop_service import LearningLoopService

game_routes = Blueprint('game', __name__, url_prefix='/api/game')
game_service = GameService()
ai_service = AIService()
loop_service = LearningLoopService()


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
    subject = request.args.get('subject')
    topic = request.args.get('topic')
    
    leaderboard = game_service.get_leaderboard(module_id, subject, topic, limit)
    
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
    """Generate a specific activity securely"""
    user_id = request.current_user_id
    data = request.get_json()
    subject = data.get('subject')
    topic = data.get('topic')
    activity_type = data.get('type', 'auto') 
    
    if not subject or not topic:
        return jsonify({'error': 'Subject and topic are required'}), 400
        
    # Lookup Intent
    intent = LearningIntent.query.filter_by(subject=subject, topic=topic).first()
    loop_state = None
    if intent:
        loop_state = loop_service.get_current_stage(user_id, intent.id)
    
    try:
        # Pass ai_service explicitly, and intent
        activity = game_service.create_activity(ai_service, user_id, subject, topic, activity_type, intent, loop_state)
        return jsonify({'activity': activity}), 200
    except Exception as e:
        print(f"Activity generation error: {e}")
        return jsonify({'error': 'Failed to generate activity'}), 500




@game_routes.route('/activity/submit', methods=['POST'])
@token_required
def submit_activity_route():
    """Submit an activity solution for backend grading"""
    user_id = request.current_user_id
    data = request.get_json()
    challenge_id = data.get('challenge_id')
    answer = data.get('answer')
    violation_count = data.get('violation_count', 0)
    
    if not challenge_id or answer is None:
        return jsonify({'error': 'Challenge ID and Answer are required'}), 400
        
    try:
        result = game_service.submit_activity(user_id, challenge_id, answer, violation_count)
        if 'error' in result:
             return jsonify(result), 404
             
        # Update Learning Loop State
        challenge = GameChallenge.query.get(challenge_id)
        if challenge and challenge.learning_intent_id:
            # Prepare metadata for AI analysis
            try:
                content_data = json.loads(challenge.data)
                solution_data_local = json.loads(challenge.solution)
                correct_val = solution_data_local.get('answer') if isinstance(solution_data_local, dict) else solution_data_local
            except:
                content_data = {}
                correct_val = "Unknown"
                
            metadata = {
                "question": content_data.get('question') or content_data.get('description') or "Unknown Question",
                "user_answer": str(answer),
                "correct_answer": str(correct_val),
                "subject": challenge.subject
            }
            loop_update = loop_service.update_stage(user_id, challenge.learning_intent_id, result['is_correct'], result.get('score', 0), metadata)
            result['loop_status'] = loop_update
             
        return jsonify({'result': result}), 200
    except Exception as e:
        print(f"Submission error: {e}")
        return jsonify({'error': 'Failed to process submission'}), 500
@game_routes.route('/mastery', methods=['GET'])
@token_required
def get_mastery_state():
    """Get mastery state for a specific topic"""
    user_id = request.current_user_id
    subject = request.args.get('subject')
    topic = request.args.get('topic')
    
    if not subject or not topic:
        return jsonify({'error': 'Subject and Topic are required'}), 400
        
    mastery = game_service.get_topic_mastery(user_id, subject, topic)
    return jsonify({'mastery': mastery}), 200


@game_routes.route('/stats', methods=['GET'])
@token_required
def get_detailed_stats():
    """Get comprehensive user progress stats"""
    user_id = request.current_user_id
    stats = game_service.get_detailed_progress(user_id)
    return jsonify({'stats': stats}), 200

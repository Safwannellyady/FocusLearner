from flask import Blueprint, request, jsonify
from app import db
from models import LearningIntent
import json

taxonomy_bp = Blueprint('taxonomy', __name__)

@taxonomy_bp.route('/subjects', methods=['GET'])
def get_subjects():
    """Get all unique subjects"""
    try:
        # Get distinct subjects
        subjects = db.session.query(LearningIntent.subject).distinct().all()
        # subjects is a list of tuples like [('Math/Algebra',), ...]
        subject_list = [s[0] for s in subjects]
        return jsonify({'subjects': sorted(subject_list)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@taxonomy_bp.route('/topics', methods=['GET'])
def get_topics():
    """Get topics for a specific subject"""
    subject = request.args.get('subject')
    if not subject:
        return jsonify({'error': 'Subject parameter is required'}), 400
        
    try:
        # Get intents for this subject
        intents = LearningIntent.query.filter_by(subject=subject).all()
        return jsonify({'topics': [intent.to_dict() for intent in intents]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@taxonomy_bp.route('/intent/<int:intent_id>', methods=['GET'])
def get_learning_intent(intent_id):
    """Get specific learning intent details"""
    try:
        intent = LearningIntent.query.get(intent_id)
        if not intent:
            return jsonify({'error': 'Learning intent not found'}), 404
        return jsonify(intent.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from services.learning_loop_service import LearningLoopService
from utils.auth import token_required

loop_service = LearningLoopService()

@taxonomy_bp.route('/loop/status', methods=['GET'])
@token_required
def get_loop_status():
    """Get current learning loop status for a specific intent"""
    user_id = request.current_user_id
    intent_id = request.args.get('intent_id')
    
    if not intent_id:
        return jsonify({'error': 'Intent ID required'}), 400
        
    state = loop_service.get_current_stage(user_id, intent_id)
    
    feedback_text = None
    remediation_focus = None
    
    if state.last_feedback:
        try:
            fb_data = json.loads(state.last_feedback)
            feedback_text = fb_data.get('analysis')
            remediation_focus = fb_data.get('remediation_focus')
        except:
             feedback_text = state.last_feedback # Fallback

    return jsonify({
        'stage': state.current_stage.value,
        'attempts': state.attempts,
        'last_updated': state.last_updated.isoformat(),
        'feedback': feedback_text,
        'remediation_focus': remediation_focus
    }), 200

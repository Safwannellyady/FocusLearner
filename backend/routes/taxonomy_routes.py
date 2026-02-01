"""
FocusLearner Pro - Taxonomy Routes
API endpoints for learning taxonomy and intents
"""

from flask import Blueprint, request, jsonify, current_app
from models import db, LearningIntent
from services.learning_loop_service import LearningLoopService
from utils.auth import token_required
import json

taxonomy_bp = Blueprint('taxonomy', __name__)
loop_service = LearningLoopService()

@taxonomy_bp.route('/subjects', methods=['GET'])
def get_subjects():
    """Get all unique subjects"""
    try:
        # Get distinct subjects
        subjects = db.session.query(LearningIntent.subject).distinct().all()
        # subjects is a list of tuples like [('Math/Algebra',), ...]
        subject_list = [s[0] for s in subjects if s[0]]
        subject_list = sorted(set(subject_list))  # Remove duplicates and sort
        
        current_app.logger.debug(f'Retrieved {len(subject_list)} unique subjects')
        
        return jsonify({
            'subjects': subject_list,
            'count': len(subject_list)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching subjects: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch subjects'}), 500


@taxonomy_bp.route('/topics', methods=['GET'])
def get_topics():
    """Get topics for a specific subject"""
    try:
        subject = request.args.get('subject', '').strip()
        
        if not subject:
            return jsonify({'error': 'Subject parameter is required'}), 400
        
        # Get intents for this subject
        intents = LearningIntent.query.filter_by(subject=subject).all()
        
        current_app.logger.debug(f'Retrieved {len(intents)} topics for subject: {subject}')
        
        return jsonify({
            'subject': subject,
            'topics': [intent.to_dict() for intent in intents],
            'count': len(intents)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching topics: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch topics'}), 500


@taxonomy_bp.route('/intent/<int:intent_id>', methods=['GET'])
def get_learning_intent(intent_id):
    """Get specific learning intent details"""
    try:
        if not intent_id or intent_id < 1:
            return jsonify({'error': 'Invalid intent ID'}), 400
        
        intent = LearningIntent.query.get(intent_id)
        
        if not intent:
            return jsonify({'error': 'Learning intent not found'}), 404
        
        return jsonify(intent.to_dict()), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching learning intent {intent_id}: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch learning intent'}), 500


@taxonomy_bp.route('/loop/status', methods=['GET'])
@token_required
def get_loop_status():
    """Get current learning loop status for a specific intent"""
    try:
        user_id = request.current_user_id
        intent_id = request.args.get('intent_id')
        
        if not intent_id:
            return jsonify({'error': 'Intent ID is required'}), 400
        
        try:
            intent_id = int(intent_id)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid intent ID format'}), 400
        
        # Verify intent exists
        intent = LearningIntent.query.get(intent_id)
        if not intent:
            return jsonify({'error': 'Learning intent not found'}), 404
        
        state = loop_service.get_current_stage(user_id, intent_id)
        
        if not state:
            return jsonify({
                'error': 'No learning loop state found',
                'message': 'Start learning this topic to create a loop state'
            }), 404
        
        feedback_text = None
        remediation_focus = None
        
        if state.last_feedback:
            try:
                fb_data = json.loads(state.last_feedback)
                feedback_text = fb_data.get('analysis')
                remediation_focus = fb_data.get('remediation_focus')
            except (json.JSONDecodeError, TypeError):
                feedback_text = state.last_feedback  # Fallback
        
        return jsonify({
            'stage': state.current_stage.value,
            'attempts': state.attempts,
            'last_updated': state.last_updated.isoformat(),
            'feedback': feedback_text,
            'remediation_focus': remediation_focus
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching loop status: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch loop status'}), 500

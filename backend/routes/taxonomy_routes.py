from flask import Blueprint, request, jsonify
from models import db
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
        except (json.JSONDecodeError, TypeError):
             feedback_text = state.last_feedback  # Fallback

    return jsonify({
        'stage': state.current_stage.value,
        'attempts': state.attempts,
        'last_updated': state.last_updated.isoformat(),
        'feedback': feedback_text,
        'remediation_focus': remediation_focus
    }), 200

from models import UserTopicMastery, TopicMasteryState

@taxonomy_bp.route('/graph', methods=['GET'])
@token_required
def get_knowledge_graph():
    """Get visual knowledge graph nodes and prerequisite edges for a subject"""
    user_id = request.current_user_id
    subject = request.args.get('subject', 'Math/Linear Algebra')
    
    # Get all learning intents for this subject
    intents = LearningIntent.query.filter_by(subject=subject).all()
    
    # Check user topic mastery states
    mastery_records = UserTopicMastery.query.filter_by(user_id=user_id).all()
    mastery_map = {m.intent_id: m.mastery_state.value if hasattr(m.mastery_state, 'value') else str(m.mastery_state) for m in mastery_records}
    
    nodes = []
    links = []
    
    for idx, intent in enumerate(intents):
        status = mastery_map.get(intent.id, 'Locked' if idx > 1 else 'In Progress')
        nodes.append({
            'id': intent.id,
            'label': intent.topic_name,
            'subject': intent.subject,
            'status': status,
            'description': intent.description,
            'level': idx + 1
        })
        # Add sequential prerequisite links
        if idx > 0:
            links.append({
                'source': intents[idx - 1].id,
                'target': intent.id,
                'type': 'prerequisite'
            })
            
    # If no intents in DB for this subject yet, derive the tree from the
    # user's real sessions for that subject instead of showing canned
    # demo data for an unrelated subject. If the user has no sessions at
    # all, return an empty graph so the UI can show an honest empty state.
    if not nodes:
        from models import FocusSession
        sessions = (FocusSession.query
                    .filter_by(user_id=user_id, subject_focus=subject, status='completed')
                    .order_by(FocusSession.started_at.asc())
                    .all())
        seen_topics = []
        for s in sessions:
            topic = (s.topic or '').strip() or 'General review'
            if topic not in seen_topics:
                seen_topics.append(topic)
        for idx, topic in enumerate(seen_topics):
            nodes.append({
                'id': 1000 + idx,
                'label': topic,
                'subject': subject,
                'status': 'In Progress' if idx == len(seen_topics) - 1 else 'Mastered',
                'description': f'Practiced in {subject} focus sessions.',
                'level': idx + 1
            })
            if idx > 0:
                links.append({
                    'source': 1000 + idx - 1,
                    'target': 1000 + idx,
                    'type': 'prerequisite'
                })
        
    return jsonify({
        'subject': subject,
        'nodes': nodes,
        'links': links
    }), 200

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

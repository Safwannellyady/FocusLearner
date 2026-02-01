"""
FocusLearner Pro - User Preferences Routes
API endpoints for managing user preferences
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import sys
import os
import json

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import UserPreferences, db
from utils.auth import token_required

preferences_routes = Blueprint('preferences', __name__, url_prefix='/api/preferences')


@preferences_routes.route('/', methods=['GET'])
@token_required
def get_preferences():
    """Get user preferences"""
    user_id = request.current_user_id
    preferences = UserPreferences.query.filter_by(user_id=user_id).first()
    
    if not preferences:
        # Create default preferences
        preferences = UserPreferences(
            user_id=user_id,
            preferred_subjects='[]',
            preferred_topics='[]',
            difficulty_level='intermediate'
        )
        db.session.add(preferences)
        db.session.commit()
    
    return jsonify({'preferences': preferences.to_dict()}), 200


@preferences_routes.route('/', methods=['PUT'])
@token_required
def update_preferences():
    """Update user preferences"""
    try:
        user_id = request.current_user_id
        preferences = UserPreferences.query.filter_by(user_id=user_id).first()
        
        if not preferences:
            preferences = UserPreferences(user_id=user_id)
            db.session.add(preferences)
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        updated = False
        valid_difficulty_levels = ['beginner', 'intermediate', 'advanced']
        valid_learning_styles = ['visual', 'auditory', 'kinesthetic', 'reading']
        
        if 'preferred_subjects' in data:
            subjects = data['preferred_subjects']
            if not isinstance(subjects, list):
                return jsonify({'error': 'preferred_subjects must be a list'}), 400
            new_subjects = json.dumps(subjects)
            if new_subjects != preferences.preferred_subjects:
                preferences.preferred_subjects = new_subjects
                updated = True
        
        if 'preferred_topics' in data:
            topics = data['preferred_topics']
            if not isinstance(topics, list):
                return jsonify({'error': 'preferred_topics must be a list'}), 400
            new_topics = json.dumps(topics)
            if new_topics != preferences.preferred_topics:
                preferences.preferred_topics = new_topics
                updated = True
        
        if 'difficulty_level' in data:
            difficulty = data['difficulty_level'].strip().lower() if data['difficulty_level'] else None
            if difficulty and difficulty not in valid_difficulty_levels:
                return jsonify({
                    'error': f'difficulty_level must be one of: {", ".join(valid_difficulty_levels)}'
                }), 400
            if difficulty and difficulty != preferences.difficulty_level:
                preferences.difficulty_level = difficulty
                updated = True
        
        if 'learning_style' in data:
            style = data['learning_style'].strip().lower() if data['learning_style'] else None
            if style and style not in valid_learning_styles:
                return jsonify({
                    'error': f'learning_style must be one of: {", ".join(valid_learning_styles)}'
                }), 400
            if style and style != preferences.learning_style:
                preferences.learning_style = style
                updated = True
        
        if updated:
            preferences.updated_at = datetime.utcnow()
            db.session.commit()
            current_app.logger.info(f'Preferences updated: user={user_id}')
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error updating preferences: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Failed to update preferences'}), 500


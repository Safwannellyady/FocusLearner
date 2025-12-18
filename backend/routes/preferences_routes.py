"""
FocusLearner Pro - User Preferences Routes
API endpoints for managing user preferences
"""

from flask import Blueprint, request, jsonify
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
    user_id = request.current_user_id
    preferences = UserPreferences.query.filter_by(user_id=user_id).first()
    
    if not preferences:
        preferences = UserPreferences(user_id=user_id)
        db.session.add(preferences)
    
    data = request.get_json()
    
    if 'preferred_subjects' in data:
        preferences.preferred_subjects = json.dumps(data['preferred_subjects'])
    
    if 'preferred_topics' in data:
        preferences.preferred_topics = json.dumps(data['preferred_topics'])
    
    if 'difficulty_level' in data:
        preferences.difficulty_level = data['difficulty_level']
    
    if 'learning_style' in data:
        preferences.learning_style = data['learning_style']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Preferences updated successfully',
        'preferences': preferences.to_dict()
    }), 200


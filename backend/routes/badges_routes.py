from flask import Blueprint, jsonify, request
from models import db, Badge, UserBadge, User
from utils.auth import token_required
from datetime import datetime

badges_routes = Blueprint('badges_routes', __name__, url_prefix='/api/badges')

@badges_routes.route('', methods=['GET'])
@token_required
def get_badges():
    try:
        user_id = getattr(request, 'current_user_id', 1)
        
        # Make sure default badges exist
        if Badge.query.count() == 0:
            default_badges = [
                Badge(name='Focus Master', description='Completed a long focus session', icon='Timer', category='focus'),
                Badge(name='Challenge Master', description='Aced a difficult challenge', icon='EmojiEvents', category='challenge'),
                Badge(name='Consistent Learner', description='Maintained a 3-day streak', icon='LocalFireDepartment', category='streak'),
                Badge(name='Night Owl', description='Studied past midnight', icon='Nightlight', category='focus')
            ]
            db.session.bulk_save_objects(default_badges)
            db.session.commit()
            
        all_badges = Badge.query.all()
        user_badges = UserBadge.query.filter_by(user_id=user_id).all()
        earned_map = {ub.badge_id: ub.earned_at.isoformat() for ub in user_badges}
        
        result = []
        for b in all_badges:
            result.append({
                'id': b.id,
                'name': b.name,
                'description': b.description,
                'icon': b.icon,
                'category': b.category,
                'earned': b.id in earned_map,
                'earned_at': earned_map.get(b.id)
            })
            
        return jsonify({'badges': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@badges_routes.route('/award', methods=['POST'])
def award_badge():
    """Awards a badge to a user based on criteria"""
    try:
        data = request.json
        user_id = data.get('user_id', 1)
        badge_name = data.get('badge_name')
        
        if not badge_name:
            return jsonify({'error': 'badge_name is required'}), 400
            
        badge = Badge.query.filter_by(name=badge_name).first()
        if not badge:
            return jsonify({'error': 'Badge not found'}), 404
            
        # Check if already earned
        existing = UserBadge.query.filter_by(user_id=user_id, badge_id=badge.id).first()
        if existing:
            return jsonify({'message': 'Badge already earned', 'newly_awarded': False}), 200
            
        new_ub = UserBadge(user_id=user_id, badge_id=badge.id)
        db.session.add(new_ub)
        db.session.commit()
        
        return jsonify({'message': f'Awarded badge {badge_name}', 'newly_awarded': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

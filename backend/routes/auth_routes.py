"""
FocusLearner Pro - Authentication Routes
API endpoints for user registration, login, and account management
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import sys
import os
import re

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import User, UserPreferences, db
from utils.auth import (
    generate_token_pair,
    token_required,
    refresh_token_required,
    blacklist_token,
    validate_password_strength,
    validate_email
)
from services.google_auth import GoogleAuthService

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')
google_auth_service = GoogleAuthService()


def validate_username(username: str) -> tuple[bool, str]:
    """Validate username format"""
    if not username:
        return False, 'Username is required'
    if len(username) < 3:
        return False, 'Username must be at least 3 characters long'
    if len(username) > 30:
        return False, 'Username must be less than 30 characters'
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, 'Username can only contain letters, numbers, and underscores'
    return True, ''


@auth_routes.route('/register', methods=['POST'])
def register():
    """Register a new user with comprehensive validation"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        
        # Username validation
        username_valid, username_error = validate_username(username)
        if not username_valid:
            return jsonify({'error': username_error}), 400
        
        # Email validation
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Password validation
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        password_valid, password_error = validate_password_strength(password)
        if not password_valid:
            return jsonify({'error': password_error}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create new user
        try:
            user = User(
                username=username,
                email=email,
                full_name=full_name if full_name else None
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.flush()  # Get user.id without committing
            
            # Create default preferences
            preferences = UserPreferences(
                user_id=user.id,
                preferred_subjects='[]',
                preferred_topics='[]',
                difficulty_level='intermediate'
            )
            db.session.add(preferences)
            db.session.commit()
            
            # Generate tokens
            tokens = generate_token_pair(user.id)
            
            current_app.logger.info(f'New user registered: {username} ({email})')
            
            return jsonify({
                'message': 'User registered successfully',
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'user': user.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error creating user: {e}')
            return jsonify({'error': 'Failed to create user account'}), 500
            
    except Exception as e:
        current_app.logger.error(f'Registration error: {e}')
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_routes.route('/login', methods=['POST'])
def login():
    """Login user and return JWT tokens"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username.lower())
        ).first()
        
        if not user or not user.check_password(password):
            current_app.logger.warning(f'Failed login attempt for: {username}')
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update login streak and last login
        now = datetime.utcnow()
        
        if user.last_login_at:
            # Check difference in days
            delta = now.date() - user.last_login_at.date()
            if delta.days == 1:
                user.streak_days = (user.streak_days or 0) + 1
            elif delta.days > 1:
                user.streak_days = 1
        else:
            user.streak_days = 1
        
        user.last_login_at = now
        db.session.commit()
        
        # Generate tokens
        tokens = generate_token_pair(user.id)
        
        current_app.logger.info(f'User logged in: {user.username}')
        
        return jsonify({
            'message': 'Login successful',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Login error: {e}')
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_routes.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user"""
    from models import User
    user_id = request.current_user_id
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Include preferences
    if user.preferences:
        user_data['preferences'] = user.preferences.to_dict()
    
    return jsonify({'user': user_data}), 200


@auth_routes.route('/update-profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile with validation"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        updated = False
        
        if 'full_name' in data:
            full_name = data['full_name'].strip() if data['full_name'] else None
            if full_name != user.full_name:
                user.full_name = full_name
                updated = True
        
        if 'email' in data:
            email = data['email'].strip().lower()
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already taken
            existing = User.query.filter_by(email=email).first()
            if existing and existing.id != user.id:
                return jsonify({'error': 'Email already in use'}), 409
            
            if email != user.email:
                user.email = email
                updated = True
        
        if updated:
            user.updated_at = datetime.utcnow()
            db.session.commit()
            current_app.logger.info(f'Profile updated for user: {user.id}')
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Profile update error: {e}')
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_routes.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password with validation"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Old and new passwords are required'}), 400
        
        if not user.check_password(old_password):
            current_app.logger.warning(f'Failed password change attempt for user: {user.id}')
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password strength
        password_valid, password_error = validate_password_strength(new_password)
        if not password_valid:
            return jsonify({'error': password_error}), 400
        
        # Check if new password is same as old
        if user.check_password(new_password):
            return jsonify({'error': 'New password must be different from current password'}), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        # Blacklist current token to force re-login
        token = getattr(request, 'current_token', None)
        if token:
            blacklist_token(token)
        
        current_app.logger.info(f'Password changed for user: {user.id}')
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Password change error: {e}')
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_routes.route('/refresh', methods=['POST'])
@refresh_token_required
def refresh():
    """Refresh access token using refresh token"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Generate new token pair
        tokens = generate_token_pair(user.id)
        
        # Blacklist old refresh token
        old_token = getattr(request, 'current_token', None)
        if old_token:
            blacklist_token(old_token)
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Token refresh error: {e}')
        return jsonify({'error': 'Failed to refresh token'}), 500


@auth_routes.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user by blacklisting token"""
    try:
        token = getattr(request, 'current_token', None)
        if token:
            blacklist_token(token)
            current_app.logger.info(f'User logged out: {request.current_user_id}')
        
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Logout error: {e}')
        return jsonify({'error': 'Failed to logout'}), 500


@auth_routes.route('/google', methods=['POST'])
def google_login():
    """Login or register user with Google OAuth"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        token = data.get('token')  # Google access token or ID token
        
        if not token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token and get user info
        google_user_info = google_auth_service.verify_google_token(token)
        
        if not google_user_info:
            current_app.logger.warning(f"Failed to verify Google token")
            return jsonify({'error': 'Invalid Google token. Please try again.'}), 401
        
        email = google_user_info.get('email', '').lower()
        google_id = google_user_info.get('google_id')
        name = google_user_info.get('name', '').strip()
        
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email from Google'}), 400
        
        # Check if user exists by email
        user = User.query.filter_by(email=email).first()
        is_new_user = False
        
        if not user:
            # Create new user
            # Generate username from email
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                full_name=name if name else None,
                password_hash=''  # No password for Google users
            )
            db.session.add(user)
            db.session.flush()
            
            # Create default preferences
            preferences = UserPreferences(
                user_id=user.id,
                preferred_subjects='[]',
                preferred_topics='[]',
                difficulty_level='intermediate'
            )
            db.session.add(preferences)
            db.session.commit()
            is_new_user = True
            current_app.logger.info(f'New Google user registered: {username} ({email})')
        
        # Update Streak
        now = datetime.utcnow()
        
        if user.last_login_at:
            delta = now.date() - user.last_login_at.date()
            if delta.days == 1:
                user.streak_days = (user.streak_days or 0) + 1
            elif delta.days > 1:
                user.streak_days = 1
        else:
            user.streak_days = 1
        
        user.last_login_at = now
        db.session.commit()
        
        # Generate JWT tokens
        tokens = generate_token_pair(user.id)
        
        current_app.logger.info(f'Google login successful: {user.username}')
        
        return jsonify({
            'message': 'Google authentication successful',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': user.to_dict(),
            'is_new_user': is_new_user
        }), 200
    
    except Exception as e:
        current_app.logger.error(f'Google login error: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 500


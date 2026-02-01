"""
FocusLearner Pro - Authentication Routes
API endpoints for user registration, login, and account management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sys
import os
import logging

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import User, UserPreferences, db
from utils.auth import generate_token, token_required
from utils.validators import Validator
from utils.errors import ValidationError, ConflictError, AuthenticationError, NotFoundError
from services.google_auth import GoogleAuthService

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')
google_auth_service = GoogleAuthService()
logger = logging.getLogger(__name__)

# Rate limiter instance (will be initialized in app.py)
limiter = None

def init_limiter(app_limiter):
    """Initialize rate limiter for auth routes"""
    global limiter
    limiter = app_limiter


@auth_routes.route('/register', methods=['POST'])
def register():
    """Register a new user with enhanced validation"""
    try:
        data = request.get_json()
        
        if not data:
            raise ValidationError("Request body is required")
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = Validator.sanitize_string(data.get('full_name', ''), max_length=200)
        
        # Validate inputs
        is_valid, error = Validator.validate_username(username)
        if not is_valid:
            raise ValidationError(error, field='username')
        
        is_valid, error = Validator.validate_email(email)
        if not is_valid:
            raise ValidationError(error, field='email')
        
        is_valid, error = Validator.validate_password(password)
        if not is_valid:
            raise ValidationError(error, field='password')
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            raise ConflictError("Username already exists", field='username')
        
        if User.query.filter_by(email=email).first():
            raise ConflictError("Email already exists", field='email')
        
        # Create new user
        try:
            user = User(
                username=username,
                email=email,
                full_name=full_name
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
            
            logger.info(f"New user registered: {username} ({email})")
            
            # Generate token
            token = generate_token(user.id)
            
            return jsonify({
                'message': 'User registered successfully',
                'token': token,
                'user': user.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {e}")
            raise ValidationError("Failed to create user account")
            
    except ValidationError as e:
        return jsonify({'error': e.message, 'field': getattr(e, 'field', None)}), 400
    except ConflictError as e:
        return jsonify({'error': e.message, 'field': getattr(e, 'field', None)}), 409
    except Exception as e:
        logger.exception(f"Unexpected error in register: {e}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500


@auth_routes.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
        
    # Update Streak
    from datetime import datetime
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
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


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
    """Update user profile"""
    user_id = request.current_user_id
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    if 'email' in data:
        # Check if email is already taken
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Email already in use'}), 400
        user.email = data['email']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@auth_routes.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password"""
    user_id = request.current_user_id
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({'error': 'Old and new passwords are required'}), 400
    
    if not user.check_password(old_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@auth_routes.route('/google', methods=['POST'])
def google_login():
    """Login or register user with Google OAuth"""
    try:
        data = request.get_json()
        token = data.get('token')  # Google access token or ID token
        
        if not token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token and get user info
        google_user_info = google_auth_service.verify_google_token(token)
        
        if not google_user_info:
            print(f"Failed to verify Google token. Token received: {token[:20]}...")
            return jsonify({'error': 'Invalid Google token. Please try again.'}), 401
        
        email = google_user_info.get('email')
        google_id = google_user_info.get('google_id')
        name = google_user_info.get('name', '')
        
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400
        
        # Check if user exists by email
        user = User.query.filter_by(email=email).first()
        
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
                full_name=name,
                password_hash=''  # No password for Google users
            )
            db.session.add(user)
            db.session.commit()
            
            # Create default preferences
            preferences = UserPreferences(
                user_id=user.id,
                preferred_subjects='[]',
                preferred_topics='[]',
                difficulty_level='intermediate'
            )
            db.session.add(preferences)
            db.session.commit()
        
        # Update Streak
        from datetime import datetime
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
        
        # Generate JWT token
        jwt_token = generate_token(user.id)
        
        return jsonify({
            'message': 'Google authentication successful',
            'token': jwt_token,
            'user': user.to_dict(),
            'is_new_user': not user.password_hash  # True if just created
        }), 200
    
    except Exception as e:
        print(f"Error in Google login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 500


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
    generate_token,
    generate_token_pair,
    verify_token,
    token_required,
    refresh_token_required,
    blacklist_token,
    validate_password_strength,
    validate_email,
    hash_reset_token
)
from services.google_auth import GoogleAuthService
from services.email_service import send_password_reset_email, EmailNotConfiguredError
from extensions import limiter

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



@auth_routes.route('/check-username', methods=['GET'])
@limiter.limit("30 per minute")
def check_username():
    """Check if a username is available (SQL-injection safe via ORM + regex pre-filter)"""
    username = request.args.get('username', '').strip()
    # Validate format first — rejects anything non-alphanumeric before touching DB
    valid, err = validate_username(username)
    if not valid:
        return jsonify({'available': False, 'reason': err}), 200
    exists = User.query.filter_by(username=username).first() is not None
    return jsonify({'available': not exists}), 200


@auth_routes.route('/register', methods=['POST'])
@limiter.limit("10 per hour")
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
                'token': tokens['access_token'],
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
@limiter.limit("10 per minute")
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

        # SECURITY: Account lockout — check BEFORE verifying password to avoid
        # timing-based user enumeration through lockout-only responses.
        if user and user.is_locked():
            from datetime import timezone
            remaining_secs = int((user.locked_until - datetime.utcnow()).total_seconds())
            remaining_min  = max(1, (remaining_secs + 59) // 60)
            current_app.logger.warning(f'Locked account login attempt: {username}')
            return jsonify({
                'error': 'Account temporarily locked',
                'message': f'Too many failed login attempts. Try again in {remaining_min} minute(s).'
            }), 429

        if not user or not user.check_password(password):
            # Record the failure (applies lockout if threshold reached)
            if user:
                user.record_failed_login(max_attempts=5, lockout_minutes=15)
                db.session.commit()
            current_app.logger.warning(f'Failed login attempt for: {username}')
            return jsonify({'error': 'Invalid username or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403

        # Successful login — reset lockout counters
        user.clear_failed_logins()

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
            'token': tokens['access_token'],
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
        refresh_token = request.current_token
        
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Generate new token pair
        new_tokens = generate_token_pair(user_id)
        
        # Blacklist the old refresh token
        blacklist_token(refresh_token)
        
        current_app.logger.info(f'Token refreshed for user: {user.id}')
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': new_tokens['access_token'],
            'refresh_token': new_tokens['refresh_token']
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Token refresh error: {e}')
        return jsonify({'error': 'An error occurred refreshing token'}), 500


@auth_routes.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user by blacklisting the current token"""
    try:
        token = getattr(request, 'current_token', None)
        if token:
            blacklist_token(token)
        
        current_app.logger.info(f'User logged out: {request.current_user_id}')
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Logout error: {e}')
        return jsonify({'error': 'An error occurred during logout'}), 500


@auth_routes.route('/google', methods=['POST'])
@limiter.limit("10 per minute")
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
            current_app.logger.warning("Failed to verify Google token")
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
        
        # Generate JWT token pair for proper session management
        tokens = generate_token_pair(user.id)
        
        return jsonify({
            'message': 'Google authentication successful',
            'token': tokens['access_token'],
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': user.to_dict(),
            'is_new_user': not user.password_hash  # True if just created
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error in Google login: {e}")
        return jsonify({'error': 'Authentication failed'}), 500


from models import PasswordResetToken
import secrets
from datetime import datetime, timedelta

@auth_routes.route('/forgot-password', methods=['POST'])
@limiter.limit("5 per hour")
def forgot_password():
    """Request password reset link/token.

    SECURITY: the raw reset token must NEVER be returned in this response.
    Anyone who knows a user's email address (not their inbox — just the
    address) could previously call this endpoint and get everything needed
    to take over that account. The token now only ever leaves this process
    inside the email we send to the account's actual registered address.
    """
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Always return the same generic message whether or not the email
        # exists AND whether or not sending succeeds — the response must not
        # leak which emails are registered or whether delivery worked.
        generic_response = jsonify({
            'message': 'If that email is registered, a password reset link has been issued.'
        }), 200

        user = User.query.filter_by(email=email).first()
        if not user:
            return generic_response

        # Invalidate any old tokens for this user
        PasswordResetToken.query.filter_by(user_id=user.id, is_used=False).update({'is_used': True})

        # Create single-use token valid for 1 hour. Only the hash is stored.
        token_str = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(token_str),
            expires_at=expires_at,
            is_used=False
        )
        db.session.add(reset_token)
        db.session.commit()

        reset_link = f"https://focuslearner.pages.dev/login?reset_token={token_str}"

        try:
            send_password_reset_email(to_email=user.email, reset_link=reset_link)
        except EmailNotConfiguredError:
            current_app.logger.warning(
                'Password reset requested but MAIL_* env vars are not set — email not sent.'
            )
            if current_app.debug:
                # DEV ONLY: never do this in production. Logged, not returned
                # to the client, so it can't be scraped via the API response.
                current_app.logger.warning(f'[DEV ONLY] Reset link: {reset_link}')
        except Exception as mail_err:
            current_app.logger.error(f'Failed to send password reset email: {mail_err}')

        return generic_response

    except Exception as e:
        current_app.logger.error(f'Forgot password error: {e}')
        db.session.rollback()
        return jsonify({'error': 'Failed to process password reset'}), 500


@auth_routes.route('/reset-password', methods=['POST'])
@limiter.limit("10 per hour")
def reset_password():
    """Submit new password with single-use reset token"""
    try:
        data = request.get_json() or {}
        token_str = data.get('token') or data.get('reset_token')
        new_password = data.get('new_password') or data.get('password')

        if not token_str or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400

        reset_token = PasswordResetToken.query.filter_by(
            token_hash=hash_reset_token(token_str), is_used=False
        ).first()
        if not reset_token:
            return jsonify({'error': 'Invalid or expired password reset token'}), 400

        if reset_token.expires_at < datetime.utcnow():
            reset_token.is_used = True
            db.session.commit()
            return jsonify({'error': 'Password reset token has expired. Please request a new link.'}), 400

        user = User.query.get(reset_token.user_id)
        if not user:
            return jsonify({'error': 'Associated user account not found'}), 404

        # Validate strength
        password_valid, password_error = validate_password_strength(new_password)
        if not password_valid:
            return jsonify({'error': password_error}), 400

        user.set_password(new_password)
        reset_token.is_used = True
        db.session.commit()

        current_app.logger.info(f'Password reset successfully for user: {user.id}')
        return jsonify({'message': 'Password reset successfully. You may now log in.'}), 200

    except Exception as e:
        current_app.logger.error(f'Reset password error: {e}')
        db.session.rollback()
        return jsonify({'error': 'An error occurred resetting your password'}), 500

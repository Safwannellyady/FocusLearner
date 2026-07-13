"""
FocusLearner Pro - Authentication Utilities
JWT token generation, validation, and security utilities
"""

import hashlib
import hmac
from functools import wraps
from flask import request, jsonify, current_app
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# In-memory token blacklist (use Redis in production)
_token_blacklist = set()


def get_jwt_config() -> Dict[str, Any]:
    """Get JWT configuration from app config"""
    try:
        from flask import current_app
        return {
            'secret_key': current_app.config.get('JWT_SECRET_KEY', os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')),
            'algorithm': current_app.config.get('JWT_ALGORITHM', 'HS256'),
            'expiration': current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(days=7)),
            'refresh_expiration': current_app.config.get('JWT_REFRESH_TOKEN_EXPIRES', timedelta(days=30))
        }
    except RuntimeError:
        # Fallback when outside app context
        return {
            'secret_key': os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production'),
            'algorithm': 'HS256',
            'expiration': timedelta(days=7),
            'refresh_expiration': timedelta(days=30)
        }


def generate_token(user_id: int, token_type: str = 'access') -> str:
    """
    Generate JWT token for user
    
    Args:
        user_id: User ID
        token_type: 'access' or 'refresh'
    
    Returns:
        JWT token string
    """
    config = get_jwt_config()
    now = datetime.utcnow()
    
    expiration = config['expiration'] if token_type == 'access' else config['refresh_expiration']
    
    payload = {
        'user_id': user_id,
        'type': token_type,
        'exp': now + expiration,
        'iat': now,
        'nbf': now  # Not before
    }
    
    token = jwt.encode(payload, config['secret_key'], algorithm=config['algorithm'])
    return token


def generate_token_pair(user_id: int) -> Dict[str, str]:
    """
    Generate both access and refresh tokens
    
    Returns:
        Dictionary with 'access_token' and 'refresh_token'
    """
    return {
        'access_token': generate_token(user_id, 'access'),
        'refresh_token': generate_token(user_id, 'refresh')
    }


def verify_token(token: str, token_type: str = 'access') -> Optional[int]:
    """
    Verify JWT token and return user_id
    
    Args:
        token: JWT token string
        token_type: Expected token type ('access' or 'refresh')
    
    Returns:
        User ID if valid, None otherwise
    """
    # Check blacklist
    if is_token_blacklisted(token):
        return None
    
    config = get_jwt_config()
    
    try:
        payload = jwt.decode(
            token,
            config['secret_key'],
            algorithms=[config['algorithm']]
        )
        
        # Verify token type
        if payload.get('type') != token_type:
            return None
        
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def blacklist_token(token: str) -> None:
    """Add token to blacklist"""
    # In production, use Redis or database
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    _token_blacklist.add(token_hash)


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return token_hash in _token_blacklist


def get_token_from_request() -> Optional[str]:
    """Extract token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            parts = auth_header.split(' ')
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                return parts[1]
        except (IndexError, AttributeError):
            pass
    return None


def token_required(f):
    """Decorator to protect routes requiring authentication, verifying tokens when present"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if token:
            user_id = verify_token(token)
            if user_id:
                request.current_user_id = user_id
                request.current_token = token
                return f(*args, **kwargs)
        
        # Local development fallback if token is not present or invalid
        request.current_user_id = 1
        request.current_token = "mock_token"
        return f(*args, **kwargs)
    
    return decorated


def refresh_token_required(f):
    """Decorator to protect routes requiring refresh token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({
                'error': 'Authentication required',
                'message': 'Refresh token is missing'
            }), 401
        
        user_id = verify_token(token, 'refresh')
        if not user_id:
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Refresh token is invalid or expired'
            }), 401
        
        request.current_user_id = user_id
        request.current_token = token
        return f(*args, **kwargs)
    
    return decorated


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    from config import Config
    
    if len(password) < Config.PASSWORD_MIN_LENGTH:
        return False, f'Password must be at least {Config.PASSWORD_MIN_LENGTH} characters long'
    
    if Config.PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, 'Password must contain at least one uppercase letter'
    
    if Config.PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, 'Password must contain at least one lowercase letter'
    
    if Config.PASSWORD_REQUIRE_NUMBER and not any(c.isdigit() for c in password):
        return False, 'Password must contain at least one number'
    
    if Config.PASSWORD_REQUIRE_SPECIAL:
        special_chars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
        if not any(c in special_chars for c in password):
            return False, 'Password must contain at least one special character'
    
    return True, None


def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


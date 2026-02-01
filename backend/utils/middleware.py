"""
FocusLearner Pro - Middleware Utilities
Common middleware functions for request processing
"""

from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime
import time


def log_request(f):
    """Decorator to log request details"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        # Log request
        current_app.logger.info(
            f'Request: {request.method} {request.path} - '
            f'IP: {request.remote_addr} - '
            f'User-Agent: {request.headers.get("User-Agent", "Unknown")}'
        )
        
        try:
            response = f(*args, **kwargs)
            elapsed = time.time() - start_time
            
            # Log response
            status_code = response[1] if isinstance(response, tuple) else 200
            current_app.logger.info(
                f'Response: {request.method} {request.path} - '
                f'Status: {status_code} - '
                f'Time: {elapsed:.3f}s'
            )
            
            return response
        except Exception as e:
            elapsed = time.time() - start_time
            current_app.logger.error(
                f'Error: {request.method} {request.path} - '
                f'Time: {elapsed:.3f}s - '
                f'Error: {str(e)}'
            )
            raise
    
    return decorated_function


def validate_json_content_type(f):
    """Decorator to validate Content-Type is application/json"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            if not request.is_json:
                return jsonify({
                    'error': 'Content-Type must be application/json'
                }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def handle_exceptions(f):
    """Decorator to handle exceptions gracefully"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            current_app.logger.warning(f'Validation error: {e}')
            return jsonify({
                'error': 'Validation error',
                'message': str(e)
            }), 400
        except KeyError as e:
            current_app.logger.warning(f'Missing key: {e}')
            return jsonify({
                'error': 'Missing required field',
                'message': f'Field {str(e)} is required'
            }), 400
        except Exception as e:
            current_app.logger.error(f'Unexpected error in {f.__name__}: {e}', exc_info=True)
            return jsonify({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred'
            }), 500
    
    return decorated_function


def rate_limit_by_user(max_requests: int = 100, window_seconds: int = 60):
    """
    Simple rate limiting decorator (in-memory, use Redis in production)
    
    Args:
        max_requests: Maximum number of requests
        window_seconds: Time window in seconds
    """
    # Simple in-memory store (use Redis in production)
    request_counts = {}
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user identifier
            user_id = getattr(request, 'current_user_id', None)
            identifier = user_id or request.remote_addr
            
            # Get current time
            now = time.time()
            
            # Clean old entries
            if identifier in request_counts:
                request_counts[identifier] = [
                    timestamp for timestamp in request_counts[identifier]
                    if now - timestamp < window_seconds
                ]
            else:
                request_counts[identifier] = []
            
            # Check rate limit
            if len(request_counts[identifier]) >= max_requests:
                current_app.logger.warning(
                    f'Rate limit exceeded for {identifier}'
                )
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Maximum {max_requests} requests per {window_seconds} seconds.'
                }), 429
            
            # Record request
            request_counts[identifier].append(now)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def cache_response(ttl_seconds: int = 300):
    """
    Simple response caching decorator (in-memory, use Redis in production)
    
    Args:
        ttl_seconds: Time to live in seconds
    """
    cache = {}
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key from request
            cache_key = f"{request.path}:{request.query_string.decode()}"
            
            # Check cache
            if cache_key in cache:
                cached_data, timestamp = cache[cache_key]
                if time.time() - timestamp < ttl_seconds:
                    current_app.logger.debug(f'Cache hit: {cache_key}')
                    return cached_data
                else:
                    del cache[cache_key]
            
            # Execute function
            response = f(*args, **kwargs)
            
            # Cache response (only for successful GET requests)
            if request.method == 'GET' and isinstance(response, tuple) and response[1] == 200:
                cache[cache_key] = (response, time.time())
                # Limit cache size
                if len(cache) > 1000:
                    # Remove oldest entries
                    sorted_items = sorted(cache.items(), key=lambda x: x[1][1])
                    for key, _ in sorted_items[:100]:
                        del cache[key]
            
            return response
        
        return decorated_function
    return decorator


def require_https(f):
    """Decorator to require HTTPS in production"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_app.config.get('ENV') == 'production':
            if not request.is_secure and request.headers.get('X-Forwarded-Proto') != 'https':
                return jsonify({
                    'error': 'HTTPS required',
                    'message': 'This endpoint requires HTTPS'
                }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

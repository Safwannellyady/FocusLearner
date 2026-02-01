"""
FocusLearner Pro - Utilities Package
Common utility functions and helpers
"""

from .auth import (
    generate_token,
    generate_token_pair,
    verify_token,
    token_required,
    refresh_token_required,
    blacklist_token,
    validate_password_strength,
    validate_email
)

from .validators import (
    validate_request_json,
    validate_string_field,
    validate_integer_field,
    validate_float_field,
    validate_enum_field,
    validate_list_field,
    sanitize_string,
    validate_pagination
)

from .middleware import (
    log_request,
    validate_json_content_type,
    handle_exceptions,
    rate_limit_by_user,
    cache_response,
    require_https
)

__all__ = [
    # Auth utilities
    'generate_token',
    'generate_token_pair',
    'verify_token',
    'token_required',
    'refresh_token_required',
    'blacklist_token',
    'validate_password_strength',
    'validate_email',
    # Validators
    'validate_request_json',
    'validate_string_field',
    'validate_integer_field',
    'validate_float_field',
    'validate_enum_field',
    'validate_list_field',
    'sanitize_string',
    'validate_pagination',
    # Middleware
    'log_request',
    'validate_json_content_type',
    'handle_exceptions',
    'rate_limit_by_user',
    'cache_response',
    'require_https',
]
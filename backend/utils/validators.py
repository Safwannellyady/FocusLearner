"""
FocusLearner Pro - Validation Utilities
Common validation functions for request data
"""

import re
from typing import Any, Optional, Dict, List
from flask import request, jsonify


def validate_request_json(required_fields: List[str] = None, optional_fields: Dict[str, Any] = None) -> tuple[bool, Optional[Dict], Optional[str]]:
    """
    Validate request JSON data
    
    Args:
        required_fields: List of required field names
        optional_fields: Dict of optional fields with default values
    
    Returns:
        Tuple of (is_valid, data_dict, error_message)
    """
    if not request.is_json:
        return False, None, 'Request must be JSON'
    
    data = request.get_json()
    if not data:
        return False, None, 'Request body is required'
    
    # Check required fields
    if required_fields:
        missing = [field for field in required_fields if field not in data or data[field] is None]
        if missing:
            return False, None, f'Missing required fields: {", ".join(missing)}'
    
    # Apply defaults for optional fields
    if optional_fields:
        for field, default_value in optional_fields.items():
            if field not in data:
                data[field] = default_value
    
    return True, data, None


def validate_string_field(value: Any, field_name: str, min_length: int = 0, max_length: int = None, 
                         allow_empty: bool = False) -> tuple[bool, Optional[str]]:
    """
    Validate a string field
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if value is None:
        if allow_empty:
            return True, None
        return False, f'{field_name} is required'
    
    if not isinstance(value, str):
        return False, f'{field_name} must be a string'
    
    value = value.strip()
    
    if not value and not allow_empty:
        return False, f'{field_name} cannot be empty'
    
    if min_length and len(value) < min_length:
        return False, f'{field_name} must be at least {min_length} characters'
    
    if max_length and len(value) > max_length:
        return False, f'{field_name} must be at most {max_length} characters'
    
    return True, None


def validate_integer_field(value: Any, field_name: str, min_value: int = None, 
                          max_value: int = None, allow_none: bool = False) -> tuple[bool, Optional[str]]:
    """
    Validate an integer field
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if value is None:
        if allow_none:
            return True, None
        return False, f'{field_name} is required'
    
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        return False, f'{field_name} must be an integer'
    
    if min_value is not None and int_value < min_value:
        return False, f'{field_name} must be at least {min_value}'
    
    if max_value is not None and int_value > max_value:
        return False, f'{field_name} must be at most {max_value}'
    
    return True, None


def validate_float_field(value: Any, field_name: str, min_value: float = None, 
                        max_value: float = None, allow_none: bool = False) -> tuple[bool, Optional[str]]:
    """
    Validate a float field
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if value is None:
        if allow_none:
            return True, None
        return False, f'{field_name} is required'
    
    try:
        float_value = float(value)
    except (ValueError, TypeError):
        return False, f'{field_name} must be a number'
    
    if min_value is not None and float_value < min_value:
        return False, f'{field_name} must be at least {min_value}'
    
    if max_value is not None and float_value > max_value:
        return False, f'{field_name} must be at most {max_value}'
    
    return True, None


def validate_enum_field(value: Any, field_name: str, allowed_values: List[str], 
                       case_sensitive: bool = False) -> tuple[bool, Optional[str]]:
    """
    Validate an enum field
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if value is None:
        return False, f'{field_name} is required'
    
    if not isinstance(value, str):
        return False, f'{field_name} must be a string'
    
    value = value.strip()
    
    if not case_sensitive:
        value = value.lower()
        allowed_values = [v.lower() for v in allowed_values]
    
    if value not in allowed_values:
        return False, f'{field_name} must be one of: {", ".join(allowed_values)}'
    
    return True, None


def validate_list_field(value: Any, field_name: str, min_length: int = 0, 
                       max_length: int = None, item_type: type = None) -> tuple[bool, Optional[str]]:
    """
    Validate a list field
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if value is None:
        return False, f'{field_name} is required'
    
    if not isinstance(value, list):
        return False, f'{field_name} must be a list'
    
    if len(value) < min_length:
        return False, f'{field_name} must have at least {min_length} items'
    
    if max_length and len(value) > max_length:
        return False, f'{field_name} must have at most {max_length} items'
    
    if item_type:
        for item in value:
            if not isinstance(item, item_type):
                return False, f'All items in {field_name} must be of type {item_type.__name__}'
    
    return True, None


def sanitize_string(value: str, max_length: int = None) -> str:
    """
    Sanitize a string value
    
    Args:
        value: String to sanitize
        max_length: Maximum length to truncate to
    
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        return ''
    
    # Remove leading/trailing whitespace
    value = value.strip()
    
    # Remove control characters except newlines and tabs
    value = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
    
    # Truncate if needed
    if max_length and len(value) > max_length:
        value = value[:max_length]
    
    return value


def validate_pagination(page: Any, per_page: Any, max_per_page: int = 100) -> tuple[bool, Optional[int], Optional[int], Optional[str]]:
    """
    Validate pagination parameters
    
    Returns:
        Tuple of (is_valid, page_num, per_page_num, error_message)
    """
    try:
        page_num = int(page) if page else 1
        per_page_num = int(per_page) if per_page else 20
    except (ValueError, TypeError):
        return False, None, None, 'Invalid pagination parameters'
    
    if page_num < 1:
        return False, None, None, 'Page must be at least 1'
    
    if per_page_num < 1:
        return False, None, None, 'Per page must be at least 1'
    
    if per_page_num > max_per_page:
        return False, None, None, f'Per page cannot exceed {max_per_page}'
    
    return True, page_num, per_page_num, None

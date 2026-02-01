"""
FocusLearner Pro - Helper Utilities
Common helper functions for various operations
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import json


def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime to ISO string"""
    if dt is None:
        return None
    return dt.isoformat()


def parse_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO datetime string"""
    if not dt_str:
        return None
    try:
        # Handle both with and without timezone
        if dt_str.endswith('Z'):
            dt_str = dt_str.replace('Z', '+00:00')
        return datetime.fromisoformat(dt_str)
    except (ValueError, AttributeError):
        return None


def calculate_duration_minutes(start: datetime, end: Optional[datetime] = None) -> float:
    """Calculate duration in minutes between two datetimes"""
    if end is None:
        end = datetime.utcnow()
    
    if start > end:
        return 0.0
    
    delta = end - start
    return round(delta.total_seconds() / 60, 1)


def safe_json_loads(data: str, default: Any = None) -> Any:
    """Safely parse JSON string with fallback"""
    if not data:
        return default
    
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return default


def safe_json_dumps(data: Any, default: str = '[]') -> str:
    """Safely serialize to JSON string with fallback"""
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return default


def truncate_string(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """Truncate string to max length"""
    if not text:
        return ''
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def calculate_percentage(part: float, total: float, default: float = 0.0) -> float:
    """Calculate percentage safely"""
    if total == 0:
        return default
    
    return round((part / total) * 100, 2)


def clamp_value(value: float, min_val: float, max_val: float) -> float:
    """Clamp value between min and max"""
    return max(min_val, min(max_val, value))


def get_days_ago(days: int) -> datetime:
    """Get datetime N days ago"""
    return datetime.utcnow() - timedelta(days=days)


def get_week_range() -> tuple[datetime, datetime]:
    """Get start and end of current week (Monday to Sunday)"""
    now = datetime.utcnow()
    # Get Monday of current week
    days_since_monday = now.weekday()
    start = now - timedelta(days=days_since_monday)
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    return start, end


def group_by_key(items: List[Dict], key: str) -> Dict[str, List[Dict]]:
    """Group list of dictionaries by a key"""
    grouped = {}
    for item in items:
        group_key = item.get(key)
        if group_key not in grouped:
            grouped[group_key] = []
        grouped[group_key].append(item)
    return grouped


def paginate_list(items: List, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
    """Paginate a list of items"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page if total > 0 else 0
    }


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    import re
    # Remove invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    # Limit length
    if len(filename) > 255:
        filename = filename[:255]
    return filename


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} PB"

#!/usr/bin/env python3
"""
FocusLearner Pro - Application Validation Script
Validates that the application can be imported and configured correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def validate_imports():
    """Validate all critical imports"""
    print("Validating imports...")
    
    try:
        from config import get_config
        print("  [OK] config module")
    except Exception as e:
        print(f"  [FAIL] config module: {e}")
        return False
    
    try:
        from models import db
        print("  [OK] models module")
    except Exception as e:
        print(f"  [FAIL] models module: {e}")
        return False
    
    try:
        from utils.auth import token_required
        print("  [OK] utils.auth module")
    except Exception as e:
        print(f"  [FAIL] utils.auth module: {e}")
        return False
    
    try:
        from utils.validators import validate_request_json
        print("  [OK] utils.validators module")
    except Exception as e:
        print(f"  [FAIL] utils.validators module: {e}")
        return False
    
    try:
        from utils.middleware import log_request
        print("  [OK] utils.middleware module")
    except Exception as e:
        print(f"  [FAIL] utils.middleware module: {e}")
        return False
    
    try:
        from utils.helpers import format_datetime
        print("  [OK] utils.helpers module")
    except Exception as e:
        print(f"  [FAIL] utils.helpers module: {e}")
        return False
    
    # Validate route imports
    routes = [
        'routes.focus_routes',
        'routes.content_routes',
        'routes.game_routes',
        'routes.auth_routes',
        'routes.preferences_routes',
        'routes.lecture_routes',
        'routes.chat_routes',
        'routes.taxonomy_routes',
        'routes.analytics_routes',
    ]
    
    print("\nValidating route modules...")
    for route in routes:
        try:
            __import__(route)
            print(f"  [OK] {route}")
        except Exception as e:
            print(f"  [FAIL] {route}: {e}")
            return False
    
    # Validate service imports
    services = [
        'services.ai_service',
        'services.analytics_service',
        'services.youtube_service',
        'services.game_service',
    ]
    
    print("\nValidating service modules...")
    for service in services:
        try:
            __import__(service)
            print(f"  [OK] {service}")
        except Exception as e:
            print(f"  [FAIL] {service}: {e}")
            return False
    
    return True


def validate_app_creation():
    """Validate Flask app can be created"""
    print("\nValidating Flask application creation...")
    
    try:
        from app import app
        print("  [OK] Flask app created successfully")
        
        # Check configuration
        if hasattr(app, 'config'):
            print(f"  [OK] App configuration loaded")
            print(f"    - Environment: {app.config.get('FLASK_ENV', 'unknown')}")
            print(f"    - Debug: {app.config.get('DEBUG', False)}")
            print(f"    - API Version: {app.config.get('API_VERSION', 'unknown')}")
        
        # Check blueprints
        blueprint_count = len(app.blueprints)
        print(f"  [OK] {blueprint_count} blueprints registered")
        
        return True
    except Exception as e:
        print(f"  [FAIL] Failed to create Flask app: {e}")
        import traceback
        traceback.print_exc()
        return False


def validate_config():
    """Validate configuration"""
    print("\nValidating configuration...")
    
    try:
        from config import get_config
        config = get_config()
        
        print(f"  [OK] Configuration class: {config.__name__}")
        db_uri = config.SQLALCHEMY_DATABASE_URI
        print(f"    - Database URI: {db_uri[:50]}...")
        print(f"    - JWT Algorithm: {config.JWT_ALGORITHM}")
        print(f"    - CORS Origins: {len(config.CORS_ORIGINS)} configured")
        
        return True
    except Exception as e:
        print(f"  [FAIL] Configuration error: {e}")
        return False


def main():
    """Main validation function"""
    print("=" * 60)
    print("FocusLearner Pro - Application Validation")
    print("=" * 60)
    print()
    
    all_passed = True
    
    # Validate imports
    if not validate_imports():
        all_passed = False
    
    # Validate configuration
    if not validate_config():
        all_passed = False
    
    # Validate app creation
    if not validate_app_creation():
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("[SUCCESS] All validations passed!")
        print("\nApplication is ready to run.")
        print("Start the server with: python app.py")
    else:
        print("[ERROR] Some validations failed.")
        print("Please fix the errors above before running the application.")
        sys.exit(1)
    print("=" * 60)


if __name__ == '__main__':
    main()

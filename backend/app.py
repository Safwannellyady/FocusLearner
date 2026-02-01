"""
FocusLearner Pro - Backend API Server
Main Flask application for handling API requests
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
import os
from dotenv import load_dotenv

load_dotenv()

# Import configuration
from config import config

app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config.get(env, config['default']))

# Initialize CORS
CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']))

# Initialize rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[app.config.get('RATELIMIT_DEFAULT', '100 per hour')],
    storage_uri=app.config.get('RATELIMIT_STORAGE_URL', 'memory://'),
    enabled=app.config.get('RATELIMIT_ENABLED', True)
)

# Initialize caching
cache = Cache(app, config={
    'CACHE_TYPE': app.config.get('CACHE_TYPE', 'simple'),
    'CACHE_DEFAULT_TIMEOUT': app.config.get('CACHE_DEFAULT_TIMEOUT', 300),
    'CACHE_KEY_PREFIX': app.config.get('CACHE_KEY_PREFIX', 'focuslearner_')
})

# Import models and initialize db
from models import db, User, FocusSession, GameProgress, UserPreferences, Lecture
db.init_app(app)

# Setup logging
from utils.logger import setup_logging
setup_logging(app)

# Register error handlers
from utils.errors import register_error_handlers
register_error_handlers(app)

# Import and register routes
from routes.focus_routes import focus_routes
from routes.content_routes import content_routes
from routes.game_routes import game_routes
from routes.auth_routes import auth_routes
from routes.preferences_routes import preferences_routes
from routes.lecture_routes import lecture_routes
from routes.chat_routes import chat_routes
from routes.taxonomy_routes import taxonomy_bp
from routes.analytics_routes import analytics_bp

app.register_blueprint(focus_routes)
app.register_blueprint(content_routes)
app.register_blueprint(game_routes)
app.register_blueprint(auth_routes)
app.register_blueprint(preferences_routes)
app.register_blueprint(lecture_routes)
app.register_blueprint(chat_routes)
app.register_blueprint(taxonomy_bp, url_prefix='/api/taxonomy')
app.register_blueprint(analytics_bp)

@app.route('/api/health', methods=['GET'])
@limiter.exempt
def health_check():
    """Comprehensive health check endpoint"""
    from models import db
    from datetime import datetime
    
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'database': 'connected' if _check_database() else 'disconnected',
        'services': {
            'api': 'operational',
            'database': 'operational' if _check_database() else 'degraded'
        }
    }
    
    status_code = 200 if health_status['database'] == 'connected' else 503
    return jsonify(health_status), status_code

def _check_database():
    """Check database connectivity"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return True
    except Exception:
        return False

@app.route('/api', methods=['GET'])
@limiter.exempt
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'FocusLearner Pro API',
        'version': '1.0.0',
        'description': 'A Unified, Contextual, and Gamified Learning Ecosystem',
        'endpoints': {
            'auth': '/api/auth',
            'focus': '/api/focus',
            'content': '/api/content',
            'game': '/api/game',
            'lectures': '/api/lectures',
            'chat': '/api/chat',
            'preferences': '/api/preferences',
            'taxonomy': '/api/taxonomy',
            'analytics': '/api/analytics'
        },
        'documentation': '/api/docs'  # Future: Add Swagger/OpenAPI docs
    })

# Create tables on startup
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Database tables initialized")
    except Exception as e:
        app.logger.error(f"Error initializing database: {e}")

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
        app.logger.info("FocusLearner Pro API starting...")
        app.logger.info(f"Environment: {env}")
        app.logger.info(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    app.run(
        debug=app.config.get('DEBUG', False),
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )




"""
FocusLearner Pro - Backend API Server
Main Flask application for handling API requests
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

from config import get_config
from extensions import limiter

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Load configuration
config_class = get_config()
app.config.from_object(config_class)
config_class.init_app(app)

if getattr(config_class, '_SECRET_KEY_IS_EPHEMERAL', False):
    print(
        "WARNING: SECRET_KEY is not set as an environment variable. A random "
        "key was generated for this process only — every logged-in user will "
        "be signed out the next time this service restarts or redeploys. "
        "Set SECRET_KEY and JWT_SECRET_KEY as fixed environment variables in "
        "Railway to fix this."
    )

# Rate limiting — storage_uri/default_limits are set on the Limiter
# constructor in extensions.py (init_app() doesn't accept them). Storage
# defaults to in-memory (per-worker); move RATELIMIT_STORAGE_URL to a Redis
# URL once you run multiple Gunicorn workers so limits are enforced globally
# instead of per-process.
limiter.init_app(app)
if not app.config.get('RATELIMIT_ENABLED', True):
    limiter.enabled = False

# NOTE: never print the full SQLALCHEMY_DATABASE_URI — it contains the DB
# password and Railway captures stdout as logs. If you need to sanity-check
# which database is active, print only the host/db name, e.g.:
#   from urllib.parse import urlparse
#   parsed = urlparse(app.config.get('SQLALCHEMY_DATABASE_URI', ''))
#   app.logger.info(f"DB host={parsed.hostname} db={parsed.path.lstrip('/')}")


# Configure CORS with proper settings for Cloudflare and local development
CORS(
    app,
    resources={
        r"/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    },
    supports_credentials=True
)

@app.before_request
def handle_preflight():
    """Handle CORS preflight OPTIONS requests cleanly before middleware.

    SECURITY: origins must be checked with an EXACT match against the
    allow-list. The previous check accepted any origin containing the
    substring "localhost" (e.g. https://localhost.attacker.com) and any
    origin ending in ".pages.dev" — which is shared public Cloudflare Pages
    hosting, so that accepted every other project on the platform too, not
    just this one. Combined with Access-Control-Allow-Credentials: true,
    that let any such origin make authenticated, cookie/credential-bearing
    requests against this API.
    """
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get("Origin")
        allowed = set(app.config.get('CORS_ORIGINS', []))
        allowed.add('https://focuslearner.pages.dev')
        if origin and origin in allowed:
            response.headers.add("Access-Control-Allow-Origin", origin)
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
        # If the origin isn't on the allow-list, we simply don't add any
        # Access-Control-Allow-* headers — the browser will then correctly
        # block the response on the caller's side.
        return response, 200


# Configure logging
if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler(
        f"logs/{app.config['LOG_FILE']}",
        maxBytes=10240000,
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(getattr(logging, app.config['LOG_LEVEL']))
    app.logger.addHandler(file_handler)
    app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
    app.logger.info('FocusLearner Pro startup')

# Import models and initialize db
from models import db
from sqlalchemy import text
db.init_app(app)

with app.app_context():
    try:
        db.create_all()

        # Auto-migrate missing schema columns into existing PostgreSQL tables
        migrations = [
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS topic VARCHAR(255) DEFAULT '';",
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS selected_lab VARCHAR(100) DEFAULT '';",
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS elapsed_seconds INTEGER DEFAULT 0;",
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;",
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';",
            "ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';",
            "ALTER TABLE lectures ADD COLUMN IF NOT EXISTS lab_config TEXT;",
            "ALTER TABLE lectures ADD COLUMN IF NOT EXISTS game_config TEXT;",
            "ALTER TABLE lectures ADD COLUMN IF NOT EXISTS quiz_config TEXT;",
            # password_reset_tokens: move from storing raw tokens to storing
            # a SHA-256 hash. The old `token` column's NOT NULL constraint is
            # relaxed so new rows (which no longer set it) can still insert;
            # it can be dropped entirely in a later cleanup once you've
            # confirmed nothing else reads it.
            "ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash VARCHAR(128);",
            "ALTER TABLE password_reset_tokens ALTER COLUMN token DROP NOT NULL;",
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens (token_hash);",
            # Account lockout columns — brute-force protection (2026-08-15)
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;",
        ]
        for query in migrations:
            try:
                db.session.execute(text(query))
            except Exception as m_err:
                app.logger.warning(f"Migration note: {m_err}")
        db.session.commit()
        app.logger.info('Database tables & column schema auto-migrated successfully')
    except Exception as e:
        app.logger.error(f'Error auto-creating database tables: {e}')



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
from routes.badges_routes import badges_routes
from routes.material_routes import material_routes
from routes.srs_routes import srs_routes
from routes.room_routes import room_routes
from routes.support_routes import support_routes

app.register_blueprint(focus_routes)
app.register_blueprint(content_routes)
app.register_blueprint(game_routes)
app.register_blueprint(auth_routes)
app.register_blueprint(preferences_routes)
app.register_blueprint(lecture_routes)
app.register_blueprint(chat_routes)
app.register_blueprint(taxonomy_bp, url_prefix='/api/taxonomy')
app.register_blueprint(analytics_bp)
app.register_blueprint(badges_routes)
app.register_blueprint(material_routes)
app.register_blueprint(srs_routes)
app.register_blueprint(room_routes)
app.register_blueprint(support_routes, url_prefix='/api/support')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found',
        'status_code': 404
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    db.session.rollback()
    app.logger.error(f'Server Error: {error}', exc_info=True)
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'status_code': 500
    }), 500


@app.errorhandler(HTTPException)
def handle_http_exception(e):
    """Handle HTTP exceptions"""
    return jsonify({
        'error': e.name.lower().replace(' ', '_'),
        'message': e.description,
        'status_code': e.code
    }), e.code


@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all other exceptions"""
    app.logger.error(f'Unhandled Exception: {e}', exc_info=True)
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'status_code': 500
    }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with database status"""
    try:
        # Check database connection
        db.session.execute(db.text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        app.logger.error(f'Database health check failed: {e}')
        db_status = 'disconnected'
    
    status_code = 200 if db_status == 'connected' else 503
    
    return jsonify({
        'status': 'healthy' if db_status == 'connected' else 'degraded',
        'message': 'FocusLearner Pro API is running',
        'database': db_status,
        'version': app.config['API_VERSION']
    }), status_code


@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'FocusLearner Pro API',
        'version': app.config['API_VERSION'],
        'environment': os.getenv('FLASK_ENV', 'development'),
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth',
            'focus': '/api/focus',
            'content': '/api/content',
            'game': '/api/game',
            'lectures': '/api/lectures',
            'chat': '/api/chat',
            'analytics': '/api/analytics',
            'taxonomy': '/api/taxonomy'
        }
    })


@app.before_request
def before_request():
    """Log request information"""
    if app.debug:
        app.logger.debug(f'{request.method} {request.path} - {request.remote_addr}')


@app.after_request
def after_request(response):
    """Add security headers and log response"""
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    if app.debug:
        app.logger.debug(f'{request.method} {request.path} - Status: {response.status_code}')
    
    return response

from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    """Serve uploaded static files"""
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    return send_from_directory(os.path.abspath(upload_folder), filename)

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        try:
            db.create_all()
            app.logger.info('Database tables created/verified successfully')
        except Exception as e:
            app.logger.error(f'Error creating database tables: {e}')
            raise
        
        # Ensure upload folder exists
        upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder, exist_ok=True)
            app.logger.info(f"Created upload directory: {upload_folder}")
        
        # Note: Users should register through /api/auth/register endpoint
        # No default test user is created automatically
    
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.logger.info(f'Starting FocusLearner Pro API on {host}:{port}')
    app.run(debug=app.config['DEBUG'], host=host, port=port)




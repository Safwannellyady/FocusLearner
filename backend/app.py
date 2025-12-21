"""
FocusLearner Pro - Backend API Server
Main Flask application for handling API requests
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Use SQLite for development if PostgreSQL is not available
database_url = os.getenv('DATABASE_URL')
if not database_url:
    # Default to SQLite for easy setup
    database_url = 'sqlite:///focuslearner.db'
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

# Import models and initialize db
from models import db, User, FocusSession, GameProgress, UserPreferences, Lecture
db.init_app(app)

# Import and register routes
from routes.focus_routes import focus_routes
from routes.content_routes import content_routes
from routes.game_routes import game_routes
from routes.auth_routes import auth_routes
from routes.preferences_routes import preferences_routes
from routes.lecture_routes import lecture_routes
from routes.chat_routes import chat_routes

app.register_blueprint(focus_routes)
app.register_blueprint(content_routes)
app.register_blueprint(game_routes)
app.register_blueprint(auth_routes)
app.register_blueprint(preferences_routes)
app.register_blueprint(lecture_routes)
app.register_blueprint(chat_routes)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'FocusLearner Pro API is running'
    })

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'FocusLearner Pro API',
        'version': '1.0.0',
        'endpoints': {
            'focus': '/api/focus',
            'content': '/api/content',
            'game': '/api/game'
        }
    })

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        # Note: Users should register through /api/auth/register endpoint
        # No default test user is created automatically
    
    app.run(debug=True, host='0.0.0.0', port=5000)




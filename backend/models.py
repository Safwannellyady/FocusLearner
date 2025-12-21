"""
FocusLearner Pro - Database Models
SQLAlchemy models for user data, focus sessions, and progress tracking
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class SubjectFocus(str, Enum):
    """Enumeration of available subject focuses"""
    ECE_NETWORK_ANALYSIS = "ECE/Network Analysis"
    ECE_CIRCUIT_THEORY = "ECE/Circuit Theory"
    CS_ALGORITHMS = "CS/Algorithms"
    CS_DATA_STRUCTURES = "CS/Data Structures"
    MATH_LINEAR_ALGEBRA = "Math/Linear Algebra"
    MATH_CALCULUS = "Math/Calculus"


class User(db.Model):
    """User model for storing student profiles"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    streak_days = db.Column(db.Integer, default=0)
    
    # Relationships
    focus_sessions = db.relationship('FocusSession', backref='user', lazy=True)
    game_progress = db.relationship('GameProgress', backref='user', lazy=True)
    preferences = db.relationship('UserPreferences', backref='user', uselist=False, lazy=True)
    lectures = db.relationship('Lecture', backref='user', lazy=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active,
            'streak_days': self.streak_days,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }


class FocusSession(db.Model):
    """Focus session model for tracking active learning sessions"""
    __tablename__ = 'focus_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_focus = db.Column(db.String(100), nullable=False)
    is_locked = db.Column(db.Boolean, default=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)
    current_video_id = db.Column(db.String(100), nullable=True)
    current_timestamp = db.Column(db.Integer, default=0)  # Video timestamp in seconds
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subject_focus': self.subject_focus,
            'is_locked': self.is_locked,
            'started_at': self.started_at.isoformat(),
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'current_video_id': self.current_video_id,
            'current_timestamp': self.current_timestamp
        }


class ContentItem(db.Model):
    """Content item model for storing aggregated educational content"""
    __tablename__ = 'content_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(50), nullable=False)  # 'youtube', 'nptel', 'udemy'
    source_id = db.Column(db.String(200), nullable=False)  # Video ID or course ID
    url = db.Column(db.String(1000), nullable=False)
    subject_focus = db.Column(db.String(100), nullable=False)
    is_approved = db.Column(db.Boolean, default=True)
    is_filtered = db.Column(db.Boolean, default=False)  # True if filtered out
    filter_reason = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'source': self.source,
            'source_id': self.source_id,
            'url': self.url,
            'subject_focus': self.subject_focus,
            'is_approved': self.is_approved,
            'is_filtered': self.is_filtered,
            'filter_reason': self.filter_reason,
            'created_at': self.created_at.isoformat()
        }


class GameProgress(db.Model):
    """Game progress model for tracking student performance in gamified challenges"""
    __tablename__ = 'game_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_module = db.Column(db.String(100), nullable=False)  # e.g., 'kcl_challenge'
    subject_focus = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    mastery_points = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_module': self.game_module,
            'subject_focus': self.subject_focus,
            'score': self.score,
            'level': self.level,
            'mastery_points': self.mastery_points,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat()
        }


class UserPreferences(db.Model):
    """User preferences model for storing learning preferences"""
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    preferred_subjects = db.Column(db.Text, nullable=True)  # JSON array of subjects
    preferred_topics = db.Column(db.Text, nullable=True)  # JSON array of topics
    difficulty_level = db.Column(db.String(20), default='intermediate')  # beginner, intermediate, advanced
    learning_style = db.Column(db.String(50), nullable=True)  # visual, auditory, kinesthetic
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preferred_subjects': json.loads(self.preferred_subjects) if self.preferred_subjects else [],
            'preferred_topics': json.loads(self.preferred_topics) if self.preferred_topics else [],
            'difficulty_level': self.difficulty_level,
            'learning_style': self.learning_style,
            'updated_at': self.updated_at.isoformat()
        }


class Lecture(db.Model):
    """Lecture model for user-created learning sessions"""
    __tablename__ = 'lectures'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    video_ids = db.Column(db.Text, nullable=True)  # JSON array of video IDs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'subject': self.subject,
            'topic': self.topic,
            'description': self.description,
            'video_ids': json.loads(self.video_ids) if self.video_ids else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active
        }


class ChatMessage(db.Model):
    """Chat message model for storing AI tutor conversations"""
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    focus_session_id = db.Column(db.Integer, db.ForeignKey('focus_sessions.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=True)
    video_id = db.Column(db.String(100), nullable=True)
    timestamp = db.Column(db.Integer, nullable=True)  # Video timestamp when question was asked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'focus_session_id': self.focus_session_id,
            'message': self.message,
            'response': self.response,
            'video_id': self.video_id,
            'timestamp': self.timestamp,
            'created_at': self.created_at.isoformat()
        }


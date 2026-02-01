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
    focus_sessions = db.relationship('FocusSession', backref='user', lazy=True, cascade='all, delete-orphan')
    game_progress = db.relationship('GameProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    distraction_logs = db.relationship('DistractionLog', backref='user', lazy=True, cascade='all, delete-orphan')
    preferences = db.relationship('UserPreferences', backref='user', uselist=False, lazy=True, cascade='all, delete-orphan')
    lectures = db.relationship('Lecture', backref='user', lazy=True, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True, cascade='all, delete-orphan')
    courses = db.relationship('Course', backref='user', lazy=True, cascade='all, delete-orphan')
    activity_results = db.relationship('ActivityResult', backref='user', lazy=True, cascade='all, delete-orphan')
    learning_loop_states = db.relationship('LearningLoopState', backref='user', lazy=True, cascade='all, delete-orphan')
    topic_mastery = db.relationship('UserTopicMastery', backref='user', lazy=True, cascade='all, delete-orphan')
    
    # Indexes for performance
    __table_args__ = (
        db.Index('idx_user_email', 'email'),
        db.Index('idx_user_username', 'username'),
        db.Index('idx_user_active', 'is_active'),
    )
    
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    subject_focus = db.Column(db.String(100), nullable=False, index=True)
    is_locked = db.Column(db.Boolean, default=False, index=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    current_video_id = db.Column(db.String(100), nullable=True)
    current_timestamp = db.Column(db.Integer, default=0)  # Video timestamp in seconds
    
    # Relationships
    distraction_logs = db.relationship('DistractionLog', backref='focus_session', lazy=True, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='focus_session', lazy=True, cascade='all, delete-orphan')
    
    __table_args__ = (
        db.Index('idx_focus_user_active', 'user_id', 'is_locked'),
        db.Index('idx_focus_started', 'started_at'),
    )
    
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
    source = db.Column(db.String(50), nullable=False, index=True)  # 'youtube', 'nptel', 'udemy'
    source_id = db.Column(db.String(200), nullable=False, unique=True)  # Video ID or course ID
    url = db.Column(db.String(1000), nullable=False)
    subject_focus = db.Column(db.String(100), nullable=False, index=True)
    is_approved = db.Column(db.Boolean, default=True, index=True)
    is_filtered = db.Column(db.Boolean, default=False, index=True)  # True if filtered out
    filter_reason = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.Index('idx_content_subject_approved', 'subject_focus', 'is_approved', 'is_filtered'),
    )
    
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    game_module = db.Column(db.String(100), nullable=False, index=True)  # e.g., 'kcl_challenge'
    subject_focus = db.Column(db.String(100), nullable=False, index=True)
    score = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    mastery_points = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.Index('idx_game_user_module', 'user_id', 'game_module'),
        db.UniqueConstraint('user_id', 'game_module', 'subject_focus', name='uq_user_game_subject'),
    )
    
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
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


class Course(db.Model):
    """Course model (Class/Book) containing multiple lectures"""
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    lectures = db.relationship('Lecture', backref='course', lazy=True, cascade="all, delete-orphan")
    
    __table_args__ = (
        db.Index('idx_course_user_subject', 'user_id', 'subject'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'subject': self.subject,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'lecture_count': len(self.lectures)
        }


class Lecture(db.Model):
    """Lecture model for user-created learning sessions"""
    __tablename__ = 'lectures'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='SET NULL'), nullable=True, index=True) # Optional for now to support old lectures
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False, index=True)
    topic = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    video_ids = db.Column(db.Text, nullable=True)  # JSON array of video IDs
    
    # Link to centralized Learning Intent
    learning_intent_id = db.Column(db.Integer, db.ForeignKey('learning_intents.id', ondelete='SET NULL'), nullable=True, index=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    __table_args__ = (
        db.Index('idx_lecture_user_subject', 'user_id', 'subject', 'is_active'),
    )
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    focus_session_id = db.Column(db.Integer, db.ForeignKey('focus_sessions.id', ondelete='SET NULL'), nullable=True, index=True)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=True)
    video_id = db.Column(db.String(100), nullable=True, index=True)
    timestamp = db.Column(db.Integer, nullable=True)  # Video timestamp when question was asked
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.Index('idx_chat_user_session', 'user_id', 'focus_session_id', 'created_at'),
    )
    
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


class DistractionLog(db.Model):
    """Model for tracking user distractions (tab switching)"""
    __tablename__ = 'distraction_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    focus_session_id = db.Column(db.Integer, db.ForeignKey('focus_sessions.id', ondelete='CASCADE'), nullable=True, index=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=True) # Duration in seconds
    reason = db.Column(db.String(200), nullable=True, index=True) # e.g., "tab_switch", "window_blur"
    
    __table_args__ = (
        db.Index('idx_distraction_user_session', 'user_id', 'focus_session_id', 'started_at'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'focus_session_id': self.focus_session_id,
            'started_at': self.started_at.isoformat(),
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration': self.duration,
            'reason': self.reason
        }
class GameChallenge(db.Model):
    """Model for storing generated challenges to verify answers later"""
    __tablename__ = 'game_challenges'
    
    id = db.Column(db.String(36), primary_key=True) # UUID
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True) # Optional, if generated for specific user
    subject = db.Column(db.String(100), nullable=False, index=True)
    topic = db.Column(db.String(200), nullable=False, index=True)
    activity_type = db.Column(db.String(50), nullable=False, index=True) # coding, lab, crossword
    
    # Link to centralized Learning Intent
    learning_intent_id = db.Column(db.Integer, db.ForeignKey('learning_intents.id', ondelete='SET NULL'), nullable=True, index=True)
    
    # Store the full generated content including secret solution
    data = db.Column(db.Text, nullable=False) # JSON string
    solution = db.Column(db.Text, nullable=False) # JSON string or specific answer
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    activity_results = db.relationship('ActivityResult', backref='challenge', lazy=True, cascade='all, delete-orphan')
    
    __table_args__ = (
        db.Index('idx_challenge_subject_topic', 'subject', 'topic', 'activity_type'),
    )
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'subject': self.subject,
            'topic': self.topic,
            'type': self.activity_type,
            'data': json.loads(self.data),
            'created_at': self.created_at.isoformat()
        }

class ActivityResult(db.Model):
    """Immutable log of every activity attempt"""
    __tablename__ = 'activity_results'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    challenge_id = db.Column(db.String(36), db.ForeignKey('game_challenges.id', ondelete='CASCADE'), nullable=False, index=True)
    
    user_answer = db.Column(db.Text, nullable=True) # JSON or string
    is_correct = db.Column(db.Boolean, nullable=False, index=True)
    score_raw = db.Column(db.Float, default=0.0)
    xp_earned = db.Column(db.Integer, default=0)
    focus_violations = db.Column(db.Integer, default=0)
    
    feedback = db.Column(db.Text, nullable=True) # Auto-generated feedback
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.Index('idx_result_user_challenge', 'user_id', 'challenge_id', 'created_at'),
    )

class LearningIntent(db.Model):
    """Centralized Learning Intent Object (Taxonomy)"""
    __tablename__ = 'learning_intents'
    
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False, index=True)
    topic = db.Column(db.String(200), nullable=False, index=True)
    sub_topic = db.Column(db.String(200), nullable=True)
    difficulty = db.Column(db.String(50), default='Intermediate', index=True) # Beginner, Intermediate, Advanced
    required_outcomes = db.Column(db.Text, nullable=True) # JSON list of outcomes
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    lectures = db.relationship('Lecture', backref='learning_intent', lazy=True)
    challenges = db.relationship('GameChallenge', backref='learning_intent', lazy=True)
    loop_states = db.relationship('LearningLoopState', backref='learning_intent', lazy=True)
    
    __table_args__ = (
        db.Index('idx_intent_subject_topic', 'subject', 'topic'),
        db.UniqueConstraint('subject', 'topic', 'sub_topic', name='uq_learning_intent'),
    )
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'subject': self.subject,
            'topic': self.topic,
            'sub_topic': self.sub_topic,
            'difficulty': self.difficulty,
            'required_outcomes': json.loads(self.required_outcomes) if self.required_outcomes else [],
            'created_at': self.created_at.isoformat()
        }

class LearningStage(str, Enum):
    UNDERSTAND = "UNDERSTAND"   # Watch Lecture
    APPLY = "APPLY"             # Do Activity
    REMEDIATE = "REMEDIATE"     # Failed, needs review
    MASTERED = "MASTERED"       # Completed

class LearningLoopState(db.Model):
    __tablename__ = 'learning_loop_states'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    learning_intent_id = db.Column(db.Integer, db.ForeignKey('learning_intents.id', ondelete='CASCADE'), nullable=False, index=True)
    current_stage = db.Column(db.Enum(LearningStage), default=LearningStage.UNDERSTAND, index=True)
    attempts = db.Column(db.Integer, default=0)
    last_feedback = db.Column(db.Text, nullable=True) # AI analysis of failure
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'learning_intent_id', name='uq_user_learning_loop'),
        db.Index('idx_loop_user_stage', 'user_id', 'current_stage'),
    )


class TopicMasteryState(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    MASTERED = "MASTERED"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class UserTopicMastery(db.Model):
    """Current mastery state for a user in a specific topic"""
    __tablename__ = 'user_topic_mastery'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    subject = db.Column(db.String(100), nullable=False, index=True)
    topic = db.Column(db.String(200), nullable=False, index=True)
    
    state = db.Column(db.Enum(TopicMasteryState), default=TopicMasteryState.NOT_STARTED, index=True)
    proficiency_score = db.Column(db.Float, default=0.0) # 0 to 100
    
    total_attempts = db.Column(db.Integer, default=0)
    success_rate = db.Column(db.Float, default=0.0)
    
    last_activity_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'subject', 'topic', name='uq_user_topic_mastery'),
        db.Index('idx_mastery_user_state', 'user_id', 'state'),
    )
    
    def to_dict(self):
        return {
            'subject': self.subject,
            'topic': self.topic,
            'state': self.state.value,
            'proficiency': self.proficiency_score,
            'success_rate': self.success_rate
        }

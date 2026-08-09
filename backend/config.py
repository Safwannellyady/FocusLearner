"""
FocusLearner Pro - Configuration Management
Centralized configuration for the application
"""

import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


import secrets

class Config:
    """Base configuration class"""
    
    # Flask Configuration (Cryptographically secure 256-bit key generation)
    # SECURITY: if SECRET_KEY isn't set as a real environment variable, this
    # falls back to a fresh random key every time the process starts —
    # meaning every logged-in user gets silently signed out on every restart
    # or redeploy. Set SECRET_KEY (and JWT_SECRET_KEY) as fixed env vars in
    # Railway. _SECRET_KEY_IS_EPHEMERAL lets app.py warn loudly at boot if
    # that hasn't been done.
    _SECRET_KEY_IS_EPHEMERAL = not bool(os.getenv('SECRET_KEY'))
    SECRET_KEY = os.getenv('SECRET_KEY') or secrets.token_hex(32)
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        if DATABASE_URL.startswith('postgres://'):
            DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    else:
        DATABASE_URL = 'sqlite:///focuslearner_v3.db'
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO', 'False').lower() == 'true'
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 10,
        'max_overflow': 20,
    }
    
    # JWT Configuration (Cryptographically secure 256-bit HS256 signing key)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ALGORITHM = 'HS256'

    JWT_TOKEN_LOCATION = ['headers']
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS Configuration
    _env_origins = [orig.strip() for orig in os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:5000,http://localhost:5001').split(',') if orig.strip()]
    if 'https://focuslearner.pages.dev' not in _env_origins:
        _env_origins.append('https://focuslearner.pages.dev')
    CORS_ORIGINS = _env_origins
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_HEADERS = ['Content-Type', 'Authorization']
    
    # API Configuration
    API_VERSION = '1.0.0'
    API_PREFIX = '/api'
    
    # Rate Limiting
    RATELIMIT_ENABLED = os.getenv('RATELIMIT_ENABLED', 'True').lower() == 'true'
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = '200 per hour'
    RATELIMIT_AUTH = '10 per minute'
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    
    # AI/Search Service Configuration
    GOOGLE_SEARCH_API_KEY = os.getenv('GOOGLE_SEARCH_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GOOGLE_SEARCH_CX = os.getenv('GOOGLE_SEARCH_CX')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    GEMINI_MAX_TOKENS = int(os.getenv('GEMINI_MAX_TOKENS', '1024'))
    GEMINI_TEMPERATURE = float(os.getenv('GEMINI_TEMPERATURE', '0.7'))
    
    # Vector Database Configuration (Pinecone)
    PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
    PINECONE_ENVIRONMENT = os.getenv('PINECONE_ENVIRONMENT', 'us-east-1-aws')
    PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'focuslearner-transcripts')
    PINECONE_DIMENSION = int(os.getenv('PINECONE_DIMENSION', '384'))  # For sentence-transformers all-MiniLM-L6-v2
    PINECONE_METRIC = os.getenv('PINECONE_METRIC', 'cosine')
    
    # Embedding Configuration
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
    EMBEDDING_BATCH_SIZE = int(os.getenv('EMBEDDING_BATCH_SIZE', '32'))
    CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '500'))  # Characters per chunk
    CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '50'))  # Overlap between chunks
    
    # Security Configuration
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_NUMBER = True
    PASSWORD_REQUIRE_SPECIAL = False
    
    # Session Configuration
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    
    # Cache Configuration
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', '300'))
    
    # Email Configuration (for future use)
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        pass


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    SESSION_COOKIE_SECURE = True

    # SECURITY: this used to be `os.getenv('CORS_ORIGINS', '').split(',')`,
    # which drops the automatic localhost defaults AND the automatic
    # focuslearner.pages.dev fallback that the base Config class computes —
    # if the CORS_ORIGINS env var isn't set on Railway, this became [''],
    # meaning flask-cors had no valid origin for real (non-preflight)
    # requests even though the separate manual OPTIONS handler in app.py
    # still worked, causing preflight to pass but the actual GET/POST to
    # fail CORS. Rebuild it the same defensive way the base class does.
    _prod_origins = [o.strip() for o in os.getenv('CORS_ORIGINS', '').split(',') if o.strip()]
    if 'https://focuslearner.pages.dev' not in _prod_origins:
        _prod_origins.append('https://focuslearner.pages.dev')
    CORS_ORIGINS = _prod_origins
    
    # Production database optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'pool_size': 20,
        'max_overflow': 40,
    }


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    WTF_CSRF_ENABLED = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])

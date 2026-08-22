"""
FocusLearner Pro - Shared Flask extensions

Kept in their own module (rather than defined in app.py) so route
blueprints can import them without triggering a circular import with
app.py, which imports the blueprints.
"""

import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# storage_uri must be set here on the constructor — Flask-Limiter's
# init_app(app) does NOT accept a storage_uri kwarg (verified against the
# installed 3.x API; passing it there raises TypeError). Read the env var
# directly rather than from app.config, since this module loads before the
# Flask app's config is populated in app.py.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv('RATELIMIT_STORAGE_URL', 'memory://'),
    default_limits=[os.getenv('RATELIMIT_DEFAULT', '200 per hour')],
)

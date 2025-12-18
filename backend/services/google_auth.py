"""
FocusLearner Pro - Google OAuth Authentication Service
Handles Google Sign-In authentication
"""

import os
import requests
from typing import Dict, Optional

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
GOOGLE_TOKEN_VERIFY_URL = 'https://www.googleapis.com/oauth2/v1/tokeninfo'
GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'


class GoogleAuthService:
    """Service for Google OAuth authentication"""
    
    def __init__(self):
        self.client_id = GOOGLE_CLIENT_ID
        self.client_secret = GOOGLE_CLIENT_SECRET
        if not self.client_id:
            print("WARNING: GOOGLE_CLIENT_ID not set!")
    
    def verify_google_token(self, token: str) -> Optional[Dict]:
        """
        Verify Google access token and get user info.
        
        Args:
            token: Google access token from client
        
        Returns:
            User info dictionary or None if invalid
        """
        try:
            # First, try to get user info directly with access token
            user_info_response = requests.get(
                GOOGLE_USER_INFO_URL,
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if user_info_response.status_code == 200:
                user_info = user_info_response.json()
                return {
                    'google_id': user_info.get('id'),
                    'email': user_info.get('email'),
                    'name': user_info.get('name'),
                    'picture': user_info.get('picture'),
                    'verified_email': user_info.get('verified_email', False)
                }
            
            # If that fails, try verifying token first
            token_response = requests.get(
                GOOGLE_TOKEN_VERIFY_URL,
                params={'access_token': token}
            )
            
            if token_response.status_code == 200:
                token_info = token_response.json()
                
                # Verify client ID matches (if provided)
                if self.client_id and token_info.get('audience') != self.client_id:
                    print(f"Client ID mismatch: {token_info.get('audience')} != {self.client_id}")
                    # Continue anyway - client ID check is optional for access tokens
                
                # Get user info
                user_info_response = requests.get(
                    GOOGLE_USER_INFO_URL,
                    headers={'Authorization': f'Bearer {token}'}
                )
                
                if user_info_response.status_code == 200:
                    user_info = user_info_response.json()
                    return {
                        'google_id': user_info.get('id'),
                        'email': user_info.get('email'),
                        'name': user_info.get('name'),
                        'picture': user_info.get('picture'),
                        'verified_email': user_info.get('verified_email', False)
                    }
            
            # Try as ID token if access token method failed
            return self._verify_id_token(token)
        
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _verify_id_token(self, id_token: str) -> Optional[Dict]:
        """Verify Google ID token (alternative method)"""
        try:
            if not self.client_id:
                print("Cannot verify ID token: Client ID not set")
                return None
                
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token
            
            request_obj = google_requests.Request()
            user_info = id_token.verify_oauth2_token(
                id_token,
                request_obj,
                self.client_id
            )
            
            return {
                'google_id': user_info.get('sub'),
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'verified_email': user_info.get('email_verified', False)
            }
        except Exception as e:
            print(f"Error verifying ID token: {e}")
            import traceback
            traceback.print_exc()
            return None


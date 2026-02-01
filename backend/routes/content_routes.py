"""
FocusLearner Pro - Content Routes
API endpoints for content management and filtering
"""

from flask import Blueprint, request, jsonify, current_app
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from services.youtube_service import YouTubeService
from services.content_filter import ContentFilter
from models import ContentItem, db
from utils.auth import get_token_from_request, verify_token

content_routes = Blueprint('content', __name__, url_prefix='/api/content')
youtube_service = YouTubeService()
content_filter = ContentFilter()


@content_routes.route('/search', methods=['GET'])
def search_content():
    """Search for educational content across all sources"""
    try:
        query = request.args.get('query', '').strip()
        subject_focus = request.args.get('subject_focus', '').strip()
        source = request.args.get('source', 'youtube').strip().lower()  # youtube, nptel, udemy
        
        # Validate source
        valid_sources = ['youtube', 'nptel', 'udemy']
        if source not in valid_sources:
            return jsonify({'error': f'Invalid source. Must be one of: {", ".join(valid_sources)}'}), 400
        
        # Try to get user preferences if authenticated
        token = get_token_from_request()
        if token:
            user_id = verify_token(token)
            if user_id:
                from models import UserPreferences
                prefs = UserPreferences.query.filter_by(user_id=user_id).first()
                if prefs and prefs.preferred_subjects:
                    import json
                    try:
                        preferred_subjects = json.loads(prefs.preferred_subjects)
                        if preferred_subjects and not subject_focus:
                            # Use first preferred subject if no subject_focus provided
                            subject_focus = preferred_subjects[0] if preferred_subjects else ''
                    except (json.JSONDecodeError, TypeError):
                        pass
        
        if not query and not subject_focus:
            return jsonify({'error': 'query or subject_focus parameter is required'}), 400
        
        # Use subject_focus as query if query is empty
        if not query:
            query = subject_focus
        
        if source == 'youtube':
            videos = youtube_service.search_videos(
                query=query,
                subject_focus=subject_focus,
                max_results=20
            )
            
            return jsonify({
                'source': source,
                'query': query,
                'subject_focus': subject_focus,
                'results': videos,
                'count': len(videos)
            }), 200
        
        # Placeholder for other sources
        return jsonify({
            'source': source,
            'query': query,
            'results': [],
            'message': f'{source} integration coming soon'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error searching content: {e}', exc_info=True)
        return jsonify({'error': 'Failed to search content'}), 500


@content_routes.route('/filter', methods=['POST'])
def filter_content():
    """Filter a single content item"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        tags = data.get('tags', [])
        
        if not title:
            return jsonify({'error': 'title is required'}), 400
        
        # Validate tags is a list
        if not isinstance(tags, list):
            tags = []
        
        is_filtered, reason = content_filter.filter_content(title, description, tags)
        
        return jsonify({
            'is_filtered': is_filtered,
            'filter_reason': reason,
            'title': title
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error filtering content: {e}', exc_info=True)
        return jsonify({'error': 'Failed to filter content'}), 500


@content_routes.route('/transcript/<video_id>', methods=['GET'])
def get_transcript(video_id: str):
    """Get transcript for a YouTube video"""
    try:
        if not video_id or not video_id.strip():
            return jsonify({'error': 'Invalid video ID'}), 400
        
        video_id = video_id.strip()
        
        transcript = youtube_service.get_video_transcript(video_id)
        
        if not transcript:
            return jsonify({
                'error': 'Transcript not available for this video',
                'video_id': video_id
            }), 404
        
        return jsonify({
            'video_id': video_id,
            'transcript': transcript
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error fetching transcript for {video_id}: {e}', exc_info=True)
        return jsonify({'error': 'Failed to fetch transcript'}), 500


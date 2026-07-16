"""
FocusLearner Pro - Content Routes
API endpoints for content management and filtering
"""

from flask import Blueprint, request, jsonify
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from services.youtube_service import YouTubeService
from services.content_filter import ContentFilter
from models import ContentItem, db

content_routes = Blueprint('content', __name__, url_prefix='/api/content')
youtube_service = YouTubeService()
content_filter = ContentFilter()


@content_routes.route('/search', methods=['GET'])
def search_content():
    """Search for educational content across all sources"""
    from utils.auth import get_token_from_request, verify_token
    
    query = request.args.get('query', '')
    subject_focus = request.args.get('subject_focus', '')
    source = request.args.get('source', 'youtube')  # youtube, nptel, udemy
    
    # Try to get user preferences if authenticated
    user_preferences = None
    token = get_token_from_request()
    if token:
        user_id = verify_token(token)
        if user_id:
            from models import UserPreferences
            prefs = UserPreferences.query.filter_by(user_id=user_id).first()
            if prefs and prefs.preferred_subjects:
                import json
                preferred_subjects = json.loads(prefs.preferred_subjects)
                if preferred_subjects and not subject_focus:
                    # Use first preferred subject if no subject_focus provided
                    subject_focus = preferred_subjects[0] if preferred_subjects else ''
    
    if not query and not subject_focus:
        return jsonify({'error': 'query or subject_focus parameter is required'}), 400
    
    # Use subject_focus as query if query is empty
    if not query:
        query = subject_focus
    
    if source == 'youtube' or not source:
        videos = youtube_service.search_videos(
            query=query,
            subject_focus=subject_focus,
            max_results=20
        )
        return jsonify({
            'source': 'youtube',
            'query': query,
            'subject_focus': subject_focus,
            'results': videos,
            'count': len(videos)
        }), 200
    
    # Handle educational web/article sources via DuckDuckGo & Wikipedia search fallback
    try:
        import requests, urllib.parse
        encoded_q = urllib.parse.quote(query)
        ddg_url = f"https://api.duckduckgo.com/?q={encoded_q}&format=json&no_html=1&skip_disambig=1"
        res = requests.get(ddg_url, timeout=3).json()
        web_results = []
        if res.get('AbstractText') and res.get('AbstractURL'):
            web_results.append({
                'title': res.get('Heading', query),
                'description': res.get('AbstractText'),
                'url': res.get('AbstractURL'),
                'source': source
            })
        for topic in res.get('RelatedTopics', [])[:5]:
            if isinstance(topic, dict) and topic.get('Text') and topic.get('FirstURL'):
                web_results.append({
                    'title': topic.get('Text', '').split(' - ')[0][:80],
                    'description': topic.get('Text', ''),
                    'url': topic.get('FirstURL'),
                    'source': source
                })
        return jsonify({
            'source': source,
            'query': query,
            'subject_focus': subject_focus,
            'results': web_results,
            'count': len(web_results)
        }), 200
    except Exception as e:
        print(f"Content search error for {source}: {e}")
        return jsonify({
            'source': source,
            'query': query,
            'results': [],
            'message': f'No results found for {source}'
        }), 200


@content_routes.route('/filter', methods=['POST'])
def filter_content():
    """Filter a single content item"""
    data = request.get_json()
    
    title = data.get('title', '')
    description = data.get('description', '')
    tags = data.get('tags', [])
    
    if not title:
        return jsonify({'error': 'title is required'}), 400
    
    is_filtered, reason = content_filter.filter_content(title, description, tags)
    
    return jsonify({
        'is_filtered': is_filtered,
        'filter_reason': reason,
        'title': title
    }), 200


@content_routes.route('/transcript/<video_id>', methods=['GET'])
def get_transcript(video_id: str):
    """Get transcript for a YouTube video"""
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


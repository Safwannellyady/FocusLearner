"""Regression tests for focus-session video relevance and embed safety."""

import os
import sys
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from services.youtube_service import YouTubeService


def make_service(api_key='test-key'):
    service = YouTubeService(api_key=api_key)
    # These tests isolate recommendation quality from the separate
    # entertainment classifier, which has its own test surface.
    service.content_filter.filter_content = Mock(return_value=(False, 'approved'))
    return service


def test_rank_and_filter_keeps_only_requested_topic_matches():
    service = make_service()
    videos = [
        {
            'video_id': 'relevant123',
            'title': 'Binary Search Trees | Computer Science Lecture',
            'description': 'A tutorial covering binary search tree insertion and traversal.',
            'tags': [],
        },
        {
            'video_id': 'unrelated12',
            'title': 'How to Build Better Study Habits',
            'description': 'Productivity advice for learners.',
            'tags': [],
        },
    ]

    results = service._rank_and_filter(videos, 'Computer Science', 'Binary Search Trees', 10)

    assert [video['video_id'] for video in results] == ['relevant123']
    assert results[0]['relevance_score'] > 0


def test_search_excludes_private_or_non_embeddable_videos():
    service = make_service()
    search_payload = {
        'items': [
            {'id': {'videoId': 'playable123'}, 'snippet': {'title': 'Calculus Derivatives Tutorial', 'description': 'Math calculus derivatives lesson', 'thumbnails': {}, 'channelTitle': 'Math', 'publishedAt': ''}},
            {'id': {'videoId': 'blocked1234'}, 'snippet': {'title': 'Calculus Derivatives Tutorial', 'description': 'Math calculus derivatives lesson', 'thumbnails': {}, 'channelTitle': 'Math', 'publishedAt': ''}},
        ]
    }
    details_payload = {
        'items': [
            {'id': 'playable123', 'status': {'embeddable': True, 'privacyStatus': 'public'}},
            {'id': 'blocked1234', 'status': {'embeddable': False, 'privacyStatus': 'public'}},
        ]
    }

    responses = [Mock(json=Mock(return_value=search_payload)), Mock(json=Mock(return_value=details_payload))]
    for response in responses:
        response.raise_for_status = Mock()

    with patch('services.youtube_service.requests.get', side_effect=responses):
        results = service.search_videos('Derivatives', 'Mathematics', 10)

    assert [video['video_id'] for video in results] == ['playable123']


def test_unknown_development_topic_does_not_become_generic_study_videos():
    service = make_service(api_key=None)
    service.api_key = None

    results = service.search_videos('Photosynthesis', 'Biology', 10)

    assert results == []

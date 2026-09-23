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


def test_rank_and_filter_tiers_topic_matches_first():
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

    # Tiered best-effort ranking: the exact topic match ranks first, and
    # blacklist-passing videos are kept below it instead of hard-rejected.
    assert [video['video_id'] for video in results] == ['relevant123', 'unrelated12']
    assert results[0]['relevance_score'] >= 1000
    assert results[1]['relevance_score'] < results[0]['relevance_score']
    assert all(not video['is_filtered'] for video in results)


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


def test_unknown_topic_falls_back_to_curated_videos():
    service = make_service(api_key=None)
    service.api_key = None

    results = service.search_videos('Photosynthesis', 'Biology', 10)

    # No empty "no related videos" state: curated per-subject videos are
    # served instead, clearly labelled as curated.
    assert len(results) > 0
    assert all(video.get('is_curated') for video in results)
    assert all(not video['is_filtered'] for video in results)

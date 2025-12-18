"""
FocusLearner Pro - YouTube Service
Service for fetching and managing YouTube content
"""

import os
import requests
from typing import List, Dict, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from .content_filter import ContentFilter
from .ai_service import AIService


class YouTubeService:
    """Service for interacting with YouTube content"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('YOUTUBE_API_KEY', '')
        self.base_url = 'https://www.googleapis.com/youtube/v3'
        self.content_filter = ContentFilter()
        self.ai_service = AIService()
    
    def search_videos(self, query: str, subject_focus: str, max_results: int = 10) -> List[Dict]:
        """
        Search for YouTube videos related to the query and subject focus.
        
        Args:
            query: Search query
            subject_focus: Current subject focus (e.g., "ECE/Network Analysis")
            max_results: Maximum number of results to return
        
        Returns:
            List of filtered video dictionaries
        """
        if not self.api_key:
            # Return mock data for development
            return self._get_mock_videos(query, subject_focus, max_results)
        
        # Use AI to refine the search query for better educational relevance
        refined_query = self.ai_service.refine_search_query(subject_focus, query)
        print(f"Original Query: {subject_focus} {query} -> Refined: {refined_query}")
        
        params = {
            'part': 'snippet',
            'q': refined_query,
            'type': 'video',
            'maxResults': max_results * 2,  # Get more to filter
            'key': self.api_key,
            'videoCategoryId': '27',  # Education category
            'order': 'relevance'
        }
        
        try:
            response = requests.get(f"{self.base_url}/search", params=params)
            response.raise_for_status()
            data = response.json()
            
            videos = []
            for item in data.get('items', []):
                video = {
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                    'channel': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    'source': 'youtube',
                    'subject_focus': subject_focus,
                    'tags': []  # Tags not available in search API
                }
                videos.append(video)
            
            # Filter videos using content filter
            filtered_videos = self.content_filter.filter_video_list(videos)
            
            return filtered_videos[:max_results]
        
        except Exception as e:
            print(f"Error fetching YouTube videos: {e}")
            return self._get_mock_videos(query, subject_focus, max_results)
    
    def get_video_transcript(self, video_id: str) -> Optional[List[Dict]]:
        """
        Get transcript for a YouTube video.
        
        Args:
            video_id: YouTube video ID
        
        Returns:
            List of transcript entries with 'text' and 'start' keys, or None
        """
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return transcript
        except Exception as e:
            print(f"Error fetching transcript for video {video_id}: {e}")
            return None
    
    def _get_mock_videos(self, query: str, subject_focus: str, max_results: int) -> List[Dict]:
        """Return smart mock video data for development/testing"""
        
        # Curated list of REAL educational videos (safe for all ages)
        # Using specific IDs to ensure the player actually loads content
        fallback_videos = {
            "default": [
                ("Lofi Girl: Beats to Relax/Study To", "jfKfPfyJRdk", "Lofi Girl"),
                ("Pomodoro Timer 25min", "mXh0QT4e_cM", "Study Timer"),
                ("Focus Music for Deep Work", "WPni755-Krg", "Quiet Quest"),
            ],
            "CS": [
                ("Intro to Computer Science - Crash Course", "tpIctyqH29Q", "CrashCourse"),
                ("Data Structures - Full Course", "RBSGKlAvoiM", "freeCodeCamp"),
                ("Algorithms Explained", "0IAPZzGSbME", "Computerphile"),
            ],
            "Math": [
                ("Essence of Linear Algebra", "fNk_zzaMoSs", "3Blue1Brown"),
                ("Calculus 1 Full Course", "HfACrKJ_Y2w", "Dr. Trefor Bazett"),
                ("The Map of Mathematics", "OmJ-4B-mS-Y", "Domain of Science"),
            ],
            "ECE": [
                ("Circuit Analysis: Crash Course Physics", "-w-V3hC_rJ0", "CrashCourse"),
                ("Electronic Circuit Design", "Vd255-aXkKg", "EEVblog"),
                ("Kirchhoff's Laws Explained", "NB4FSE52bbY", "The Organic Chemistry Tutor"),
            ],
            "English": [
                ("Basic Enlish Grammar: Have, Has, Had", "Mx8f11Xm-ss", "English Lessons with Adam (engVid)"), # Extremely stable
                ("8 Parts of Speech in English", "juHiil2C2lE", "Khan Academy"), 
                ("Common Grammar Mistakes", "L9A18_xfgsU", "English with Lucy"), 
            ],
            "Language": [ # Fallback alias for English/Language
                 ("How to learn any language in 6 months", "d0yGdNEWdn0", "TEDx Talks"),
                 ("The benefits of a bilingual brain", "MMmOLN5zBLY", "TED-Ed"),
                 ("Language Learning Techniques", "l7J9l6r1Zq4", "Polyglot Progress"),
            ],
            "Physics": [
                 ("Physics - Basic Introduction", "b1t41Q3xRM8", "The Organic Chemistry Tutor"),
                 ("Newton's Laws: Crash Course Physics", "kKKM8Y-u7ds", "CrashCourse"),
                 ("Quantum Physics for 7 Year Olds", "Ttt2i_d2lO4", "Dominic Walliman"),
            ],
            "Chemistry": [
                 ("The Periodic Table: Crash Course Chemistry", "0RRVV4Diomg", "CrashCourse"),
                 ("Chemical Bonding", "yADrWdNTfgg", "Professor Dave Explains"),
                 ("Intro to Chemistry", "Rd4a1X3B61w", "Tyler DeWitt"),
            ],
            # Better default than music
            "default": [
                ("How to Learn Anything Fast", "EtW2rrLHs08", "Feynman Technique"),
                ("The Power of Habit", "W1eYn4vY9Og", "TED-Ed"),
                ("Study Less Study Smart", "p60rN9JEapg", "Marty Lobdell"),
            ],
        }

        # Determine category for better suggestions
        category = "default"
        # Check specific subjects first
        if "CS" in subject_focus or "Algorithm" in subject_focus or "Computer" in subject_focus:
            category = "CS"
        elif "Math" in subject_focus or "Algebra" in subject_focus or "Calculus" in subject_focus:
            category = "Math"
        elif "ECE" in subject_focus or "Circuit" in subject_focus or "Electronics" in subject_focus:
            category = "ECE"
        elif "Eng" in subject_focus or "Lang" in subject_focus or "Grammar" in subject_focus: # English/Language
            category = "English"
        elif "Phys" in subject_focus:
            category = "Physics"
        elif "Chem" in subject_focus:
            category = "Chemistry"
            
        selected_videos = fallback_videos.get(category, fallback_videos["default"])
        
        mock_videos = []
        for i, (title, vid, channel) in enumerate(selected_videos):
             mock_videos.append({
                'video_id': vid,
                'title': f'{title}',
                'description': f'Recommended educational content for {subject_focus}. This is a popular resource for studying {query or "this topic"}.',
                'thumbnail': f'https://img.youtube.com/vi/{vid}/mqdefault.jpg',
                'channel': channel,
                'published_at': '2024-01-01T00:00:00Z',
                'url': f'https://www.youtube.com/watch?v={vid}',
                'source': 'mock',
                'subject_focus': subject_focus,
                'is_filtered': False,
                'filter_reason': 'Content approved'
            })
        
        return mock_videos[:max_results]


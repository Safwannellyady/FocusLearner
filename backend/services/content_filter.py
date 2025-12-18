"""
FocusLearner Pro - Content Filtering Service
Aggressive filtering system to remove distracting content
"""

import re
from typing import Dict, List, Tuple
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)


class ContentFilter:
    """Content filtering service using rule-based and NLP classification"""
    
    # Blacklist of distracting keywords
    DISTRACTION_KEYWORDS = [
        'vlog', 'prank', 'gaming', 'game', 'playthrough', 'walkthrough',
        'funny', 'comedy', 'meme', 'reaction', 'challenge', 'trending',
        'entertainment', 'music video', 'mv', 'song', 'dance', 'dancing',
        'cooking', 'recipe', 'food', 'travel', 'vacation', 'lifestyle',
        'beauty', 'makeup', 'fashion', 'shopping', 'haul', 'unboxing',
        'gossip', 'celebrity', 'news', 'politics', 'sports', 'football',
        'basketball', 'soccer', 'cricket', 'movie', 'film', 'trailer',
        'review', 'unboxing', 'asmr', 'satisfying', 'oddly satisfying'
    ]
    
    # Educational keywords (positive signals)
    EDUCATIONAL_KEYWORDS = [
        'tutorial', 'lecture', 'course', 'lesson', 'explanation', 'theory',
        'concept', 'example', 'problem', 'solution', 'practice', 'exercise',
        'assignment', 'homework', 'study', 'learn', 'education', 'academic',
        'university', 'college', 'professor', 'instructor', 'teacher'
    ]
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
    
    def filter_content(self, title: str, description: str = "", tags: List[str] = None) -> Tuple[bool, str]:
        """
        Filter content based on title, description, and tags.
        
        Returns:
            Tuple[bool, str]: (is_filtered, reason)
            - is_filtered: True if content should be filtered out
            - reason: Explanation for filtering decision
        """
        if tags is None:
            tags = []
        
        # Combine all text for analysis
        combined_text = f"{title} {description} {' '.join(tags)}".lower()
        
        # Check for distraction keywords
        distraction_score = self._calculate_distraction_score(combined_text)
        educational_score = self._calculate_educational_score(combined_text)
        
        # Rule-based filtering
        if distraction_score > 2:  # Multiple distraction keywords found
            return True, f"Contains {distraction_score} distraction keyword(s)"
        
        if distraction_score > 0 and educational_score == 0:
            return True, "Contains distraction content without educational value"
        
        # Check for specific patterns
        if self._has_distraction_pattern(title):
            return True, "Title matches distraction pattern"
        
        # If educational score is high, allow even with some distraction keywords
        if educational_score >= 3:
            return False, "Educational content approved"
        
        # Default: approve if no strong signals either way
        return False, "Content approved"
    
    def _calculate_distraction_score(self, text: str) -> int:
        """Calculate score based on distraction keywords found"""
        score = 0
        text_lower = text.lower()
        
        for keyword in self.DISTRACTION_KEYWORDS:
            if keyword in text_lower:
                score += 1
        
        return score
    
    def _calculate_educational_score(self, text: str) -> int:
        """Calculate score based on educational keywords found"""
        score = 0
        text_lower = text.lower()
        
        for keyword in self.EDUCATIONAL_KEYWORDS:
            if keyword in text_lower:
                score += 1
        
        return score
    
    def _has_distraction_pattern(self, title: str) -> bool:
        """Check for specific distraction patterns in title"""
        title_lower = title.lower()
        
        # Patterns that indicate non-educational content
        patterns = [
            r'\b\d+\s*(million|billion|views|subscribers)\b',
            r'\b(you won\'t believe|shocking|amazing|incredible)\b',
            r'\b(epic|fail|win|best|worst)\b.*\b(ever|of all time)\b',
            r'\b(prank|challenge|dare)\b',
            r'\b(reacting to|reacts to)\b',
        ]
        
        for pattern in patterns:
            if re.search(pattern, title_lower):
                return True
        
        return False
    
    def filter_video_list(self, videos: List[Dict]) -> List[Dict]:
        """
        Filter a list of video dictionaries.
        
        Args:
            videos: List of video dicts with 'title', 'description', 'tags' keys
        
        Returns:
            Filtered list of videos with 'is_filtered' and 'filter_reason' added
        """
        filtered_videos = []
        
        for video in videos:
            title = video.get('title', '')
            description = video.get('description', '')
            tags = video.get('tags', [])
            
            is_filtered, reason = self.filter_content(title, description, tags)
            
            video['is_filtered'] = is_filtered
            video['filter_reason'] = reason
            
            if not is_filtered:
                filtered_videos.append(video)
        
        return filtered_videos


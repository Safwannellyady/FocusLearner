"""
FocusLearner Pro - Content Aggregator Service
Unified service for aggregating content from multiple sources (YouTube, NPTEL, Udemy)
"""

from typing import List, Dict, Any, Optional
from services.youtube_service import YouTubeService
from services.nptel_service import NPTELService
from services.udemy_service import UdemyService


class ContentAggregator:
    """Service for unified content aggregation across multiple sources"""
    
    def __init__(self):
        self.youtube_service = YouTubeService()
        self.nptel_service = NPTELService()
        self.udemy_service = UdemyService()
        
        # Source priority for ranking results
        self.source_priority = {
            'youtube': 1.0,
            'nptel': 0.9,
            'udemy': 0.85
        }
    
    def search_all_sources(self, query: str, subject: Optional[str] = None, sources: Optional[List[str]] = None, limit_per_source: int = 5) -> List[Dict[str, Any]]:
        """
        Search for content across all available sources.
        
        Args:
            query: Search query string
            subject: Optional subject filter
            sources: Optional list of sources to include (youtube, nptel, udemy)
            limit_per_source: Maximum results per source
            
        Returns:
            Unified and ranked list of content items
        """
        if sources is None:
            sources = ['youtube', 'nptel', 'udemy']
        
        all_results = []
        
        # Search each source
        if 'youtube' in sources:
            youtube_results = self._search_youtube(query, subject, limit_per_source)
            all_results.extend(youtube_results)
        
        if 'nptel' in sources:
            nptel_results = self._search_nptel(query, subject, limit_per_source)
            all_results.extend(nptel_results)
        
        if 'udemy' in sources:
            udemy_results = self._search_udemy(query, subject, limit_per_source)
            all_results.extend(udemy_results)
        
        # Deduplicate results
        deduplicated = self._deduplicate_content(all_results)
        
        # Rank and sort results
        ranked = self._rank_results(deduplicated, query, subject)
        
        return ranked
    
    def _search_youtube(self, query: str, subject: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Search YouTube for content"""
        try:
            # Use existing YouTube service
            results = self.youtube_service.search_videos(query, max_results=limit)
            
            # Normalize to standard format
            normalized = []
            for item in results:
                normalized.append({
                    'content_id': item.get('video_id', ''),
                    'title': item.get('title', ''),
                    'description': item.get('description', ''),
                    'subject': subject or '',
                    'topic': query,
                    'source': 'youtube',
                    'url': f"https://www.youtube.com/watch?v={item.get('video_id', '')}",
                    'thumbnail': item.get('thumbnail', ''),
                    'duration': item.get('duration', ''),
                    'type': 'video',
                    'difficulty': 'intermediate',
                    'metadata': {
                        'channel': item.get('channel', ''),
                        'published_at': item.get('published_at', '')
                    }
                })
            
            return normalized
            
        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []
    
    def _search_nptel(self, query: str, subject: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Search NPTEL for content"""
        try:
            results = self.nptel_service.search_courses(query, subject, limit)
            return [self.nptel_service.normalize_to_content_item(item) for item in results]
        except Exception as e:
            print(f"Error searching NPTEL: {e}")
            return []
    
    def _search_udemy(self, query: str, subject: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Search Udemy for content"""
        try:
            results = self.udemy_service.search_courses(query, subject, limit)
            return [self.udemy_service.normalize_to_content_item(item) for item in results]
        except Exception as e:
            print(f"Error searching Udemy: {e}")
            return []
    
    def _deduplicate_content(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate content based on title similarity and content_id.
        
        Args:
            items: List of content items
            
        Returns:
            Deduplicated list
        """
        seen = set()
        deduplicated = []
        
        for item in items:
            # Use content_id as primary key
            content_id = item.get('content_id', '')
            
            # If no content_id, use title as fallback
            if not content_id:
                title_key = item.get('title', '').lower().strip()
                if title_key in seen:
                    continue
                seen.add(title_key)
            else:
                if content_id in seen:
                    continue
                seen.add(content_id)
            
            deduplicated.append(item)
        
        return deduplicated
    
    def _rank_results(self, items: List[Dict[str, Any]], query: str, subject: Optional[str]) -> List[Dict[str, Any]]:
        """
        Rank results based on relevance, source priority, and metadata.
        
        Args:
            items: List of content items
            query: Original search query
            subject: Subject filter
            
        Returns:
            Ranked list of content items
        """
        for item in items:
            score = 0.0
            
            # Source priority
            source = item.get('source', 'youtube')
            score += self.source_priority.get(source, 0.5) * 0.4
            
            # Title match with query
            title = item.get('title', '').lower()
            query_lower = query.lower()
            
            if query_lower in title:
                score += 0.3
            
            # Exact match bonus
            if query_lower == title:
                score += 0.2
            
            # Subject match bonus
            if subject and subject.lower() in title:
                score += 0.1
            
            # Metadata-based scoring (ratings, subscribers, etc.)
            metadata = item.get('metadata', {})
            
            if 'avg_rating' in metadata:
                rating = metadata['avg_rating']
                score += (rating / 5.0) * 0.1
            
            if 'num_subscribers' in metadata:
                subscribers = metadata['num_subscribers']
                # Logarithmic scaling for subscriber count
                import math
                if subscribers > 0:
                    score += min(math.log10(subscribers) / 6.0, 0.1)
            
            item['relevance_score'] = score
        
        # Sort by relevance score
        items.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        return items
    
    def get_content_by_source(self, source: str, query: str, subject: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get content from a specific source only.
        
        Args:
            source: Source name (youtube, nptel, udemy)
            query: Search query
            subject: Optional subject filter
            limit: Maximum results
            
        Returns:
            List of content items from specified source
        """
        if source == 'youtube':
            return self._search_youtube(query, subject, limit)
        elif source == 'nptel':
            return self._search_nptel(query, subject, limit)
        elif source == 'udemy':
            return self._search_udemy(query, subject, limit)
        else:
            return []
    
    def get_content_details(self, source: str, content_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific content item.
        
        Args:
            source: Source name
            content_id: Content identifier
            
        Returns:
            Detailed content information or None
        """
        try:
            if source == 'youtube':
                # Use YouTube service to get video details
                details = self.youtube_service.get_video_details(content_id)
                if details:
                    return {
                        'content_id': content_id,
                        'title': details.get('title', ''),
                        'description': details.get('description', ''),
                        'source': 'youtube',
                        'url': f"https://www.youtube.com/watch?v={content_id}",
                        'thumbnail': details.get('thumbnail', ''),
                        'duration': details.get('duration', ''),
                        'metadata': {
                            'channel': details.get('channel', ''),
                            'published_at': details.get('published_at', ''),
                            'view_count': details.get('view_count', 0)
                        }
                    }
            elif source == 'nptel':
                return self.nptel_service.get_course_details(content_id)
            elif source == 'udemy':
                return self.udemy_service.get_course_details(content_id)
            
            return None
            
        except Exception as e:
            print(f"Error getting content details: {e}")
            return None
    
    def filter_by_difficulty(self, items: List[Dict[str, Any]], difficulty: str) -> List[Dict[str, Any]]:
        """
        Filter content by difficulty level.
        
        Args:
            items: List of content items
            difficulty: Difficulty level (beginner, intermediate, advanced)
            
        Returns:
            Filtered list of content items
        """
        return [item for item in items if item.get('difficulty') == difficulty]
    
    def filter_by_type(self, items: List[Dict[str, Any]], content_type: str) -> List[Dict[str, Any]]:
        """
        Filter content by type (video, course, etc.).
        
        Args:
            items: List of content items
            content_type: Content type
            
        Returns:
            Filtered list of content items
        """
        return [item for item in items if item.get('type') == content_type]


# Global instance
content_aggregator = ContentAggregator()

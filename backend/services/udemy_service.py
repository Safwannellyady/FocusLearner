"""
FocusLearner Pro - Udemy Service
Service for fetching and normalizing Udemy course content
"""

import requests
import os
from typing import List, Dict, Any, Optional
from config import Config


class UdemyService:
    """Service for Udemy content aggregation"""
    
    def __init__(self):
        self.api_key = os.getenv('UDEMY_API_KEY')
        self.client_id = os.getenv('UDEMY_CLIENT_ID')
        self.base_url = "https://www.udemy.com/api-2.0"
        
        if not self.api_key:
            print("Warning: UDEMY_API_KEY not found. Udemy features will use mock data.")
    
    def search_courses(self, query: str, subject: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for Udemy courses based on query and subject.
        
        Args:
            query: Search query string
            subject: Optional subject filter
            limit: Maximum number of results
            
        Returns:
            List of normalized course items
        """
        if not self.api_key:
            return self._get_mock_courses(query, subject, limit)
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            params = {
                'search': query,
                'page_size': limit,
                'fields[course]': 'title,headline,description,url,primary_category,primary_subcategory,avg_rating,num_reviews,num_subscribers,image_480x270,instructional_level,content_info'
            }
            
            if subject:
                params['category'] = self._map_subject_to_category(subject)
            
            response = requests.get(
                f"{self.base_url}/courses",
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"Udemy API error: {response.status_code}")
                return self._get_mock_courses(query, subject, limit)
            
            data = response.json()
            courses = data.get('results', [])
            
            return [self._normalize_course(course) for course in courses[:limit]]
            
        except Exception as e:
            print(f"Error searching Udemy courses: {e}")
            return self._get_mock_courses(query, subject, limit)
    
    def get_course_details(self, course_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific Udemy course.
        
        Args:
            course_id: Udemy course identifier
            
        Returns:
            Course details dictionary or None
        """
        if not self.api_key:
            return None
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            params = {
                'fields[course]': 'title,headline,description,url,primary_category,primary_subcategory,avg_rating,num_reviews,num_subscribers,image_480x270,instructional_level,content_info,curriculum'
            }
            
            response = requests.get(
                f"{self.base_url}/courses/{course_id}",
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                return None
            
            course_data = response.json()
            return self._normalize_course(course_data)
            
        except Exception as e:
            print(f"Error getting Udemy course details: {e}")
            return None
    
    def _normalize_course(self, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize Udemy course data to ContentItem model format"""
        content_info = course_data.get('content_info', {})
        
        return {
            'content_id': str(course_data.get('id', '')),
            'title': course_data.get('title', ''),
            'description': course_data.get('headline', '') or course_data.get('description', ''),
            'subject': course_data.get('primary_category', ''),
            'topic': course_data.get('primary_subcategory', ''),
            'source': 'udemy',
            'url': course_data.get('url', ''),
            'thumbnail': course_data.get('image_480x270', ''),
            'duration': self._format_duration(content_info),
            'type': 'course',
            'difficulty': self._map_difficulty(course_data.get('instructional_level', '')),
            'metadata': {
                'avg_rating': course_data.get('avg_rating', 0),
                'num_reviews': course_data.get('num_reviews', 0),
                'num_subscribers': course_data.get('num_subscribers', 0),
                'instructional_level': course_data.get('instructional_level', ''),
                'curriculum': course_data.get('curriculum', [])
            }
        }
    
    def _format_duration(self, content_info: Dict[str, Any]) -> str:
        """Format course duration from content info"""
        total_seconds = content_info.get('num_sections', 0) * 1800  # Approximate
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"
    
    def _map_difficulty(self, instructional_level: str) -> str:
        """Map Udemy instructional level to standard difficulty"""
        level_lower = instructional_level.lower()
        
        if 'beginner' in level_lower or 'introductory' in level_lower:
            return 'beginner'
        elif 'expert' in level_lower or 'advanced' in level_lower:
            return 'advanced'
        else:
            return 'intermediate'
    
    def _map_subject_to_category(self, subject: str) -> str:
        """Map subject to Udemy category ID"""
        subject_lower = subject.lower()
        
        # Udemy category IDs (these are approximate, actual IDs may vary)
        category_map = {
            'computer science': '268',
            'development': '268',
            'business': '262',
            'marketing': '263',
            'design': '269',
            'photography': '270',
            'music': '271',
            'health': '273',
            'personal development': '274'
        }
        
        for key, category_id in category_map.items():
            if key in subject_lower:
                return category_id
        
        return '268'  # Default to Development
    
    def _get_mock_courses(self, query: str, subject: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Return mock Udemy courses for testing"""
        mock_courses = [
            {
                'content_id': 'udemy_101',
                'title': f'Master {query or "Python Programming"} - Complete Bootcamp',
                'description': f'Learn {query or "Python"} from scratch with hands-on projects',
                'subject': subject or 'Development',
                'topic': query or 'Python',
                'source': 'udemy',
                'url': 'https://www.udemy.com/course/python-bootcamp/',
                'thumbnail': 'https://via.placeholder.com/480x270?text=Udemy',
                'duration': '45h 30m',
                'type': 'course',
                'difficulty': 'beginner',
                'metadata': {
                    'avg_rating': 4.7,
                    'num_reviews': 15000,
                    'num_subscribers': 500000,
                    'instructional_level': 'Beginner'
                }
            },
            {
                'content_id': 'udemy_102',
                'title': f'Advanced {query or "Web Development"} with React & Node',
                'description': f'Build modern web applications with {query or "React"} and Node.js',
                'subject': subject or 'Development',
                'topic': query or 'Web Development',
                'source': 'udemy',
                'url': 'https://www.udemy.com/course/web-dev-bootcamp/',
                'thumbnail': 'https://via.placeholder.com/480x270?text=Udemy',
                'duration': '65h 15m',
                'type': 'course',
                'difficulty': 'intermediate',
                'metadata': {
                    'avg_rating': 4.8,
                    'num_reviews': 25000,
                    'num_subscribers': 750000,
                    'instructional_level': 'Intermediate'
                }
            },
            {
                'content_id': 'udemy_103',
                'title': f'{query or "Machine Learning"} A-Z: Hands-On Python',
                'description': f'Deep dive into {query or "Machine Learning"} algorithms and applications',
                'subject': subject or 'Data Science',
                'topic': query or 'Machine Learning',
                'source': 'udemy',
                'url': 'https://www.udemy.com/course/machinelearning/',
                'thumbnail': 'https://via.placeholder.com/480x270?text=Udemy',
                'duration': '44h 20m',
                'type': 'course',
                'difficulty': 'advanced',
                'metadata': {
                    'avg_rating': 4.6,
                    'num_reviews': 18000,
                    'num_subscribers': 400000,
                    'instructional_level': 'Expert'
                }
            }
        ]
        
        return mock_courses[:limit]
    
    def normalize_to_content_item(self, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Udemy course data to ContentItem model format.
        
        Args:
            course_data: Raw Udemy course data
            
        Returns:
            Normalized content item
        """
        return self._normalize_course(course_data)


# Global instance
udemy_service = UdemyService()

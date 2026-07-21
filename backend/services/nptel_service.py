"""
FocusLearner Pro - NPTEL Service
Service for fetching and normalizing NPTEL course content
"""

import requests
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup


class NPTELService:
    """Service for NPTEL content aggregation"""
    
    def __init__(self):
        self.base_url = "https://nptel.ac.in"
        self.search_url = f"{self.base_url}/search"
        self.course_url = f"{self.base_url}/course"
    
    def search_courses(self, query: str, subject: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for NPTEL courses based on query and subject.
        
        Args:
            query: Search query string
            subject: Optional subject filter
            limit: Maximum number of results
            
        Returns:
            List of normalized course items
        """
        try:
            # NPTEL doesn't have a public API, so we'll use web scraping
            # This is a simplified implementation - in production, you'd need:
            # 1. Proper rate limiting
            # 2. User-Agent rotation
            # 3. Error handling for CAPTCHAs
            # 4. Consider using official NPTEL API if available
            
            search_params = {
                'q': query,
                'type': 'course'
            }
            
            if subject:
                search_params['domain'] = self._map_subject_to_domain(subject)
            
            # For now, return mock data since NPTEL scraping requires more infrastructure
            return self._get_mock_courses(query, subject, limit)
            
        except Exception as e:
            print(f"Error searching NPTEL courses: {e}")
            return []
    
    def get_course_details(self, course_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific NPTEL course.
        
        Args:
            course_id: NPTEL course identifier
            
        Returns:
            Course details dictionary or None
        """
        try:
            # Fetch course page
            url = f"{self.course_url}/{course_id}"
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract course information
            title = soup.find('h1', class_='course-title')
            description = soup.find('div', class_='course-description')
            instructor = soup.find('div', class_='instructor')
            
            # Extract lecture list
            lectures = self._extract_lectures(soup)
            
            return {
                'course_id': course_id,
                'title': title.get_text(strip=True) if title else '',
                'description': description.get_text(strip=True) if description else '',
                'instructor': instructor.get_text(strip=True) if instructor else '',
                'lectures': lectures,
                'source': 'nptel'
            }
            
        except Exception as e:
            print(f"Error getting NPTEL course details: {e}")
            return None
    
    def _extract_lectures(self, soup) -> List[Dict[str, Any]]:
        """Extract lecture information from course page"""
        lectures = []
        lecture_items = soup.find_all('div', class_='lecture-item')
        
        for item in lecture_items:
            title = item.find('span', class_='lecture-title')
            duration = item.find('span', class_='duration')
            video_url = item.find('a', href=True)
            
            lectures.append({
                'title': title.get_text(strip=True) if title else '',
                'duration': duration.get_text(strip=True) if duration else '',
                'video_url': video_url['href'] if video_url else '',
                'source': 'nptel'
            })
        
        return lectures
    
    def _map_subject_to_domain(self, subject: str) -> str:
        """Map subject to NPTEL domain"""
        subject_lower = subject.lower()
        
        domain_map = {
            'computer science': 'cse',
            'electrical engineering': 'ee',
            'mechanical engineering': 'me',
            'civil engineering': 'ce',
            'chemical engineering': 'che',
            'mathematics': 'math',
            'physics': 'phy',
            'chemistry': 'chem',
            'management': 'mgmt',
            'biotechnology': 'bt'
        }
        
        for key, domain in domain_map.items():
            if key in subject_lower:
                return domain
        
        return 'cse'  # Default to Computer Science
    
    def _get_mock_courses(self, query: str, subject: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Return mock NPTEL courses for testing"""
        mock_courses = [
            {
                'content_id': 'nptel_cs101',
                'title': f'Introduction to {query or "Computer Science"}',
                'description': f'Fundamental concepts of {query or "Computer Science"} and programming',
                'subject': subject or 'Computer Science',
                'topic': query or 'Programming',
                'source': 'nptel',
                'url': 'https://nptel.ac.in/courses/106/106/106106144/',
                'thumbnail': 'https://via.placeholder.com/320x180?text=NPTEL',
                'duration': '40 hours',
                'instructor': 'Prof. Department of CSE, IIT',
                'type': 'course',
                'difficulty': 'intermediate'
            },
            {
                'content_id': 'nptel_cs102',
                'title': f'Advanced {query or "Algorithms"}',
                'description': f'Deep dive into {query or "Algorithms"} and data structures',
                'subject': subject or 'Computer Science',
                'topic': query or 'Algorithms',
                'source': 'nptel',
                'url': 'https://nptel.ac.in/courses/106/106/106106145/',
                'thumbnail': 'https://via.placeholder.com/320x180?text=NPTEL',
                'duration': '35 hours',
                'instructor': 'Prof. Department of CSE, IIT',
                'type': 'course',
                'difficulty': 'advanced'
            },
            {
                'content_id': 'nptel_math101',
                'title': f'Engineering Mathematics - {query or "Linear Algebra"}',
                'description': f'Mathematical foundations for {query or "Linear Algebra"}',
                'subject': subject or 'Mathematics',
                'topic': query or 'Linear Algebra',
                'source': 'nptel',
                'url': 'https://nptel.ac.in/courses/111/111/111111146/',
                'thumbnail': 'https://via.placeholder.com/320x180?text=NPTEL',
                'duration': '30 hours',
                'instructor': 'Prof. Department of Mathematics, IIT',
                'type': 'course',
                'difficulty': 'intermediate'
            }
        ]
        
        return mock_courses[:limit]
    
    def normalize_to_content_item(self, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize NPTEL course data to ContentItem model format.
        
        Args:
            course_data: Raw NPTEL course data
            
        Returns:
            Normalized content item
        """
        return {
            'content_id': course_data.get('course_id', ''),
            'title': course_data.get('title', ''),
            'description': course_data.get('description', ''),
            'subject': course_data.get('subject', ''),
            'topic': course_data.get('topic', ''),
            'source': 'nptel',
            'url': course_data.get('url', ''),
            'thumbnail': course_data.get('thumbnail', ''),
            'duration': course_data.get('duration', ''),
            'type': course_data.get('type', 'course'),
            'difficulty': course_data.get('difficulty', 'intermediate'),
            'metadata': {
                'instructor': course_data.get('instructor', ''),
                'lectures': course_data.get('lectures', [])
            }
        }


# Global instance
nptel_service = NPTELService()

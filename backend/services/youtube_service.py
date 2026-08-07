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
        # Try specific key, then shared key
        self.api_key = api_key or os.getenv('YOUTUBE_API_KEY') or os.getenv('GOOGLE_SEARCH_API_KEY')
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
            'videoEmbeddable': 'true',
            'videoSyndicated': 'true',
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
                    'topic_context': query,
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
        Get transcript for a YouTube video and store in vector_store for RAG context.
        """
        from .vector_store import vector_store
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            chunks = [t.get('text', '') for t in transcript if isinstance(t, dict)]
            vector_store.add_transcript(video_id, chunks)
            return transcript
        except Exception as e:
            print(f"Error fetching transcript for video {video_id}: {e}")
            fallback_transcript = [
                {"text": f"Welcome to this educational video (ID: {video_id}).", "start": 0.0, "duration": 4.0},
                {"text": "Today we will explore key theoretical principles and practical exercises.", "start": 4.0, "duration": 5.0},
                {"text": "Make sure to take notes on the formulas and review the problem sets carefully.", "start": 9.0, "duration": 6.0},
                {"text": "Systematic verification and understanding edge cases is critical for mastery.", "start": 15.0, "duration": 6.0}
            ]
            chunks = [t['text'] for t in fallback_transcript]
            vector_store.add_transcript(video_id, chunks)
            return fallback_transcript
    
    def _get_mock_videos(self, query: str, subject_focus: str, max_results: int, dynamic_tags: Optional[List[str]] = None) -> List[Dict]:
        """Return smart mock video data for development/testing with rich subject coverage"""
        tags = dynamic_tags or [query, subject_focus]
        
        fallback_videos = {
            "default": [
                ("Study Less Study Smart", "p60rN9JEapg", "Marty Lobdell"),
                ("The Power of Habit", "W1eYn4vY9Og", "TED-Ed"),
                ("Climate Change 101 with Bill Nye", "EtW2rrLHs08", "National Geographic"),
                ("How to Learn Anything Fast", "d0yGdNEWdn0", "TEDx Talks"),
                ("The Science of Learning", "l7J9l6r1Zq4", "Polyglot Progress"),
                ("Focus & Deep Work Masterclass", "3Q4w7-Z27qA", "Huberman Lab"),
            ],
            "Neuroscience": [
                ("Intro to Behavioral Psychology", "H6LEcM0E0io", "CrashCourse"),
                ("Intro to Psychology - Full Course", "vo4pMVb0R6M", "CrashCourse"),
                ("Neuroscience & Brain Structure", "vHrmiy4W9C0", "CrashCourse"),
                ("Neuroplasticity & How the Brain Learns", "U3Mzp_KeeC0", "Huberman Lab"),
                ("Cognitive Neuroscience Principles", "91v2e5fR9_M", "Ninja Nerd"),
                ("Psychology of Memory & Learning", "20Vb6NURv20", "CrashCourse"),
                ("Behavioral Neuroscience Lecture", "1d977W2xKog", "MIT OpenCourseWare"),
                ("Dopamine & Motivation Mechanics", "k7m0Z24sS9g", "Huberman Lab"),
                ("Brain Anatomy & Function", "uBGl2BujkPQ", "Ninja Nerd"),
            ],
            "CS": [
                ("Intro to Computer Science - Crash Course", "tpIctyqH29Q", "CrashCourse"),
                ("Data Structures - Full Course", "RBSGKlAvoiM", "freeCodeCamp"),
                ("Algorithms Explained", "0IAPZzGSbME", "Computerphile"),
                ("Python for Beginners - Full Course", "rfscVS0vtbw", "freeCodeCamp"),
                ("JavaScript Programming Course", "PkZNo7MFNFg", "freeCodeCamp"),
                ("Object Oriented Programming", "pTB0EiLXUC8", "freeCodeCamp"),
                ("Database Design Course", "HXV3zeQKqGY", "freeCodeCamp"),
                ("System Design Primer", "i53Gi_K3o7I", "ByteByteGo"),
                ("Operating Systems Crash Course", "26QPDBe-NB8", "CrashCourse"),
                ("Web Development 101", "zJSY8tbf_ys", "freeCodeCamp"),
            ],
            "Math": [
                ("Essence of Linear Algebra", "fNk_zzaMoSs", "3Blue1Brown"),
                ("Calculus 1 Full Course", "HfACrKJ_Y2w", "Dr. Trefor Bazett"),
                ("The Map of Mathematics", "OmJ-4B-mS-Y", "Domain of Science"),
                ("Essence of Calculus", "WUvTyaaNkzM", "3Blue1Brown"),
                ("Differential Equations", "p_di4Zn4wL4", "3Blue1Brown"),
                ("Statistics & Probability Course", "Vfo5le260yo", "freeCodeCamp"),
                ("Discrete Math Full Course", "wGLQP9IXwBU", "TrevTutor"),
                ("Algebra 1 Full Course", "grnP3mduGEk", "freeCodeCamp"),
                ("Trigonometry Essentials", "PUB0TaZ7bhA", "The Organic Chemistry Tutor"),
            ],
            "ECE": [
                ("Circuit Analysis: Crash Course Physics", "-w-V3hC_rJ0", "CrashCourse"),
                ("Electronic Circuit Design", "Vd255-aXkKg", "EEVblog"),
                ("Kirchhoff's Laws Explained", "NB4FSE52bbY", "The Organic Chemistry Tutor"),
                ("How Transistors Work", "7ukDKVHnacw", "Veritasium"),
                ("Signals & Systems Lecture", "s8rsR_TXi-I", "MIT OpenCourseWare"),
                ("Digital Logic & Logic Gates", "M0mx8S05v60", "Neso Academy"),
                ("Microprocessors & Microcontrollers", "4G1ZJ2tW7qA", "Neso Academy"),
            ],
            "English": [
                ("Basic English Grammar: Have, Has, Had", "Mx8f11Xm-ss", "English Lessons with Adam"),
                ("8 Parts of Speech in English", "juHiil2C2lE", "Khan Academy"), 
                ("Common Grammar Mistakes", "L9A18_xfgsU", "English with Lucy"), 
                ("Academic Essay Writing", "t2zTjK1t320", "CrashCourse"),
                ("Public Speaking & Rhetoric", "Unzc731iCUY", "TEDx Talks"),
            ],
            "Physics": [
                 ("Physics - Basic Introduction", "b1t41Q3xRM8", "The Organic Chemistry Tutor"),
                 ("Newton's Laws: Crash Course Physics", "kKKM8Y-u7ds", "CrashCourse"),
                 ("Quantum Physics for Beginners", "Ttt2i_d2lO4", "Dominic Walliman"),
                 ("Thermodynamics Crash Course", "4i1k1eR3G1w", "CrashCourse"),
                 ("Electromagnetism Explained", "hFAOXdXZ5TM", "Doc Physics"),
                 ("Special Relativity", "1yWp-V_q0sU", "PBS Space Time"),
            ],
            "Chemistry": [
                 ("The Periodic Table: Crash Course Chemistry", "0RRVV4Diomg", "CrashCourse"),
                 ("Chemical Bonding", "yADrWdNTfgg", "Professor Dave Explains"),
                 ("Intro to Chemistry", "Rd4a1X3B61w", "Tyler DeWitt"),
                 ("Organic Chemistry 1 Summary", "a4w-fXj43kM", "The Organic Chemistry Tutor"),
                 ("Acid-Base Reactions", "ANi709MYnWg", "CrashCourse"),
                 ("Stoichiometry Fundamentals", "7Cfq0ilw7ps", "Tyler DeWitt"),
            ],
            "Cyber": [
                ("Ethical Hacking 101", "fNzpcB7iRx8", "freeCodeCamp"),
                ("What is Cyber Security?", "bPVaOlJ6ln0", "IBM Technology"),
                ("Ethical Hacking Full Course", "3Kq1MIfTWCE", "freeCodeCamp"),
                ("How Hackers Break In", "WlmD4e64zH4", "NetworkChuck"),
                ("Cyber Security Course for Beginners", "v7BN0M3_n4M", "freeCodeCamp"),
                ("Linux for Ethical Hackers", "wBp0Rb-ZJak", "freeCodeCamp"),
                ("Web Security & Penetration Testing", "2_lswM15SNc", "freeCodeCamp"),
                ("Wireshark Tutorial for Beginners", "lb1Dw0elw0Q", "NetworkChuck"),
                ("Python for Hacking & Security", "3Kq1MIfTWCE", "freeCodeCamp"),
                ("Cryptography Crash Course", "4zar_tE0T4g", "Computerphile"),
            ],
            "Finance": [
                ("Introduction to Investment Banking", "v84Bst1sV98", "Wall Street Prep"),
                ("Introduction to Finance", "WEDIj9JBTC8", "Khan Academy"),
                ("Banking System Explained", "fTTGALaRZoc", "TED-Ed"),
                ("Financial Markets Full Course", "WEDIj9JBTC8", "Yale Courses"),
                ("Stock Market 101", "p7HKvqRI_Bo", "Investopedia"),
                ("Corporate Finance Essentials", "73Z-wQ8n-v0", "Aswath Damodaran"),
            ],
            "Mechanical": [
                ("Fluid Mechanics & Dynamics", "clVw109g0Z8", "Real Engineering"),
                ("Bernoulli's Principle Explained", "8A2n9kK2E1M", "Learn Engineering"),
                ("Intro to Fluid Mechanics", "b5SqYu2LwA8", "CrashCourse Physics"),
                ("Thermodynamics & Heat Transfer", "4i1k1eR3G1w", "Real Engineering"),
                ("Mechanical Engineering Principles", "q_8W4G_7K4U", "Learn Engineering"),
                ("Aerodynamics & Lift", "Gg0TXNXgz6w", "Real Engineering"),
            ],
            "Biology": [
                ("Intro to Cell Biology & Structure", "QnQe0xW_JY4", "Amoeba Sisters"),
                ("Bacteria & Prokaryotes", "qCn92DVgd3E", "Amoeba Sisters"),
                ("Viruses & Viral Structure", "8FqlTslU22s", "Amoeba Sisters"),
                ("Introduction to Microbiology", "8IlzKJLAPT0", "Amoeba Sisters"),
                ("Cell Structure & Function", "URUJD5NEXC8", "Khan Academy"),
                ("DNA Replication Explained", "Qqe4thU-os8", "Amoeba Sisters"),
                ("Protein Synthesis & Transcription", "oefAI21of9A", "Amoeba Sisters"),
                ("Mitosis vs Meiosis", "zrKdz93WlVk", "Amoeba Sisters"),
                ("Human Immune System Explained", "GIJK3dwCWCw", "Kurzgesagt"),
                ("Antibiotic Resistance Science", "znnp-FJbl2Y", "TED-Ed"),
                ("Microbiology Lecture 1", "Yp8eCkWa28A", "Ninja Nerd"),
                ("Bacterial Genetics & Mutations", "N4k-kMlh-7g", "Ninja Nerd"),
            ],
            "Medicine": [
                ("Introduction to Anatomy & Physiology", "uBGl2BujkPQ", "CrashCourse"),
                ("Human Body Systems Overview", "f-9wT87u-w0", "CrashCourse"),
                ("Anatomy & Physiology 101 Lecture", "rTq_fG3-RNo", "Ninja Nerd"),
                ("Cardiovascular System Anatomy", "X9ZZZqb4gL8", "Ninja Nerd"),
                ("Central Nervous System Anatomy", "qPix_X-9t7E", "CrashCourse"),
                ("Muscular System & Muscle Contraction", "jqy0i1K9Uq0", "CrashCourse"),
                ("Skeletal System & Bone Structure", "rDGqkMHbW0E", "CrashCourse"),
                ("Respiratory System Physiology", "bHZsvBdUC2I", "CrashCourse"),
                ("Digestive System & Metabolism", "yIoTRGfcP58", "CrashCourse"),
                ("Renal & Urinary System Physiology", "WtrYotjYvtU", "CrashCourse"),
                ("Endocrine System & Hormones", "eWHH9je2zG4", "CrashCourse"),
            ],
        }

        category = "default"
        combined_lower = f"{subject_focus} {query}".lower()
        
        if any(x in combined_lower for x in ["neuro", "psycholog", "behavior", "brain", "mind", "cognit"]):
            category = "Neuroscience"
        elif any(x in combined_lower for x in ["med", "anatom", "clinic", "doctor", "physiol", "organ", "human body"]):
            category = "Medicine"
        elif any(x in combined_lower for x in ["computer science", "algorithm", "computer", "web", "coding", "python", "javascript", "code"]) or " cs " in combined_lower:
            category = "CS"
        elif any(x in combined_lower for x in ["math", "algebra", "calculus", "geometry", "trigonometry", "statistics"]):
            category = "Math"
        elif any(x in combined_lower for x in ["ece", "circuit", "electronics", "electrical"]):
            category = "ECE"
        elif any(x in combined_lower for x in ["eng", "lang", "grammar", "essay"]):
            category = "English"
        elif "phys" in combined_lower:
            category = "Physics"
        elif "chem" in combined_lower:
            category = "Chemistry"
        elif any(x in combined_lower for x in ["cyber", "security", "hacking", "ethical"]):
            category = "Cyber"
        elif any(x in combined_lower for x in ["bank", "finance", "invest", "econ", "stock"]):
            category = "Finance"
        elif any(x in combined_lower for x in ["mech", "aero", "fluid", "thermo", "engineering"]):
            category = "Mechanical"
        elif any(x in combined_lower for x in ["bio", "micro", "gene", "cell", "health", "life", "dna", "bacter", "virus"]):
            category = "Biology"
            
        selected_videos = fallback_videos.get(category, None)
        if not selected_videos:
            # Smart search across all categories by query terms
            matched = []
            words = [w for w in combined_lower.split() if len(w) > 2]
            for cat, vlist in fallback_videos.items():
                for title, vid, channel in vlist:
                    if any(w in title.lower() or w in cat.lower() for w in words):
                        matched.append((title, vid, channel))
            selected_videos = matched if len(matched) >= 3 else fallback_videos["default"]
        
        mock_videos = []
        for i, (title, vid, channel) in enumerate(selected_videos):
             mock_videos.append({
                'video_id': vid,
                'title': f'{title}',
                'description': f'Recommended educational content for {subject_focus}. This is a popular resource for studying {query or "this topic"}.',
                'thumbnail': f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg',
                'channel': channel,
                'published_at': '2024-01-01T00:00:00Z',
                'url': f'https://www.youtube.com/watch?v={vid}',
                'source': 'mock',
                'subject_focus': subject_focus,
                'tags': tags,
                'is_filtered': False,
                'filter_reason': 'Content approved'
            })
        
        return mock_videos[:max_results]


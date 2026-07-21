"""
FocusLearner Pro - Topic Classifier Service
Service for automatic topic classification and tagging of content
"""

import re
import os
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    try:
        nltk.download('punkt', quiet=True)
    except:
        pass

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('stopwords', quiet=True)
    except:
        pass


class TopicClassifier:
    """Service for automatic topic extraction and classification"""
    
    # Learning Intent Taxonomy - predefined topics by subject
    SUBJECT_TOPICS = {
        'Computer Science': [
            'Algorithms', 'Data Structures', 'Programming', 'Web Development',
            'Machine Learning', 'Artificial Intelligence', 'Database Systems',
            'Operating Systems', 'Computer Networks', 'Cybersecurity',
            'Software Engineering', 'Computer Architecture', 'Theory of Computation'
        ],
        'Mathematics': [
            'Calculus', 'Linear Algebra', 'Probability', 'Statistics',
            'Discrete Mathematics', 'Number Theory', 'Geometry',
            'Differential Equations', 'Complex Analysis', 'Topology'
        ],
        'Physics': [
            'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Mechanics',
            'Optics', 'Relativity', 'Nuclear Physics', 'Solid State Physics',
            'Astrophysics', 'Fluid Dynamics'
        ],
        'Chemistry': [
            'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
            'Analytical Chemistry', 'Biochemistry', 'Thermodynamics',
            'Kinetics', 'Electrochemistry', 'Spectroscopy'
        ],
        'Electrical Engineering': [
            'Circuits', 'Electronics', 'Signals and Systems', 'Digital Logic',
            'Control Systems', 'Power Systems', 'Electromagnetics',
            'VLSI Design', 'Communication Systems'
        ],
        'Mechanical Engineering': [
            'Thermodynamics', 'Fluid Mechanics', 'Mechanics of Materials',
            'Machine Design', 'Manufacturing Processes', 'Heat Transfer',
            'Vibrations', 'Robotics', 'CAD/CAM'
        ],
        'Biology': [
            'Cell Biology', 'Genetics', 'Molecular Biology', 'Ecology',
            'Evolution', 'Biochemistry', 'Microbiology', 'Physiology',
            'Botany', 'Zoology'
        ]
    }
    
    def __init__(self):
        self.ml_model = None
        self.vectorizer = None
        self.model_path = 'backend/models/topic_classifier_model.pkl'
        self.vectorizer_path = 'backend/models/topic_classifier_vectorizer.pkl'
        
        # Initialize ML model if available
        self._load_ml_model()
        
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            self.stop_words = {'the', 'a', 'an', 'in', 'on', 'of', 'and', 'or', 'for', 'to', 'with', 'by'}
    
    def classify_content(self, title: str, description: str = "", tags: List[str] = None, subject: Optional[str] = None) -> Dict[str, Any]:
        """
        Classify content into topics within a subject.
        
        Args:
            title: Content title
            description: Content description
            tags: Content tags
            subject: Subject context (optional)
            
        Returns:
            Dict with 'primary_topic', 'secondary_topics', 'confidence', and 'tags'
        """
        if tags is None:
            tags = []
        
        combined_text = f"{title} {description} {' '.join(tags)}"
        
        # ML-based classification if model is available
        if self.ml_model and self.vectorizer:
            ml_result = self._ml_classify(combined_text, subject)
            if ml_result['confidence'] > 0.6:
                return ml_result
        
        # Fallback to rule-based classification
        return self._rule_based_classify(combined_text, subject)
    
    def _rule_based_classify(self, text: str, subject: Optional[str] = None) -> Dict[str, Any]:
        """Rule-based topic classification using keyword matching"""
        text_lower = text.lower()
        
        # Determine subject if not provided
        if not subject:
            subject = self._infer_subject(text_lower)
        
        # Get topics for the subject
        topics = self.SUBJECT_TOPICS.get(subject, [])
        
        if not topics:
            # Generic topics if subject not recognized
            topics = ['General', 'Introduction', 'Concepts', 'Practice']
        
        # Score each topic based on keyword matches
        topic_scores = {}
        for topic in topics:
            score = self._calculate_topic_score(text_lower, topic)
            if score > 0:
                topic_scores[topic] = score
        
        # Sort by score
        sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
        
        if sorted_topics:
            primary_topic = sorted_topics[0][0]
            secondary_topics = [t[0] for t in sorted_topics[1:4]]
            confidence = min(sorted_topics[0][1] / 3.0, 1.0)  # Normalize confidence
        else:
            primary_topic = topics[0] if topics else 'General'
            secondary_topics = []
            confidence = 0.3
        
        # Generate tags
        generated_tags = self._generate_tags(text_lower, primary_topic, secondary_topics)
        
        return {
            'primary_topic': primary_topic,
            'secondary_topics': secondary_topics,
            'confidence': confidence,
            'subject': subject,
            'tags': generated_tags
        }
    
    def _calculate_topic_score(self, text: str, topic: str) -> float:
        """Calculate relevance score for a topic based on keyword matches"""
        topic_lower = topic.lower()
        score = 0.0
        
        # Direct topic name match
        if topic_lower in text:
            score += 2.0
        
        # Topic keywords
        topic_keywords = self._get_topic_keywords(topic)
        for keyword in topic_keywords:
            if keyword in text:
                score += 1.0
        
        # Partial matches
        topic_words = topic_lower.split()
        for word in topic_words:
            if word in text and len(word) > 3:
                score += 0.5
        
        return score
    
    def _get_topic_keywords(self, topic: str) -> List[str]:
        """Get related keywords for a topic"""
        topic_lower = topic.lower()
        
        keyword_map = {
            'algorithms': ['sorting', 'searching', 'complexity', 'big o', 'recursion', 'dynamic programming', 'greedy'],
            'data structures': ['array', 'list', 'stack', 'queue', 'tree', 'graph', 'hash', 'linked list'],
            'machine learning': ['neural network', 'deep learning', 'classification', 'regression', 'clustering', 'model'],
            'calculus': ['derivative', 'integral', 'limit', 'function', 'differentiation', 'integration'],
            'linear algebra': ['matrix', 'vector', 'eigenvalue', 'eigenvector', 'determinant', 'transformation'],
            'mechanics': ['force', 'motion', 'velocity', 'acceleration', 'newton', 'momentum', 'energy'],
            'thermodynamics': ['heat', 'temperature', 'entropy', 'enthalpy', 'energy', 'work', 'pressure'],
            'circuits': ['voltage', 'current', 'resistance', 'capacitor', 'inductor', 'ohm', 'kirchhoff'],
            'organic chemistry': ['carbon', 'hydrocarbon', 'functional group', 'bond', 'reaction', 'synthesis'],
            'cell biology': ['cell', 'membrane', 'nucleus', 'mitochondria', 'dna', 'rna', 'protein']
        }
        
        return keyword_map.get(topic_lower, [])
    
    def _infer_subject(self, text: str) -> str:
        """Infer subject from text content"""
        subject_keywords = {
            'Computer Science': ['programming', 'code', 'algorithm', 'software', 'computer', 'data structure', 'web', 'app'],
            'Mathematics': ['math', 'calculus', 'algebra', 'geometry', 'statistics', 'probability', 'equation', 'theorem'],
            'Physics': ['physics', 'force', 'energy', 'quantum', 'mechanics', 'wave', 'particle', 'relativity'],
            'Chemistry': ['chemistry', 'chemical', 'reaction', 'molecule', 'atom', 'bond', 'element', 'compound'],
            'Electrical Engineering': ['circuit', 'voltage', 'current', 'electronics', 'electrical', 'signal', 'power'],
            'Mechanical Engineering': ['mechanical', 'machine', 'force', 'stress', 'strain', 'fluid', 'thermal'],
            'Biology': ['biology', 'cell', 'gene', 'organism', 'ecosystem', 'evolution', 'species']
        }
        
        scores = {}
        for subject, keywords in subject_keywords.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[subject] = score
        
        if scores:
            return max(scores.items(), key=lambda x: x[1])[0]
        
        return 'General'
    
    def _generate_tags(self, text: str, primary_topic: str, secondary_topics: List[str]) -> List[str]:
        """Generate relevant tags from content"""
        tags = set()
        
        # Add primary and secondary topics as tags
        tags.add(primary_topic.lower())
        for topic in secondary_topics:
            tags.add(topic.lower())
        
        # Extract key terms from text
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text)
        
        # Filter out stop words and common words
        common_words = {'this', 'that', 'with', 'from', 'have', 'will', 'what', 'when', 'which', 'their', 'there'}
        key_terms = [w for w in words if w.lower() not in self.stop_words and w.lower() not in common_words]
        
        # Add top key terms as tags (limit to 5)
        for term in key_terms[:5]:
            tags.add(term.lower())
        
        return list(tags)
    
    def _load_ml_model(self):
        """Load pre-trained ML model if available"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                with open(self.model_path, 'rb') as f:
                    self.ml_model = pickle.load(f)
                with open(self.vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                print("ML topic classifier model loaded successfully")
        except Exception as e:
            print(f"Could not load ML topic classifier: {e}")
            self.ml_model = None
            self.vectorizer = None
    
    def _ml_classify(self, text: str, subject: Optional[str] = None) -> Dict[str, Any]:
        """Classify using ML model"""
        try:
            # Transform text
            text_vector = self.vectorizer.transform([text])
            
            # Predict
            prediction = self.ml_model.predict(text_vector)[0]
            probability = self.ml_model.predict_proba(text_vector)[0]
            
            confidence = max(probability)
            
            # Get secondary topics
            proba_sorted = sorted(zip(self.ml_model.classes_, probability), key=lambda x: x[1], reverse=True)
            secondary_topics = [t[0] for t in proba_sorted[1:4] if t[1] > 0.1]
            
            return {
                'primary_topic': prediction,
                'secondary_topics': secondary_topics,
                'confidence': confidence,
                'subject': subject or 'General',
                'tags': self._generate_tags(text, prediction, secondary_topics)
            }
            
        except Exception as e:
            print(f"ML classification error: {e}")
            return self._rule_based_classify(text, subject)
    
    def train_model(self, training_data: List[Dict[str, Any]], labels: List[str]):
        """
        Train a new ML model for topic classification.
        
        Args:
            training_data: List of dicts with 'title', 'description', 'tags'
            labels: List of topic labels
        """
        try:
            # Prepare training texts
            texts = [
                f"{item['title']} {item.get('description', '')} {' '.join(item.get('tags', []))}"
                for item in training_data
            ]
            
            # Create and fit vectorizer
            self.vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            X = self.vectorizer.fit_transform(texts)
            
            # Train model
            self.ml_model = MultinomialNB()
            self.ml_model.fit(X, labels)
            
            # Save models
            os.makedirs('backend/models', exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.ml_model, f)
            with open(self.vectorizer_path, 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            print("Topic classifier ML model trained and saved successfully")
            
        except Exception as e:
            print(f"Error training topic classifier: {e}")
    
    def auto_tag_content(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Automatically tag content with topics and metadata.
        
        Args:
            content_data: Dict with 'title', 'description', 'tags', 'subject'
            
        Returns:
            Updated content data with ML-generated tags
        """
        title = content_data.get('title', '')
        description = content_data.get('description', '')
        tags = content_data.get('tags', [])
        subject = content_data.get('subject')
        
        classification = self.classify_content(title, description, tags, subject)
        
        # Update content data with classification results
        content_data['primary_topic'] = classification['primary_topic']
        content_data['secondary_topics'] = classification['secondary_topics']
        content_data['ml_generated_tags'] = classification['tags']
        
        # Merge tags
        existing_tags = set(tag.lower() for tag in tags)
        ml_tags = set(classification['tags'])
        content_data['merged_tags'] = list(existing_tags.union(ml_tags))
        
        return content_data


# Global instance
topic_classifier = TopicClassifier()

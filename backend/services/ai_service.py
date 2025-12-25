"""
FocusLearner Pro - AI Service
Service for interacting with Google Gemini AI for content generation
"""

import os
import json
import requests
from typing import List, Dict, Any, Optional

class AIService:
    """Service for AI-powered content generation using Gemini REST API"""
    
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not found. AI features will use fallback mock data.")

    def _call_gemini(self, prompt: str) -> Optional[str]:
        """Helper to call Gemini REST API"""
        if not self.api_key:
            return None
            
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}?key={self.api_key}", headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            # Extract text from response
            return result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Gemini API Error: {e}")
            if response.status_code != 200:
                print(f"Response: {response.text}")
            return None

    def generate_quiz(self, subject: str, topic: str, count: int = 5) -> List[Dict[str, Any]]:
        """
        Generate a quiz for a specific subject and topic.
        """
        if not self.api_key:
            return self._get_mock_quiz(subject, topic, count)

        prompt = f"""
        Generate a {count}-question multiple choice quiz for the subject "{subject}" and topic "{topic}".
        Return ONLY a raw JSON array of objects. Do not include markdown formatting like ```json ... ```.
        Each object should have:
        - 'id': integer
        - 'question': string
        - 'options': array of 4 strings
        - 'correctAnswer': string (must exactly match one of the options)
        - 'explanation': string (brief explanation of the answer)
        """

        text_response = self._call_gemini(prompt)
        
        if not text_response:
             return self._get_mock_quiz(subject, topic, count)

        try:
            # Clean up potential markdown formatting if the model disregards instructions
            cleaned_text = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"Error parsing AI quiz: {e}")
            return self._get_mock_quiz(subject, topic, count)

    def generate_result_based_activity(self, subject: str, topic: str, activity_type: str = "auto") -> Dict[str, Any]:
        """
        Generate a specific type of activity: 'coding', 'lab', 'crossword', 'quiz'.
        If 'auto', decides based on subject.
        """
        if activity_type == "auto":
             if any(x in subject for x in ["CS", "Computer", "Algorithm", "Web"]):
                 activity_type = "coding"
             elif any(x in subject for x in ["Physics", "Chemistry", "Biology", "Medical"]):
                 activity_type = "lab"
             else:
                 activity_type = "crossword"
        
        if activity_type == "coding":
            return self.generate_coding_challenge(subject, topic)
        elif activity_type == "lab":
            return self.generate_virtual_lab(subject, topic)
        elif activity_type == "crossword":
            return self.generate_crossword(subject, topic)
        
        return self.generate_game_content(subject, 1) # Fallback

    def generate_coding_challenge(self, subject: str, topic: str) -> Dict[str, Any]:
        if not self.api_key:
             return {
                 "type": "coding",
                 "title": f"Mock Coding: {topic}",
                 "description": "Write a function to sum two numbers.",
                 "starter_code": "def solve(a, b):\n    pass",
                 "test_cases": [{"input": "1, 2", "output": "3"}],
                 "points": 100
             }
             
        prompt = f"""
        Generate a coding challenge for {subject} - {topic}.
        Return JSON:
        - title: string
        - description: string (problem statement)
        - starter_code: string (python or relevant language)
        - test_cases: array of objects {{ "input": string, "output": string }}
        - solution: string (complete solution code)
        - points: 100
        """
        return self._parse_json_response(self._call_gemini(prompt), "coding")

    def generate_virtual_lab(self, subject: str, topic: str) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "type": "lab",
                "title": f"Virtual Lab: {topic}",
                "scenario": "You are mixing Acid A with Base B.",
                "steps": ["Mix", "Observer", "Record"],
                "question": "What happens?",
                "options": ["Explosion", "Neutralization", "Nothing"],
                "correct_answer": "Neutralization"
            }
            
        prompt = f"""
        Generate a Virtual Lab scenario for {subject} - {topic}.
        Return JSON:
        - type: "lab"
        - title: string
        - scenario: string (detailed setup)
        - steps: array of strings (what user does)
        - question: string (what they must observe/conclude)
        - options: array of 4 strings
        - correct_answer: string
        - explanation: string
        """
        return self._parse_json_response(self._call_gemini(prompt), "lab")

    def generate_crossword(self, subject: str, topic: str) -> Dict[str, Any]:
         if not self.api_key:
             return {
                 "type": "crossword",
                 "title": f"Crossword: {topic}",
                 "words": [
                     {"word": "PYTHON", "clue": "Snake-like language"},
                     {"word": "JAVA", "clue": "Coffee-like language"}
                 ]
             }
         prompt = f"""
         Generate a Crossword puzzle for {subject} - {topic}.
         Return JSON:
         - type: "crossword"
         - title: string
         - words: array of objects {{ "word": string (uppercase), "clue": string }}
         Generate at least 5 words.
         """
         return self._parse_json_response(self._call_gemini(prompt), "crossword")

    def _parse_json_response(self, text_response, fallback_type):
        if not text_response:
             return {"type": fallback_type, "error": "AI unavailable"}
        try:
             text = text_response.replace('```json', '').replace('```', '').strip()
             return json.loads(text)
        except:
             return {"type": fallback_type, "error": "Parse error"}

    def generate_game_content(self, subject: str, level: int) -> Dict[str, Any]:
        """
        Generate generic game content/problems based on subject and level.
        """

    def refine_search_query(self, subject: str, user_query: str) -> str:
        """
        Refine a search query to be more specific and educational.
        """
        if not self.api_key:
            return f"{subject} {user_query} tutorial"

        prompt = f"""
        Refine the following search query to find the best educational YouTube videos.
        Subject: "{subject}"
        User Query: "{user_query}"
        
        Return ONLY the refined query string. It should differ from the original to maximize educational relevance and minimize distractions.
        Video should be a tutorial or lecture.
        """
        
        if text_response:
            return text_response.strip()
        return f"{subject} {user_query} lecture"

    def chat(self, message: str, context: Optional[str] = None, history: List[Dict[str, str]] = []) -> str:
        """
        Chat with the AI Tutor.
        Args:
            message: User's message.
            context: Context about the current video/subject.
            history: List of previous messages [{'role': 'user'/'model', 'parts': ['text']}]
        """
        if not self.api_key:
            return "I'm your AI Tutor. Since I'm running in mock mode, I can't really see the video, but I'm here to help! (Please configure GOOGLE_API_KEY)"

        # Construct prompt with context
        system_instruction = "You are a helpful, encouraging AI Tutor called 'FocusBot'. available in FocusLearner Pro app. You help students understand the educational video they are watching. keep answers concise and encouraging."
        
        if context:
            system_instruction += f"\nContext: {context}"
            
        # Format history for Gemini API (if using the chat endpoint, but here we use generateContent with history)
        # Actually, for simple REST stateless usage, we'll just append context to the latest prompt or use a simple history builder.
        # For this implementation, we will use a simple prompt construction mechanism.
        
        full_prompt = f"System: {system_instruction}\n"
        
        for msg in history[-5:]: # Keep last 5 turns for context window
            role = "User" if msg.get("role") == "user" else "Tutor"
            content = msg.get("parts", [""])[0] 
            full_prompt += f"{role}: {content}\n"
            
        full_prompt += f"User: {message}\nTutor:"
        
        return self._call_gemini(full_prompt)

    def _get_mock_quiz(self, subject, topic, count):
        """Fallback to high-quality static quizzes if AI fails"""
        
        # Static Quiz Library for robust demos
        quizzes = {
            "English": [
                {"id": 1, "question": "Which of the following is a proper noun?", "options": ["city", "London", "country", "man"], "correctAnswer": "London", "explanation": "London is a specific name of a place, so it is a proper noun."},
                {"id": 2, "question": "Identify the verb in the sentence: 'The cat sleeps on the mat.'", "options": ["The", "cat", "sleeps", "mat"], "correctAnswer": "sleeps", "explanation": "'Sleeps' is the action being performed."},
                {"id": 3, "question": "What is the past tense of 'run'?", "options": ["runned", "ran", "running", "runs"], "correctAnswer": "ran", "explanation": "The past tense of 'run' is irregular: 'ran'."},
                {"id": 4, "question": "Which sentence is grammatically correct?", "options": ["She don't like apples.", "She doesn't like apples.", "She no like apples.", "She not like apples."], "correctAnswer": "She doesn't like apples.", "explanation": "Third person singular 'she' requires 'doesn't'."},
                {"id": 5, "question": "What is an adjective?", "options": ["Action word", "Naming word", "Describing word", "Connecting word"], "correctAnswer": "Describing word", "explanation": "Adjectives describe or modify nouns (e.g., 'blue', 'fast')."}
            ],
            "Math": [
                {"id": 1, "question": "What is the derivative of x^2?", "options": ["x", "2x", "2", "x^2"], "correctAnswer": "2x", "explanation": "Using the power rule: d/dx(x^n) = nx^(n-1)."},
                {"id": 2, "question": "What is 2 + 2 * 3?", "options": ["12", "8", "6", "10"], "correctAnswer": "8", "explanation": "Order of operations (PEMDAS): Multiply first (2*3=6), then add (2+6=8)."},
                {"id": 3, "question": "Solve for x: 2x - 4 = 0", "options": ["2", "4", "0", "-2"], "correctAnswer": "2", "explanation": "2x = 4, so x = 2."},
                {"id": 4, "question": "What is the value of Pi (approx)?", "options": ["3.12", "3.14", "3.16", "3.18"], "correctAnswer": "3.14", "explanation": "Pi is approximately 3.14159..."},
                {"id": 5, "question": "What is the square root of 144?", "options": ["10", "11", "12", "14"], "correctAnswer": "12", "explanation": "12 * 12 = 144."}
            ],
            "CS": [
                {"id": 1, "question": "What does CPU stand for?", "options": ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit"], "correctAnswer": "Central Processing Unit", "explanation": "CPU is the brain of the computer."},
                {"id": 2, "question": "Which is NOT a programming language?", "options": ["Python", "Java", "HTML", "C++"], "correctAnswer": "HTML", "explanation": "HTML is a markup language, not a programming language."},
                {"id": 3, "question": "What is the time complexity of binary search?", "options": ["O(n)", "O(n^2)", "O(log n)", "O(1)"], "correctAnswer": "O(log n)", "explanation": "Binary search halves the search space each step."},
                {"id": 4, "question": "What connects a client to a server?", "options": ["Network", "Database", "Compiler", "OS"], "correctAnswer": "Network", "explanation": "Clients communicate with servers over a network (internet)."},
                {"id": 5, "question": "What is a 'bug'?", "options": ["A feature", "An error in code", "A virus", "A hardware fault"], "correctAnswer": "An error in code", "explanation": "A bug is a flaw or error in software."}
            ]
        }
        
        # Match subject to key
        key = "English" if "Eng" in subject or "Lang" in subject else \
              "Math" if "Math" in subject or "Alg" in subject else \
              "CS" if "CS" in subject or "Comp" in subject else \
              "English" # Default to English/General if unknown
              
        selected_quiz = quizzes.get(key, quizzes["English"])
        # Adjust count and structure
        return selected_quiz[:count]

    def _get_mock_game_problem(self, subject, level):
        """Fallback to high-quality static game problems"""
        
        problems = {
             "English": {
                "type": "problem_solving",
                "question": "Can you unscramble this word related to writing? 'RGMRAAM'",
                "input_type": "text",
                "answer": "grammar",
                "hints": ["It's what this app teaches", "Rules of language"],
                "points": 50
             },
             "Math": {
                "type": "problem_solving",
                "question": "What comes next in the sequence: 2, 4, 8, 16, ...?",
                "input_type": "numeric",
                "answer": "32",
                "hints": ["Multiply the previous number by 2", "Powers of 2"],
                "points": 50
             },
             "CS": {
                "type": "problem_solving",
                "question": "Convert the binary number 101 to decimal.",
                "input_type": "numeric",
                "answer": "5",
                "hints": ["4 + 0 + 1", "Binary base 2"],
                "points": 50
             }
        }
        
        key = "English" if "Eng" in subject or "Lang" in subject else \
              "Math" if "Math" in subject or "Alg" in subject else \
              "CS" if "CS" in subject or "Comp" in subject else \
              "English"

        return problems.get(key, problems["English"])

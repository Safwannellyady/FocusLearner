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
        env_key = os.getenv('GEMINI_API_KEY')
        self.api_key = env_key.strip() if env_key else None
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found. AI features will use fallback mock data.")

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
            if 'candidates' not in result or not result['candidates']:
                with open("gemini_error.log", "w") as f:
                    f.write(f"Blocked or Empty Result: {json.dumps(result)}")
                return None
            return result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            error_data = f"Exception: {e}\n"
            if 'response' in locals() and response:
                error_data += f"Status: {response.status_code}\nText: {response.text}"
            with open("gemini_error.log", "a") as f:
                f.write(error_data + "\n")
            print(f"Gemini API Error: {e}")
            return None

    def generate_quiz(self, subject: str, topic: str, count: int = 5, video_context: dict = None) -> List[Dict[str, Any]]:
        """
        Generate a quiz for a specific subject and topic.
        """
        if not self.api_key:
            return self._get_mock_quiz(subject, topic, count)

        context_str = ""
        if video_context:
            context_str = f"\nFocus intensely on this specific video context:\nTitle: {video_context.get('title', '')}\nDescription: {video_context.get('description', '')}\nThe questions MUST be highly relevant to this video's specific content."

        prompt = f"""
        Generate a {count}-question multiple choice quiz for the subject "{subject}" and topic "{topic}".{context_str}
        Return ONLY a raw JSON array of objects. Do not include markdown formatting like ```json ... ```.
        Each object should have:
        - 'id': integer
        - 'question': string
        - 'options': array of 4 strings
        - 'correctAnswer': string (must exactly match one of the options)
        - 'explanation': string (brief explanation of the answer)
        """
        
        print(f"[DEBUG AI] Generated Prompt:\n{prompt}")
        
        try:
            text_response = self._call_gemini(prompt)
            print(f"[DEBUG AI] Response text:\n{text_response}")
            if not text_response:
                 return self._get_mock_quiz(subject, topic, count)
        except Exception as e:
            print(f"[DEBUG AI] Error during Gemini call or response processing: {e}")
            return self._get_mock_quiz(subject, topic, count)

        try:
            # Clean up potential markdown formatting if the model disregards instructions
            cleaned_text = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"Error parsing AI quiz: {e}")
            return self._get_mock_quiz(subject, topic, count)

    def generate_result_based_activity(self, subject: str, topic: str, activity_type: str = "auto", intent=None, loop_state=None, video_context: dict = None) -> Dict[str, Any]:
        """
        Generate a specific type of activity: 'coding', 'lab', 'crossword', 'quiz'.
        If 'auto', decides based on subject and topic.
        """
        if activity_type == "auto":
             sub_top = f"{subject} {topic}".lower()
             if any(x in sub_top for x in ["cs", "computer", "algorithm", "coding", "python", "java", "c++", "web", "software", "dsa", "sorting"]):
                 activity_type = "coding"
             elif any(x in sub_top for x in ["physics", "chemistry", "biology", "medical", "science", "cyber", "security", "hacking", "lab", "network", "system", "linux", "devops"]):
                 activity_type = "lab"
             else:
                 activity_type = "lab" # Default to interactive lab rather than crossword
        
        if activity_type == "coding":
            return self.generate_coding_challenge(subject, topic, intent, loop_state, video_context)
        elif activity_type == "lab":
            return self.generate_virtual_lab(subject, topic, intent, loop_state, video_context)
        elif activity_type == "crossword":
            return self.generate_crossword(subject, topic, video_context)
        
        return self.generate_game_content(subject, 1, video_context) # Fallback

    def generate_coding_challenge(self, subject: str, topic: str, intent=None, loop_state=None, video_context: dict = None) -> Dict[str, Any]:
        clean_topic = re.sub(r'[^a-zA-Z0-9]', '_', str(topic).lower().strip()) or "solve"
        mock_fallback = {
            "type": "coding",
            "title": f"Coding Challenge: {topic} ({subject})",
            "description": f"Write a clean, efficient Python implementation related to {topic} concepts in {subject}. Ensure your algorithm handles edge cases gracefully.",
            "starter_code": f"# {subject} - {topic}\ndef {clean_topic}_solution(data):\n    # TODO: Implement core logic for {topic}\n    return data\n",
            "test_cases": [{"input": "[1, 2, 3]", "output": "[1, 2, 3]"}],
            "points": 100
        }
        if not self.api_key:
             return mock_fallback
             
        # Extract intent metadata
        outcomes = ""
        difficulty = "Intermediate"
        if intent:
             import json
             try:
                 outcome_list = json.loads(intent.required_outcomes)
                 outcomes = f"\nRequired Outcomes: {', '.join(outcome_list)}"
             except:
                 pass
             difficulty = intent.difficulty
        
        # Adaptive Logic
        adaptation_prompt = ""
        if loop_state and loop_state.attempts > 0:
            adaptation_prompt = f"\nUser is retrying ({loop_state.attempts} fails). GENERATE A SIMPLER PROBLEM. Include a specific HINT in the description."
            difficulty = "Beginner" # Downgrade difficulty

        context_str = ""
        if video_context:
            context_str = f"\nCritically align the challenge to this video context:\nTitle: {video_context.get('title', '')}\nDescription: {video_context.get('description', '')}\nThe coding problem MUST directly relate to the concepts taught in this video."

        prompt = f"""
        Generate a coding challenge for {subject} - {topic}.
        Difficulty Level: {difficulty}{outcomes}{adaptation_prompt}{context_str}
        
        Return JSON:
        - title: string
        - description: string (problem statement)
        - starter_code: string (python or relevant language)
        - test_cases: array of objects {{ "input": string, "output": string }}
        - solution: string (complete solution code)
        - points: 100
        """
        parsed = self._parse_json_response(self._call_gemini(prompt), "coding")
        if "error" in parsed:
            return mock_fallback
        return parsed

    def generate_virtual_lab(self, subject: str, topic: str, intent=None, loop_state=None, video_context: dict = None) -> Dict[str, Any]:
        sub_top = f"{subject} {topic}".lower()
        if any(w in sub_top for w in ["cyber", "security", "hack"]):
            mock_fallback = {
                "type": "lab",
                "title": f"Security Lab: {topic}",
                "scenario": f"You are conducting a controlled ethical security audit and vulnerability assessment focused on {topic} within {subject}. Your goal is to analyze the system infrastructure and apply defensive countermeasures.",
                "steps": [
                    f"Step 1: Perform Reconnaissance and Port/Vulnerability Scan on {topic} target endpoint",
                    f"Step 2: Analyze Attack Vectors and Simulate Controlled Exploit Mitigation",
                    f"Step 3: Deploy Hardened Security Policies & Verify System Integrity"
                ],
                "question": f"When implementing robust defense-in-depth against {topic} threats, which principle is critical for preventing lateral breach escalation?",
                "options": [
                    "Principle of Least Privilege (PoLP) and Network Segmentation",
                    "Disabling System Access and Audit Logs",
                    "Using Unencrypted Default Port Forwarding",
                    "Allowing Unrestricted Anonymous Root Access"
                ],
                "correct_answer": "Principle of Least Privilege (PoLP) and Network Segmentation",
                "explanation": f"The Principle of Least Privilege (PoLP) ensures that users and systems only possess access rights strictly required for their tasks, preventing unauthorized lateral movement during {topic} incidents."
            }
        else:
            mock_fallback = {
                "type": "lab",
                "title": f"Virtual Lab: {topic} ({subject})",
                "scenario": f"You are entering an interactive experimentation lab for {subject} focusing on {topic}. Step through the practical execution process and analyze the resulting system outcomes.",
                "steps": [
                    f"Step 1: Configure initial parameters and variables for {topic}",
                    f"Step 2: Execute practical simulation workflow",
                    f"Step 3: Observe performance metrics and document theoretical verification"
                ],
                "question": f"Based on core principles of {topic} in {subject}, what is the primary expected behavior during optimal execution?",
                "options": [
                    f"Consistent stability and predictable verification of {topic} rules",
                    "Random unhandled exceptions across all components",
                    "Immediate degradation without error diagnostics",
                    "Complete deadlock of downstream operations"
                ],
                "correct_answer": f"Consistent stability and predictable verification of {topic} rules",
                "explanation": f"In {subject}, properly structured {topic} workflows maintain consistent stability and adherence to foundational theory."
            }
        if not self.api_key:
            return mock_fallback
        
        # Extract intent metadata
        else:
            selected_quiz = [
                {"id": 1, "question": f"What is the foundational principle when studying {topic} in {subject}?", "options": [f"Understanding core {topic} methodology and rules", "Skipping fundamental definitions", "Ignoring practical verification", "Memorizing unrelated formulas"], "correctAnswer": f"Understanding core {topic} methodology and rules", "explanation": f"Mastering {topic} requires clear conceptual comprehension of its foundational rules and methodology."},
                {"id": 2, "question": f"Which step is most important before applying {topic} concepts in real-world scenarios?", "options": ["Analyzing problem requirements and context", "Guessing random parameters", "Bypassing safety protocols", "Disabling diagnostic logs"], "correctAnswer": "Analyzing problem requirements and context", "explanation": "Proper analysis ensures accurate application of theory to practical situations."},
                {"id": 3, "question": f"When evaluating outcomes in {topic}, how do we verify correctness?", "options": ["Comparing results against established theoretical models or test cases", "Checking if execution was fast regardless of accuracy", "Assuming any output is valid", "Deleting the original baseline"], "correctAnswer": "Comparing results against established theoretical models or test cases", "explanation": "Verification compares observed outputs against validated baselines."},
                {"id": 4, "question": f"What role does structured practice play in mastering {subject} ({topic})?", "options": ["It builds cognitive neural pathways and reinforces problem-solving proficiency", "It causes unnecessary memory overhead", "It replaces the need for conceptual lectures", "It has no measurable impact on retention"], "correctAnswer": "It builds cognitive neural pathways and reinforces problem-solving proficiency", "explanation": "Active recall and structured practice dramatically improve long-term retention and skill mastery."},
                {"id": 5, "question": f"How should you approach complex edge cases when working with {topic}?", "options": ["Deconstruct the problem into manageable sub-components and test systematically", "Ignore edge cases until production deployment", "Rewrite the entire system from scratch immediately", "Disable error checking"], "correctAnswer": "Deconstruct the problem into manageable sub-components and test systematically", "explanation": "Systematic decomposition allows precise diagnosis and resolution of complex edge cases."}
            ]
        return selected_quiz[:count]

    def _get_mock_game_problem(self, subject, level, topic="General Practice"):
        """Fallback to high-quality synchronized game problems"""
        sub_top = f"{subject} {topic}".lower()
        if any(w in sub_top for w in ["cyber", "security", "hack"]):
            return {
                "challenge_id": str(uuid.uuid4()),
                "type": "lab",
                "title": f"Security Challenge: {topic}",
                "scenario": f"You are evaluating the security boundary for {subject} ({topic}). Step through the defensive hardening process.",
                "steps": [
                    f"Step 1: Inspect traffic headers for anomalies related to {topic}",
                    f"Step 2: Isolate compromised endpoints and apply rule filtering",
                    f"Step 3: Validate zero-trust authentication policies"
                ],
                "question": f"Which security protocol ensures integrity and confidentiality across {topic} communications?",
                "options": ["Transport Layer Security (TLS 1.3)", "Unencrypted HTTP/Telnet", "Plaintext FTP Transfer", "Static Default Passwords"],
                "correct_answer": "Transport Layer Security (TLS 1.3)",
                "explanation": "TLS 1.3 provides strong encryption and authenticated integrity checks for data in transit."
            }
        elif any(w in sub_top for w in ["cs", "computer", "algorithm", "coding", "python", "dsa", "sort"]):
            return {
                "challenge_id": str(uuid.uuid4()),
                "type": "coding",
                "title": f"Algorithm Arena: {topic}",
                "description": f"Write an optimized Python function for {topic} in {subject}. Aim for optimal time complexity.",
                "starter_code": f"# {subject} - {topic} Arena\ndef solve_problem(nums):\n    # TODO: Implement {topic} logic\n    return sorted(nums)\n",
                "test_cases": [{"input": "[3, 1, 2]", "output": "[1, 2, 3]"}],
                "points": 100
            }
        else:
            return {
                "challenge_id": str(uuid.uuid4()),
                "type": "lab",
                "title": f"Interactive Challenge: {topic}",
                "scenario": f"Welcome to the {subject} ({topic}) experimentation arena. Complete the structured steps below.",
                "steps": [
                    f"Step 1: Review initial problem constraints for {topic}",
                    f"Step 2: Execute analytical evaluation",
                    f"Step 3: Confirm outcome stability"
                ],
                "question": f"What is the key success criterion when completing {topic} exercises?",
                "options": [f"Precision and adherence to {subject} standards", "Random approximation without checking", "Skipping validation steps", "Disabling system checks"],
                "correct_answer": f"Precision and adherence to {subject} standards",
                "explanation": f"Precision and verification ensure deep mastery of {subject} concepts."
            }

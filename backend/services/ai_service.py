"""
FocusLearner Pro - AI Service
Service for interacting with Google Gemini AI for content generation
"""

import os
import json
import requests
import re
import uuid
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

        context_str = ""
        if video_context:
            context_str = f"\nFrame the Virtual Lab scenario entirely around this video context:\nTitle: {video_context.get('title', '')}\nDescription: {video_context.get('description', '')}\nThe scenario MUST be a direct application of the video's content."

        # Setup basic adaptive variables
        outcomes = ""
        difficulty = "Intermediate"
        if intent:
             difficulty = intent.difficulty

        prompt = f"""
        Generate a Virtual Lab scenario for {subject} - {topic}.
        Difficulty Level: {difficulty}{outcomes}{context_str}
        
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
        parsed = self._parse_json_response(self._call_gemini(prompt), "lab")
        if "error" in parsed:
            return mock_fallback
        return parsed

    def generate_crossword(self, subject: str, topic: str, video_context: dict = None) -> Dict[str, Any]:
        mock_fallback = {
            "type": "crossword",
            "title": f"Vocabulary Drill: {topic}",
            "words": [
                {"clue": f"Core concept term in {topic}", "word": "CONCEPT"},
                {"clue": f"Primary operation method in {subject}", "word": "METHOD"},
                {"clue": f"Key verification metric for {topic}", "word": "METRIC"}
            ]
        }
        if not self.api_key:
            return mock_fallback

        context_str = ""
        if video_context:
             context_str = f"\nExtract keywords directly from this video context:\nTitle: {video_context.get('title', '')}"

        prompt = f"""
        Generate a Crossword/Vocabulary drill for {subject} - {topic}.{context_str}
        Return exactly 5 key terms and clues.
        
        Return JSON:
        - type: "crossword"
        - title: string
        - words: array of objects {{ "clue": string, "word": uppercase_string }}
        """
        parsed = self._parse_json_response(self._call_gemini(prompt), "crossword")
        if "error" in parsed:
             return mock_fallback
        return parsed

    def _parse_json_response(self, text_response: str, fallback_type: str) -> Dict[str, Any]:
        """
        Safely parse JSON from Gemini response, handling markdown blocks.
        """
        if not text_response:
             return {"type": fallback_type, "error": "Empty response"}
             
        try:
             # Clean markdown json blocks if present
             text = text_response.strip()
             if text.startswith("```json"):
                  text = text[7:]
             elif text.startswith("```"):
                  text = text[3:]
             if text.endswith("```"):
                  text = text[:-3]
             text = text.strip()
             
             data = json.loads(text)
             data["type"] = fallback_type
             return data
        except Exception as e:
             print(f"[DEBUG] Parse error in _parse_json_response: {e}\nRaw Response: {text_response}")
             return {"type": fallback_type, "error": "Parse error"}

    def generate_game_content(self, subject: str, level: int, video_context: dict = None, topic: str = "General Practice") -> Dict[str, Any]:
        """
        Generate generic game content/problems based on subject, level, and topic.
        """
        return self._get_mock_game_problem(subject, level, topic)

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
        
        text_response = self._call_gemini(prompt)
        if text_response:
            return text_response.strip()
        return f"{subject} {user_query} lecture"

    def analyze_misconception(self, question: str, user_answer: str, correct_answer: str, subject: str) -> Dict[str, str]:
        """
        Analyze why a user got a question wrong.
        """
        if not self.api_key:
            return {
                "analysis": "Incorrect answer. Review the basic concepts.",
                "remediation_focus": subject
            }

        prompt = f"""
        The student is learning {subject}.
        Question: "{question}"
        Student Answer: "{user_answer}"
        Correct Answer: "{correct_answer}"

        Identify the exact conceptual misconception causing this error.
        Provide a 1-sentence analysis and recommend a specific sub-topic to review.
        
        Return JSON:
        - analysis: string
        - remediation_focus: string
        """
        
        parsed = self._parse_json_response(self._call_gemini(prompt), "misconception")
        if "error" in parsed:
             return {"analysis": "Incorrect answer. Review the basic concepts.", "remediation_focus": subject}
        return parsed

    def chat(self, message: str, context: Optional[str] = None, history: List[Dict[str, Any]] = None, video_id: Optional[str] = None) -> str:
        """
        Main chat interface called by chat_routes.py.
        Handles video context, subject context, history, and RAG retrieval.
        """
        if history is None:
            history = []
        
        if video_id:
            from services.vector_store import vector_store
            if not vector_store.is_video_processed(video_id):
                try:
                    from services.youtube_service import YouTubeService
                    YouTubeService().get_video_transcript(video_id)
                except Exception as e:
                    print(f"Transcript load error in chat: {e}")

        if not self.api_key:
            return self._get_fallback_chat_response(message, context, video_id)
            
        system_instruction = (
            "You are FocusLearner AI, an encouraging and expert AI mentor assisting a student. "
            "Explain concepts clearly, concisely, and accurately without any fluff. "
        )
        if context:
            system_instruction += f"\nCurrent Study Subject/Video Context: {context}\n"
            
        if video_id:
            try:
                from services.vector_store import vector_store
                relevant_chunks = vector_store.query_context(video_id, message)
                if relevant_chunks and relevant_chunks[0]:
                    system_instruction += f"\nVideo Transcript Excerpt:\n{relevant_chunks[0][:15000]}\n"
            except Exception as e:
                print(f"RAG Error: {e}")

        full_prompt = f"System: {system_instruction}\n\n"
        for msg in history[-10:]:
            role = "User" if msg.get("role") == "user" else "Tutor"
            parts = msg.get("parts", [""])
            content = parts[0] if parts else ""
            full_prompt += f"{role}: {content}\n"
            
        full_prompt += f"User: {message}\nTutor:"
        
        resp = self._call_gemini(full_prompt)
        if not resp:
            return self._get_fallback_chat_response(message, context, video_id)
        return resp

    def _get_fallback_chat_response(self, message: str, context: Optional[str] = None, video_id: Optional[str] = None) -> str:
        """Fallback response when API key is missing or offline"""
        msg_lower = message.lower()
        ctx_str = f" regarding {context}" if context else ""
        if any(w in msg_lower for w in ['hello', 'hi', 'hey', 'start']):
            return f"Hello! I am your FocusLearner AI Mentor. How can I help you understand the concepts{ctx_str} today?"
        if any(w in msg_lower for w in ['joke', 'funny']):
            return "Why do Python programmers prefer dark mode? Because light attracts bugs!"
        if any(w in msg_lower for w in ['help', 'what is', 'explain', 'how']):
            return f"That is a great question{ctx_str}! To master this concept, break it down into core principles: 1) Identify given variables and constraints, 2) Apply the foundational formula or theorem, and 3) Verify your solution step-by-step against edge cases."
        return f"I hear your question about '{message[:40]}...'. When studying{ctx_str}, active recall and testing yourself on key definitions will reinforce neural retention! Let's tackle a practice challenge together."

    def answer_question(self, video_id: str, message: str, history: List[Dict[str, str]] = None) -> str:
        """
        Answer a student's question using video RAG context and chat history.
        """
        return self.chat(message=message, context=None, history=history, video_id=video_id)

    def _get_mock_quiz(self, subject, topic, count):
        """Fallback to high-quality topic-synchronized static quizzes if AI fails"""
        sub_top = f"{subject} {topic}".lower()
        if any(w in sub_top for w in ["cyber", "security", "hack"]):
            selected_quiz = [
                {"id": 1, "question": f"In {topic} ({subject}), what is the primary goal of reconnaissance before vulnerability assessment?", "options": ["Mapping target network topology and services", "Immediately executing Denial of Service", "Deleting local server access logs", "Installing physical network taps"], "correctAnswer": "Mapping target network topology and services", "explanation": "Reconnaissance gathers intelligence on the target architecture to identify potential entry points before active testing."},
                {"id": 2, "question": "Which cryptographic approach uses a public key for encryption and a private key for decryption?", "options": ["Asymmetric Cryptography (PKI)", "Symmetric AES-256", "MD5 Hashing", "Caesar Cipher"], "correctAnswer": "Asymmetric Cryptography (PKI)", "explanation": "Asymmetric cryptography utilizes a paired public and private key system."},
                {"id": 3, "question": f"When mitigating SQL Injection vulnerabilities during {topic} audits, which technique is most effective?", "options": ["Prepared Statements & Parameterized Queries", "Disabling HTTPS protocols", "Increasing database connection timeout", "Hiding error messages without validation"], "correctAnswer": "Prepared Statements & Parameterized Queries", "explanation": "Parameterized queries separate SQL command structure from user input data completely."},
                {"id": 4, "question": "What is the primary function of a Web Application Firewall (WAF)?", "options": ["Inspecting and filtering HTTP/HTTPS traffic between users and web applications", "Routing internal local area network packets", "Assigning DHCP IP addresses to client workstations", "Overclocking server CPU performance"], "correctAnswer": "Inspecting and filtering HTTP/HTTPS traffic between users and web applications", "explanation": "A WAF protects web applications by monitoring, filtering, and blocking malicious HTTP traffic such as XSS or SQLi."},
                {"id": 5, "question": f"In ethical {topic}, what distinguishes white-hat testing from unauthorized intrusion?", "options": ["Prior written consent and clearly defined Rules of Engagement (RoE)", "The use of automated scanning tools", "The operating system used by the analyst", "The time of day testing takes place"], "correctAnswer": "Prior written consent and clearly defined Rules of Engagement (RoE)", "explanation": "Ethical testing requires explicit authorization and adherence to agreed-upon scope and rules of engagement."}
            ]
        elif any(w in sub_top for w in ["sort", "algorithm", "dsa", "cs", "computer"]):
            selected_quiz = [
                {"id": 1, "question": f"What is the average and worst-case time complexity of Quick Sort in {topic}?", "options": ["Average: O(n log n), Worst: O(n^2)", "Average: O(n^2), Worst: O(n^3)", "Average: O(n), Worst: O(n log n)", "Always O(1) constant time"], "correctAnswer": "Average: O(n log n), Worst: O(n^2)", "explanation": "Quick Sort averages O(n log n) comparisons, but degrades to O(n^2) when poor pivot choices occur."},
                {"id": 2, "question": "Which sorting algorithm is inherently stable and guarantees O(n log n) time complexity across all cases?", "options": ["Merge Sort", "Selection Sort", "Quick Sort", "Heap Sort"], "correctAnswer": "Merge Sort", "explanation": "Merge Sort divides the array and merges subarrays in stable order, guaranteeing O(n log n)."},
                {"id": 3, "question": f"Why is Bubble Sort considered inefficient for large datasets in {topic}?", "options": ["It requires O(n^2) nested loop comparisons and adjacent swaps", "It requires O(n) auxiliary space overhead", "It cannot sort integer data types", "It only works on linked lists"], "correctAnswer": "It requires O(n^2) nested loop comparisons and adjacent swaps", "explanation": "Bubble Sort compares and swaps adjacent elements repeatedly, resulting in quadratic time complexity."},
                {"id": 4, "question": "In space complexity analysis, which sorting algorithm operates in-place with O(1) auxiliary space?", "options": ["Heap Sort & Selection Sort", "Merge Sort", "Radix Sort", "Bucket Sort"], "correctAnswer": "Heap Sort & Selection Sort", "explanation": "Heap Sort and Selection Sort sort elements within the existing array without requiring extra allocation."},
                {"id": 5, "question": f"When selecting an algorithm for {topic} on a nearly sorted array, which algorithm performs best?", "options": ["Insertion Sort (O(n) best case)", "Merge Sort", "Selection Sort (always O(n^2))", "Quick Sort with first-element pivot"], "correctAnswer": "Insertion Sort (O(n) best case)", "explanation": "Insertion Sort requires only O(n) comparisons when elements are already nearly sorted."}
            ]
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

    def generate_lab_session(self, subject: str, topic: str, description: str = "") -> dict:
        """
        Deep-learn user session details and generate the exact required lab configuration.
        Determines domain mode (coding, cybersecurity, physics, chemistry, os) and synthesizes lab parameters.
        """
        text = f"{subject} {topic} {description}".lower()
        
        # Determine lab mode based on deep-learned keywords or AI prompt
        if any(w in text for w in ['code', 'python', 'javascript', 'c++', 'rust', 'sql', 'dsa', 'algorithm', 'react', 'web', 'compiler', 'programming']):
            mode = 'coding'
            starter_code = f"# Deep-Learned AI Lab: {topic}\n# Subject: {subject}\n# Instructions: Complete the implementation below for {topic}.\n\ndef solve_{re.sub(r'[^a-zA-Z0-9]', '_', topic.lower()).strip('_')}(data):\n    # TODO: Implement {topic} logic\n    pass\n\nif __name__ == '__main__':\n    print(solve_{re.sub(r'[^a-zA-Z0-9]', '_', topic.lower()).strip('_')}([10, 20, 30]))\n"
            language = "python"
            if any(w in text for w in ['javascript', 'react', 'node', 'js']):
                language = "javascript"
                starter_code = f"// Deep-Learned AI Lab: {topic}\n// Subject: {subject}\nfunction solveProblem(data) {{\n    // TODO: Implement {topic} logic\n    return data;\n}}\nconsole.log(solveProblem([10, 20, 30]));\n"
            elif any(w in text for w in ['c++', 'cpp']):
                language = "cpp"
                starter_code = f"// Deep-Learned AI Lab: {topic}\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {{\n    cout << \"Solving {topic}...\" << endl;\n    return 0;\n}}\n"
            
            lab_data = {
                "mode": mode,
                "title": f"Code Compiler Lab: {topic}",
                "language": language,
                "starter_code": starter_code,
                "problem_description": f"Write an optimized solution for {topic}. Verify memory usage and time complexity against test harnesses.",
                "test_cases": [{"input": "[10, 20, 30]", "expected": "[10, 20, 30]"}],
                "hints": [f"Review foundational principles of {topic}.", "Consider edge cases with empty or boundary inputs."]
            }
        elif any(w in text for w in ['cyber', 'linux', 'security', 'hack', 'network', 'pentest', 'vulnerability', 'kali', 'defense', 'nmap', 'sql injection']):
            mode = 'cybersecurity'
            lab_data = {
                "mode": mode,
                "title": f"Kali Linux Defense Arena: {topic}",
                "terminal_prompt": "root@kali-focus-box:~#",
                "target_host": "192.168.100.45",
                "open_ports": [22, 80, 443, 8080],
                "simulated_commands": [
                    {"cmd": "nmap -sV -p 1-5000 target.box", "output": f"Starting Nmap 7.94... Host up.\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 8.9p1\n80/tcp   open  http    Apache/2.4.52\n8080/tcp open  http-proxy Node.js Express\n[+] Vulnerability scan for {topic}: Potential misconfigured CORS / auth header detected."},
                    {"cmd": "tcpdump -i eth0 -n -c 5", "output": f"tcpdump: verbose output suppressed\n18:23:11.102 IP 192.168.100.12.54321 > 192.168.100.45.80: Flags [P.], length 142\nECHO: HTTP/1.1 POST /api/auth (Plaintext token exposed for {topic})"},
                    {"cmd": "cat /etc/passwd | grep -v nologin", "output": "root:x:0:0:root:/root:/bin/bash\nfocus_admin:x:1001:1001:Security Team:/home/focus_admin:/bin/bash"},
                    {"cmd": f"python3 exploit_{re.sub(r'[^a-zA-Z0-9]', '_', topic.lower()).strip('_')}.py", "output": f"[*] Launching diagnostic test for {topic}...\n[+] Target responded with status 200\n[+] Flag retrieved: FLAG{{FOCUS_LEARNER_SEC_{uuid.uuid4().hex[:8].upper()}}}"}
                ],
                "challenge_question": f"What vulnerability did the diagnostic scan uncover during the {topic} audit?",
                "correct_answer": "Plaintext token exposed over unencrypted HTTP",
                "options": ["Plaintext token exposed over unencrypted HTTP", "Firewall blocked all incoming TCP packets", "SSH server requires 4096-bit RSA keys", "No open ports found on target host"]
            }
        elif any(w in text for w in ['physics', 'mechanics', 'projectile', 'kinematics', 'circuit', 'ohm', 'voltage', 'gravity', 'dynamics', 'force']):
            mode = 'physics'
            lab_data = {
                "mode": mode,
                "title": f"Physics Simulation Lab: {topic}",
                "simulation_type": "kinematics_and_circuits",
                "default_velocity": 35,
                "default_angle": 45,
                "default_voltage": 12,
                "default_resistance": 4,
                "description": f"Manipulate physical parameters for {topic} to observe real-time vector trajectory, max range, and Ohm's law amperage.",
                "challenge_question": f"In ideal projectile motion ({topic}), at what launch angle is horizontal range maximized?",
                "correct_answer": "45 degrees",
                "options": ["45 degrees", "30 degrees", "60 degrees", "90 degrees"]
            }
        elif any(w in text for w in ['chemistry', 'chemical', 'molecular', 'reaction', 'titration', 'acid', 'base', 'ph', 'molar', 'enthalpy']):
            mode = 'chemistry'
            lab_data = {
                "mode": mode,
                "title": f"Chemistry Reaction & Titration Lab: {topic}",
                "simulation_type": "acid_base_titration",
                "default_hcl_conc": 0.15,
                "default_naoh_conc": 0.15,
                "default_temp": 25,
                "description": f"Simulate chemical equilibrium, pH equivalence points, and exothermic heat changes for {topic}.",
                "challenge_question": f"When neutralizing strong acid with strong base ({topic}), what is the exact pH at the equivalence point?",
                "correct_answer": "pH = 7.0 (Neutral)",
                "options": ["pH = 7.0 (Neutral)", "pH = 2.0 (Strongly Acidic)", "pH = 12.0 (Strongly Basic)", "pH = 4.5 (Weakly Acidic)"]
            }
        elif any(w in text for w in ['os', 'operating system', 'cpu', 'memory', 'ram', 'scheduler', 'page fault', 'virtual memory', 'kernel', 'thread']):
            mode = 'os'
            lab_data = {
                "mode": mode,
                "title": f"OS & Computer Architecture Sandbox: {topic}",
                "simulation_type": "cpu_scheduling_and_ram",
                "default_quantum": 4,
                "description": f"Simulate Round-Robin CPU process scheduling and RAM virtual memory page replacement for {topic}.",
                "challenge_question": f"What happens in virtual memory ({topic}) when a running process accesses a virtual page not currently in physical RAM?",
                "correct_answer": "A Page Fault occurs, and the OS loads the page from disk",
                "options": ["A Page Fault occurs, and the OS loads the page from disk", "The CPU immediately resets and reboots the computer", "The process is permanently deleted from hard disk", "RAM clock speed doubles automatically"]
            }
        else:
            mode = 'general'
            lab_data = {
                "mode": mode,
                "title": f"Interactive Investigation Lab: {topic}",
                "description": f"Explore foundational hypotheses and structured analytical workflows for {subject} ({topic}).",
                "steps": [
                    f"Step 1: Deconstruct problem constraints for {topic}",
                    f"Step 2: Formulate testable hypotheses based on {subject} rules",
                    f"Step 3: Execute verification and analyze error margins"
                ],
                "challenge_question": f"Why is systematic verification crucial when mastering {topic}?",
                "correct_answer": f"It ensures conceptual accuracy and builds robust mastery in {subject}",
                "options": [f"It ensures conceptual accuracy and builds robust mastery in {subject}", "It lets you skip watching lecture videos", "It eliminates the need for any practice", "It reduces computer power consumption"]
            }
        
        return lab_data

    def generate_game_session(self, subject: str, topic: str, description: str = "") -> dict:
        """
        Deep-learn user session details and generate the required game/fun session configuration.
        """
        text = f"{subject} {topic} {description}".lower()
        if any(w in text for w in ['code', 'python', 'javascript', 'c++', 'rust', 'sql', 'dsa', 'algorithm']):
            game_type = "code_scramble"
            title = f"Algorithm Arena & Code Battle: {topic}"
            trivia = [
                {"question": f"In {topic}, what time complexity is considered optimal for searching sorted data?", "options": ["O(log n) Binary Search", "O(n^2) Nested Loop", "O(2^n) Exponential", "O(n!) Factorial"], "correct": "O(log n) Binary Search"},
                {"question": f"Which data structure operates strictly on Last-In-First-Out (LIFO) order during {topic} execution?", "options": ["Stack", "Queue", "Priority Heap", "Hash Map"], "correct": "Stack"},
                {"question": f"When debugging memory leaks in {topic}, what should you inspect first?", "options": ["Unclosed references and dangling pointers/listeners", "CSS style sheets", "HTML document title", "Screen brightness settings"], "correct": "Unclosed references and dangling pointers/listeners"},
                {"question": f"In recursive {topic} functions, what prevents infinite stack overflow?", "options": ["A properly defined Base Case", "Increasing RAM allocation", "Removing all return statements", "Using global variables only"], "correct": "A properly defined Base Case"}
            ]
        elif any(w in text for w in ['cyber', 'linux', 'security', 'hack', 'network', 'pentest']):
            game_type = "cyber_defense"
            title = f"Cyber Defense & Packet Intercept Battle: {topic}"
            trivia = [
                {"question": f"During {topic} defense, which HTTP status code indicates unauthorized client authentication?", "options": ["401 Unauthorized", "200 OK", "301 Moved Permanently", "502 Bad Gateway"], "correct": "401 Unauthorized"},
                {"question": f"Which Linux command displays active listening network sockets during {topic} investigation?", "options": ["netstat -tuln / ss -tuln", "ls -la", "mkdir /tmp/test", "echo 'hello'"], "correct": "netstat -tuln / ss -tuln"},
                {"question": f"What is the best defense against Cross-Site Scripting (XSS) in {topic} web applications?", "options": ["Context-aware output encoding and sanitizing user input", "Disabling HTTPS completely", "Hiding input fields with CSS display:none", "Using longer variable names"], "correct": "Context-aware output encoding and sanitizing user input"},
                {"question": f"In asymmetric encryption ({topic}), which key must remain strictly private?", "options": ["The Private Key", "The Public Key", "The SSL Certificate Serial Number", "The Domain Name Server IP"], "correct": "The Private Key"}
            ]
        else:
            game_type = "quiz_battle"
            title = f"Knowledge Arena & Study Battle: {topic}"
            trivia = [
                {"question": f"What is the most effective study strategy to master {topic} in {subject}?", "options": ["Active recall and spaced repetition testing", "Passive re-reading of textbooks overnight", "Highlighting entire pages in yellow", "Skipping practice problems entirely"], "correct": "Active recall and spaced repetition testing"},
                {"question": f"When tackling complex formulas or theories in {topic}, what should you do first?", "options": ["Break them down into core variables and test simple assumptions", "Memorize them without understanding what variables mean", "Skip straight to the hardest exam question", "Ignore units of measurement"], "correct": "Break them down into core variables and test simple assumptions"},
                {"question": f"How does immediate feedback during {topic} practice accelerate mastery?", "options": ["It corrects neural misconceptions right when they occur", "It allows students to guess without consequence", "It slows down learning progression", "It eliminates the need for sleep"], "correct": "It corrects neural misconceptions right when they occur"},
                {"question": f"In {subject} ({topic}), why is interdisciplinary connection important?", "options": ["It links isolated concepts to real-world applications and broader networks", "It confuses students with extra terminology", "It takes too long to read", "It replaces the core textbook"], "correct": "It links isolated concepts to real-world applications and broader networks"}
            ]
        
        return {
            "game_type": game_type,
            "title": title,
            "subject": subject,
            "topic": topic,
            "trivia_list": trivia,
            "xp_reward": 150
        }

    def deep_learn_session(self, title: str, subject: str, topic: str, description: str = "") -> dict:
        """
        Master orchestrator: Deep-learn user session details and generate synchronized:
        1. Virtual Lab Configuration (`lab_config`)
        2. Game / Fun Session (`game_config`)
        3. Neural Quiz Questions (`quiz_config`)
        """
        print(f"[DEBUG AI DEEP LEARN] Synthesizing full session suite for: {title} | {subject} -> {topic}")
        lab_config = self.generate_lab_session(subject, topic, description)
        game_config = self.generate_game_session(subject, topic, description)
        quiz_config = self.generate_quiz(subject, topic, count=5, video_context={"title": title, "description": description})
        
        return {
            "lab_config": lab_config,
            "game_config": game_config,
            "quiz_config": quiz_config
        }


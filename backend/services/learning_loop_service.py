"""
FocusLearner Pro - Learning Loop Service
Manages the strict pedagogical flow: Understand -> Apply -> Fail -> Retry -> Master
"""
from models import db, LearningLoopState, LearningIntent, LearningStage
from datetime import datetime

class LearningLoopService:
    
    def get_current_stage(self, user_id, intent_id):
        """
        Get the current learning stage for a user on a specific intent.
        If no state exists, initializes it to UNDERSTAND (Lecture).
        """
        state = LearningLoopState.query.filter_by(
            user_id=user_id, 
            learning_intent_id=intent_id
        ).first()
        
        if not state:
            state = LearningLoopState(
                user_id=user_id,
                learning_intent_id=intent_id,
                current_stage=LearningStage.UNDERSTAND,
                attempts=0
            )
            db.session.add(state)
            db.session.commit()
            
        return state

    def update_stage(self, user_id, intent_id, success: bool, score: float = 0, metadata=None):
        """
        Advances the learning loop based on activity result.
        
        Transitions:
        - UNDERSTAND -> Success (Finished) -> APPLY
        - APPLY -> Success (>80%) -> MASTERED
        - APPLY -> Fail (<80%) -> REMEDIATE
        - REMEDIATE -> (Stay until remediation completed via specific call)
        """
        state = self.get_current_stage(user_id, intent_id)
        # Increment attempts only if applying
        if state.current_stage == LearningStage.APPLY:
            state.attempts += 1
            
        state.last_updated = datetime.utcnow()
        feedback = ""
        
        # STRICT MASTERY GATE
        # Even if technically "correct", low score prevents mastery
        if state.current_stage == LearningStage.APPLY and score < 80:
            success = False
            feedback_prefix = f"Score {score}% is below mastery threshold (80%). "
        else:
            feedback_prefix = ""
        
        if success:
            state.last_feedback = None # Clear previous feedback
            if state.current_stage == LearningStage.UNDERSTAND:
                state.current_stage = LearningStage.APPLY
                feedback = "Lecture complete! Time to apply what you learned."
            elif state.current_stage == LearningStage.APPLY:
                state.current_stage = LearningStage.MASTERED
                feedback = "Topic Mastered! You're ready for the next concept."
            elif state.current_stage == LearningStage.REMEDIATE:
                # If they passed an activity while in remediate state (maybe triggered manually?)
                state.current_stage = LearningStage.MASTERED
                feedback = "Great recovery! Topic Mastered."
        else:
            if state.current_stage == LearningStage.APPLY or state.current_stage == LearningStage.REMEDIATE:
                 # Transition to REMEDIATE (or stay)
                 state.current_stage = LearningStage.REMEDIATE
                 
                 # ANALYZE MISCONCEPTION
                 if metadata:
                     try:
                         analysis = self.ai_service.analyze_misconception(
                             metadata.get('question'),
                             metadata.get('user_answer'),
                             metadata.get('correct_answer'),
                             metadata.get('subject')
                         )
                         state.last_feedback = json.dumps(analysis)
                         feedback = feedback_prefix + analysis.get('analysis', "Review the material.")
                     except Exception as e:
                         print(f"AI Analysis Failed: {e}")
                         feedback = feedback_prefix + "Let's review. Watch this key segment before trying again."
                 else:
                     feedback = feedback_prefix + "Let's review. Watch this key segment before trying again."
            else:
                 # Failed while in Understand? Unlikely unless quiz.
                 feedback = "Keep going."
                
        db.session.commit()
        return {"stage": state.current_stage.value, "feedback": feedback}

    def complete_remediation(self, user_id, intent_id):
        """Call this when user finishes watching the remediation video"""
        state = self.get_current_stage(user_id, intent_id)
        if state.current_stage == LearningStage.REMEDIATE:
            state.current_stage = LearningStage.APPLY
            db.session.commit()
            return True
        return False

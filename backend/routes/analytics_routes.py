from flask import Blueprint, request, jsonify
from app import db
from models import User, ActivityResult, UserTopicMastery, LearningLoopState, DistractionLog
from utils.auth import token_required
from datetime import datetime, timedelta
import sqlalchemy as sa

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/health', methods=['GET'])
@token_required
def get_learning_health():
    """
    Calculates aggregated Learning Health Scores:
    1. Consistency: Based on recent activity streak/volume.
    2. Focus: Based on violation_count in activities.
    3. Resilience: Based on retry success rate.
    4. Stability: Based on topic proficiency average.
    """
    user_id = request.current_user_id
    
    # 1. CONSISTENCY
    # Simple metric: Activity in last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_activity_count = ActivityResult.query.filter(
        ActivityResult.user_id == user_id, 
        ActivityResult.created_at >= seven_days_ago
    ).count()
    
    # Cap at 20 activities per week for 100% score
    consistency_score = min(100, (recent_activity_count / 20) * 100)
    
    # 2. FOCUS
    # Average violations per activity (last 50)
    recent_results = ActivityResult.query.filter_by(user_id=user_id)\
        .order_by(ActivityResult.created_at.desc())\
        .limit(50).all()
        
    if recent_results:
        total_violations = sum(r.focus_violations for r in recent_results if r.focus_violations is not None)
        avg_violations = total_violations / len(recent_results)
        # 1 violation drops score by 10 points
        focus_score = max(0, 100 - (avg_violations * 10))
    else:
        focus_score = 100 # Default if no activity
        
    # 3. RESILIENCE
    # Check loops where user failed (REMEDIATE) then Mastered
    # This is hard to calculate efficiently without complex query. 
    # Approx: (Successful Retries / Total Failures)
    # Using UserTopicMastery success_rate is simpler but different meaning.
    # Let's use simple accuracy for now as proxy, or 'attempts' from LoopState.
    
    loop_states = LearningLoopState.query.filter_by(user_id=user_id).all()
    persistence_points = 0
    total_loops = 0
    for state in loop_states:
        total_loops += 1
        if state.attempts > 1 and state.current_stage == 'MASTERED':
            persistence_points += 1 # Bonus for sticking with it
        elif state.attempts > 5:
            persistence_points -= 0.5 # Penalty for brute forcing?
            
    # Normalize
    if total_loops > 0:
        resilience_score = 70 + (persistence_points * 5) # Base 70
        resilience_score = min(100, max(0, resilience_score))
    else:
        resilience_score = 80 # Default
        
    # 4. STABILITY
    # Avg proficiency of started topics
    mastery_records = UserTopicMastery.query.filter_by(user_id=user_id).all()
    if mastery_records:
        avg_prof = sum(m.proficiency_score for m in mastery_records) / len(mastery_records)
        stability_score = avg_prof
    else:
        stability_score = 0
        
    # Health Signal
    avg_health = (consistency_score + focus_score + resilience_score + stability_score) / 4
    
    return jsonify({
        'overall_health': round(avg_health, 1),
        'metrics': {
            'consistency': round(consistency_score, 1),
            'focus': round(focus_score, 1),
            'resilience': round(resilience_score, 1),
            'stability': round(stability_score, 1)
        },
        'insights': [
            "Keep your focus streak alive!" if focus_score > 90 else "Try to minimize tab switching.",
            "Great consistency!" if consistency_score > 80 else "Try to practice daily."
        ]
    }), 200

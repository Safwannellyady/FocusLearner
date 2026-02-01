"""
FocusLearner Pro - Analytics Service
Service for calculating learning analytics and metrics
"""

import logging
from models import db, FocusSession
from sqlalchemy import func
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AnalyticsService:
    def get_weekly_focus_trends(self, user_id):
        """Aggregate focus time per day for the last 7 days"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=7)
            
            # Calculate daily totals (in minutes)
            sessions = FocusSession.query.filter(
                FocusSession.user_id == user_id,
                FocusSession.started_at >= start_date
            ).all()
            
            # Initialize daily trends for the last 7 days
            daily_trends = {}
            for i in range(7):
                date_key = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
                daily_trends[date_key] = 0
            
            for session in sessions:
                date_key = session.started_at.strftime('%Y-%m-%d')
                if date_key in daily_trends:
                    # Estimate duration if ended_at is present, else ignore or account partial
                    if session.ended_at:
                        duration = (session.ended_at - session.started_at).total_seconds() / 60
                    elif session.current_timestamp:
                        duration = session.current_timestamp / 60  # Approximation from video progress
                    else:
                        duration = 0
                    
                    daily_trends[date_key] += round(duration, 1)
            
            result = [{'date': k, 'minutes': v} for k, v in sorted(daily_trends.items())]
            
            logger.debug(f'Weekly focus trends calculated for user {user_id}: {len(sessions)} sessions')
            
            return result
            
        except Exception as e:
            logger.error(f'Error calculating weekly focus trends: {e}', exc_info=True)
            return []

    def get_subject_distribution(self, user_id):
        """Aggregate focus time by subject"""
        try:
            results = db.session.query(
                FocusSession.subject_focus,
                func.count(FocusSession.id).label('session_count'),
                func.sum(
                    func.extract('epoch', FocusSession.ended_at - FocusSession.started_at) / 60
                ).label('total_minutes')
            ).filter_by(user_id=user_id)\
            .group_by(FocusSession.subject_focus)\
            .all()
            
            # Return both session count and total minutes
            distribution = []
            for r in results:
                distribution.append({
                    'name': r[0] or 'Unknown',
                    'session_count': r[1] or 0,
                    'total_minutes': round(r[2] or 0, 1)
                })
            
            logger.debug(f'Subject distribution calculated for user {user_id}: {len(distribution)} subjects')
            
            return distribution
            
        except Exception as e:
            logger.error(f'Error calculating subject distribution: {e}', exc_info=True)
            return []

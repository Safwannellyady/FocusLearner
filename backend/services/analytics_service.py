
from models import db, FocusSession
from sqlalchemy import func
from datetime import datetime, timedelta

class AnalyticsService:
    def get_weekly_focus_trends(self, user_id):
        """Aggregate focus time per day for the last 7 days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        # Calculate daily totals (in minutes)
        sessions = FocusSession.query.filter(
            FocusSession.user_id == user_id,
            FocusSession.started_at >= start_date
        ).all()
        
        daily_trends = { (start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(8) }
        
        for session in sessions:
            date_key = session.started_at.strftime('%Y-%m-%d')
            if date_key in daily_trends:
                # Estimate duration if ended_at is present, else ignore or account partial
                if session.ended_at:
                    duration = (session.ended_at - session.started_at).total_seconds() / 60
                elif session.current_timestamp:
                    duration = session.current_timestamp / 60 # Approximation from video progress
                else:
                    duration = 0
                
                daily_trends[date_key] += round(duration, 1)
                
        return [ {'date': k, 'minutes': v} for k, v in daily_trends.items() ]

    def get_subject_distribution(self, user_id):
        """Aggregate focus time by subject"""
        results = db.session.query(
            FocusSession.subject_focus,
            func.count(FocusSession.id)
        ).filter_by(user_id=user_id)\
        .group_by(FocusSession.subject_focus)\
        .all()
        
        # Just returning count of sessions for now as a proxy for 'interest'
        return [ {'name': r[0], 'value': r[1]} for r in results ]

    def get_user_totals(self, user_id):
        """Calculate total sessions, hours, XP, and streak for user"""
        from models import User, ActivityResult, GameProgress
        
        user = User.query.get(user_id)
        streak_days = user.streak_days if user else 0
        
        # Total sessions
        total_sessions = FocusSession.query.filter_by(user_id=user_id).count()
        
        # Total hours
        sessions = FocusSession.query.filter_by(user_id=user_id).all()
        total_seconds = 0
        for s in sessions:
            if s.ended_at and s.started_at:
                total_seconds += (s.ended_at - s.started_at).total_seconds()
            elif s.current_timestamp:
                total_seconds += s.current_timestamp
        total_hours = round(total_seconds / 3600, 1)
        
        # Total XP
        activity_xp = db.session.query(func.sum(ActivityResult.xp_earned)).filter_by(user_id=user_id).scalar() or 0
        game_xp = db.session.query(func.sum(GameProgress.mastery_points)).filter_by(user_id=user_id).scalar() or 0
        total_xp = int(activity_xp + game_xp)
        
        # Today's XP
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_activity_xp = db.session.query(func.sum(ActivityResult.xp_earned)).filter(
            ActivityResult.user_id == user_id,
            ActivityResult.created_at >= today_start
        ).scalar() or 0
        today_xp = int(today_activity_xp)
        
        return {
            'streak_days': streak_days,
            'total_hours': total_hours,
            'total_sessions': total_sessions,
            'total_xp': total_xp,
            'today_xp': today_xp
        }


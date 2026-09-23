
"""Analytics Service for FocusLearner Pro.

Consistency rules (audit finding #6):
- "Completed" means status='completed', the status the unlock/end flow sets.
  Drafts, abandoned and still-active rows are excluded from every aggregate.
- Session duration has one canonical definition: elapsed_seconds when present,
  else bounded ended_at - started_at, else 0. See _session_minutes().
- Session XP has one source of truth: FocusSession.xp_earned, computed by the
  backend at completion with the canonical tiers in utils.xp.
"""

from models import db, FocusSession
from sqlalchemy import func
from datetime import datetime, timedelta

# Guard against clock skew / bad data inflating dashboards.
_MAX_SESSION_MINUTES = 24 * 60


def _session_minutes(session):
    """Canonical duration (minutes) for one focus session row."""
    seconds = session.elapsed_seconds or 0
    if not seconds and session.ended_at and session.started_at:
        seconds = (session.ended_at - session.started_at).total_seconds()
    return max(0.0, min(_MAX_SESSION_MINUTES, float(seconds or 0) / 60.0))


def _completed(user_id):
    """Base query: completed focus sessions only (status='completed')."""
    return FocusSession.query.filter_by(user_id=user_id, status='completed')


class AnalyticsService:
    def get_weekly_focus_trends(self, user_id):
        """Aggregate focus time per day for the last 7 days (completed sessions only)."""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        sessions = _completed(user_id).filter(
            FocusSession.started_at >= start_date
        ).all()

        daily_trends = {(start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(8)}

        for session in sessions:
            date_key = session.started_at.strftime('%Y-%m-%d')
            if date_key in daily_trends:
                daily_trends[date_key] += round(_session_minutes(session), 1)

        return [{'date': k, 'minutes': v} for k, v in daily_trends.items()]

    def get_subject_distribution(self, user_id):
        """Aggregate actual focus minutes by subject (completed sessions only)."""
        sessions = _completed(user_id).all()

        minutes_by_subject = {}
        for s in sessions:
            name = s.subject_focus or 'General'
            minutes_by_subject[name] = minutes_by_subject.get(name, 0) + _session_minutes(s)

        return [{'name': name, 'value': round(minutes, 1)}
                for name, minutes in sorted(minutes_by_subject.items(), key=lambda kv: -kv[1])]

    def get_user_totals(self, user_id):
        """Calculate total sessions, hours, XP, and streak for user.

        Every figure here is derived from completed sessions (and game
        progress), so the Analytics page agrees with the Completed tab in
        My Courses and with the XP shown on session cards.
        """
        from models import User, ActivityResult, GameProgress

        user = User.query.get(user_id)
        streak_days = user.streak_days if user else 0

        completed = _completed(user_id).all()
        total_sessions = len(completed)
        total_minutes = sum(_session_minutes(s) for s in completed)
        total_hours = round(total_minutes / 60, 1)

        # Single source of truth: XP the backend stored on each completed
        # session, plus game XP. (ActivityResult rows are game-challenge
        # results; lecture/focus XP is no longer written there.)
        session_xp = sum(s.xp_earned or 0 for s in completed)
        game_xp = db.session.query(func.sum(GameProgress.mastery_points)).filter_by(user_id=user_id).scalar() or 0
        total_xp = int(session_xp + game_xp)

        # Today's XP (sessions completed today + game XP earned today)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_session_xp = sum(s.xp_earned or 0 for s in completed if s.ended_at and s.ended_at >= today_start)
        today_game_xp = db.session.query(func.sum(ActivityResult.xp_earned)).filter(
            ActivityResult.user_id == user_id,
            ActivityResult.created_at >= today_start
        ).scalar() or 0
        today_xp = int(today_session_xp + today_game_xp)

        return {
            'streak_days': streak_days,
            'total_hours': total_hours,
            'total_sessions': total_sessions,
            'total_xp': total_xp,
            'today_xp': today_xp
        }

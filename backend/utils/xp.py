"""Canonical XP computation for focus sessions and lectures.

This module is the single source of truth for session XP. Every surface that
displays XP for a session (My Courses cards, Analytics, dashboards) must use
the value the backend stores in FocusSession.xp_earned at completion time,
which is computed here. Frontend components must NOT invent their own XP
formulas; if xp_earned is missing for a legacy row, they may show 0 rather
than a locally-computed estimate.
"""


def calculate_session_xp(elapsed_seconds):
    """Compute XP for a completed focus session from its elapsed seconds.

    Tiers (by effective minutes):
        >= 90 min -> 650 XP
        >= 60 min -> 400 XP
        >= 45 min -> 250 XP
        >= 30 min -> 150 XP
        otherwise -> 50 XP (participation)
    """
    try:
        seconds = max(0, int(elapsed_seconds or 0))
    except (TypeError, ValueError):
        seconds = 0
    minutes = seconds / 60.0

    if minutes >= 90:
        return 650
    if minutes >= 60:
        return 400
    if minutes >= 45:
        return 250
    if minutes >= 30:
        return 150
    return 50

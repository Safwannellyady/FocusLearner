"""
FocusLearner Pro - Game Service
Business logic for gamification system
"""
from models import db, GameProgress, User
from datetime import datetime

class GameService:
    GAME_MODULES = {
        'focus_session': {
            'name': 'Deep Focus',
            'xp_per_unit': 10,  # 10 XP per minute
            'levels': [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
        },
        'video_completion': {
            'name': 'Content Mastery',
            'xp_per_unit': 50,  # 50 XP per video
            'levels': [0, 50, 150, 300, 500, 800, 1200]
        },
        'quiz': {
            'name': 'Knowledge Check',
            'xp_per_unit': 20, # 20 XP per correct answer essentially (passed in score)
            'levels': [0, 100, 250, 500, 800, 1200]
        }
    }

    def get_game_module(self, module_id):
        """Get module configuration"""
        return self.GAME_MODULES.get(module_id)

    def submit_game_result(self, user_id, module_id, score, level, subject_focus):
        """
        Process a game action and update XP/Level.
        For 'focus_session', score = minutes focused.
        For 'video_completion', score = 1 (just completion count essentially, or could be 1 per video).
        For 'quiz', score = actual score.
        """
        
        module_config = self.GAME_MODULES.get(module_id)
        if not module_config:
            return None

        # Calculate XP gained
        xp_gained = score * module_config['xp_per_unit']

        # Get or create progress record
        progress = GameProgress.query.filter_by(
            user_id=user_id, 
            game_module=module_id, 
            subject_focus=subject_focus
        ).first()

        if not progress:
            progress = GameProgress(
                user_id=user_id,
                game_module=module_id,
                subject_focus=subject_focus,
                score=0,
                level=1,
                mastery_points=0
            )
            db.session.add(progress)
        
        # Update Stats
        progress.score += score # Accumulate raw score (e.g. total minutes focused)
        progress.mastery_points += xp_gained
        progress.completed_at = datetime.utcnow()

        # Check Level Up
        current_level = progress.level
        level_thresholds = module_config['levels']
        
        # Determine new level based on total mastery points
        new_level = 1
        for i, threshold in enumerate(level_thresholds):
            if progress.mastery_points >= threshold:
                new_level = i + 1
            else:
                break
        
        progress.level = new_level
        
        db.session.commit()
        
        return {
            'module': module_id,
            'xp_gained': xp_gained,
            'total_xp': progress.mastery_points,
            'current_level': progress.level,
            'leveled_up': new_level > current_level,
            'next_level_threshold': level_thresholds[new_level] if new_level < len(level_thresholds) else None
        }

    def get_user_progress(self, user_id, module_id=None):
        query = GameProgress.query.filter_by(user_id=user_id)
        if module_id:
            query = query.filter_by(game_module=module_id)
            
        return [p.to_dict() for p in query.all()]

    def get_leaderboard(self, module_id, limit=10):
        # Join with User to get usernames
        results = db.session.query(GameProgress, User.username)\
            .join(User)\
            .filter(GameProgress.game_module == module_id)\
            .order_by(GameProgress.mastery_points.desc())\
            .limit(limit)\
            .all()
            
        return [{
            'username': r[1],
            'level': r[0].level,
            'xp': r[0].mastery_points,
            'subject': r[0].subject_focus
        } for r in results]

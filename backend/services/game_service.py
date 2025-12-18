"""
FocusLearner Pro - Game Service
Service for managing gamified learning challenges
"""

from typing import Dict, List, Optional
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from models import GameProgress, db


class GameService:
    """Service for managing game modules and progress tracking"""
    
    GAME_MODULES = {
        'kcl_challenge': {
            'name': 'Kirchhoff\'s Current Law Challenge',
            'description': 'Solve circuit problems using KCL principles',
            'subject_focus': 'ECE/Network Analysis',
            'max_level': 5
        }
    }
    
    def __init__(self):
        pass
    
    def get_game_module(self, module_id: str) -> Optional[Dict]:
        """Get game module information"""
        return self.GAME_MODULES.get(module_id)
    
    def get_all_modules(self) -> List[Dict]:
        """Get all available game modules"""
        return list(self.GAME_MODULES.values())
    
    def submit_game_result(self, user_id: int, module_id: str, 
                          score: int, level: int, subject_focus: str) -> Dict:
        """
        Submit game result and update progress.
        
        Args:
            user_id: User ID
            module_id: Game module identifier
            score: Score achieved
            level: Level completed
            subject_focus: Subject focus for this game
        
        Returns:
            Updated game progress dictionary
        """
        # Calculate mastery points (score * level multiplier)
        mastery_points = score * level
        
        # Get or create game progress
        progress = GameProgress.query.filter_by(
            user_id=user_id,
            game_module=module_id
        ).first()
        
        if progress:
            # Update existing progress
            if score > progress.score:
                progress.score = score
            if level > progress.level:
                progress.level = level
            progress.mastery_points += mastery_points
            if level >= self.GAME_MODULES[module_id]['max_level']:
                progress.completed_at = datetime.utcnow()
        else:
            # Create new progress
            progress = GameProgress(
                user_id=user_id,
                game_module=module_id,
                subject_focus=subject_focus,
                score=score,
                level=level,
                mastery_points=mastery_points
            )
            if level >= self.GAME_MODULES[module_id]['max_level']:
                progress.completed_at = datetime.utcnow()
            db.session.add(progress)
        
        db.session.commit()
        
        return progress.to_dict()
    
    def get_user_progress(self, user_id: int, module_id: Optional[str] = None) -> List[Dict]:
        """
        Get user's game progress.
        
        Args:
            user_id: User ID
            module_id: Optional specific module ID
        
        Returns:
            List of game progress dictionaries
        """
        query = GameProgress.query.filter_by(user_id=user_id)
        
        if module_id:
            query = query.filter_by(game_module=module_id)
        
        progress_list = query.all()
        return [p.to_dict() for p in progress_list]
    
    def get_leaderboard(self, module_id: str, limit: int = 10) -> List[Dict]:
        """
        Get leaderboard for a game module.
        
        Args:
            module_id: Game module identifier
            limit: Number of top players to return
        
        Returns:
            List of top players with scores
        """
        progress_list = GameProgress.query.filter_by(
            game_module=module_id
        ).order_by(
            GameProgress.mastery_points.desc(),
            GameProgress.score.desc()
        ).limit(limit).all()
        
        leaderboard = []
        for idx, progress in enumerate(progress_list, 1):
            entry = progress.to_dict()
            entry['rank'] = idx
            leaderboard.append(entry)
        
        return leaderboard


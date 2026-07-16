"""
FocusLearner Pro v2.0 - Adaptive Spaced Repetition Service (SuperMemo SM-2)
Calculates optimal memory spacing intervals based on review grades (0-5 quality scale).
"""

from datetime import datetime, timedelta
from models import db, SpacedRepetitionCard

class SRSService:
    @staticmethod
    def calculate_sm2(quality: int, ease_factor: float, interval: int, repetitions: int):
        """
        SuperMemo SM-2 algorithm.
        quality: 0 (total blackout) to 5 (perfect recall)
        """
        if quality < 3:
            # Failed review: reset consecutive correct repetitions and interval
            repetitions = 0
            interval = 1
        else:
            # Successful review
            if repetitions == 0:
                interval = 1
            elif repetitions == 1:
                interval = 6
            else:
                interval = int(round(interval * ease_factor))
            repetitions += 1
            
        # Update Ease Factor (EF)
        # EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if ease_factor < 1.3:
            ease_factor = 1.3
            
        return round(ease_factor, 2), interval, repetitions

    @classmethod
    def process_review(cls, card_id: int, user_id: int, quality: int):
        """Review a card and schedule its next review date"""
        card = SpacedRepetitionCard.query.filter_by(id=card_id, user_id=user_id).first()
        if not card:
            return None
            
        ef, inv, rep = cls.calculate_sm2(
            quality=quality,
            ease_factor=card.ease_factor,
            interval=card.interval,
            repetitions=card.repetitions
        )
        
        card.ease_factor = ef
        card.interval = inv
        card.repetitions = rep
        card.last_reviewed_at = datetime.utcnow()
        card.next_review_at = datetime.utcnow() + timedelta(days=inv)
        
        db.session.commit()
        return card

    @classmethod
    def create_card(cls, user_id: int, subject: str, topic: str, question: str, answer: str):
        """Create a new Spaced Repetition card"""
        card = SpacedRepetitionCard(
            user_id=user_id,
            subject=subject,
            topic=topic,
            question=question,
            answer=answer
        )
        db.session.add(card)
        db.session.commit()
        return card

    @classmethod
    def get_due_cards(cls, user_id: int, limit: int = 20):
        """Retrieve cards due for review today or earlier"""
        now = datetime.utcnow()
        cards = SpacedRepetitionCard.query.filter(
            SpacedRepetitionCard.user_id == user_id,
            SpacedRepetitionCard.next_review_at <= now
        ).order_by(SpacedRepetitionCard.next_review_at.asc()).limit(limit).all()
        return cards

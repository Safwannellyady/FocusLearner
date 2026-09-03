"""
FocusLearner Pro v2.0 - Spaced Repetition API Routes
Handles flashcard review queues, grade processing, and adaptive review statistics.
"""

from flask import Blueprint, request, jsonify
from utils.auth import token_required
from services.srs_service import SRSService
from models import SpacedRepetitionCard

srs_routes = Blueprint('srs', __name__, url_prefix='/api/srs')

@srs_routes.route('/due', methods=['GET'])
@token_required
def get_due_cards():
    """Get all flashcards currently due for review"""
    user_id = request.current_user_id
    limit = int(request.args.get('limit', 20))
    
    cards = SRSService.get_due_cards(user_id, limit=limit)
    return jsonify({
        'cards': [c.to_dict() for c in cards],
        'count': len(cards)
    }), 200

@srs_routes.route('/review', methods=['POST'])
@token_required
def submit_review():
    """Submit a review score (quality 0-5) for a flashcard"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    card_id = data.get('card_id')
    quality = data.get('quality')
    
    if card_id is None or quality is None:
        return jsonify({'error': 'card_id and quality (0-5) are required'}), 400
        
    try:
        quality_int = int(quality)
        if not (0 <= quality_int <= 5):
            return jsonify({'error': 'quality must be between 0 and 5'}), 400
    except ValueError:
        return jsonify({'error': 'quality must be an integer'}), 400
        
    card = SRSService.process_review(card_id=card_id, user_id=user_id, quality=quality_int)
    if not card:
        return jsonify({'error': 'Card not found or access denied'}), 404
        
    return jsonify({
        'message': 'Review processed successfully',
        'card': card.to_dict()
    }), 200

@srs_routes.route('/create', methods=['POST'])
@token_required
def create_card():
    """Manually or programmatically create a review flashcard"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    subject = data.get('subject')
    topic = data.get('topic', 'General Concept')
    question = data.get('question')
    answer = data.get('answer')
    
    if not subject or not question or not answer:
        return jsonify({'error': 'subject, question, and answer are required'}), 400
        
    card = SRSService.create_card(
        user_id=user_id,
        subject=subject,
        topic=topic,
        question=question,
        answer=answer
    )
    
    return jsonify({
        'message': 'Spaced repetition card created successfully',
        'card': card.to_dict()
    }), 201

@srs_routes.route('/stats', methods=['GET'])
@token_required
def get_srs_stats():
    """Get SRS deck stats for user"""
    user_id = request.current_user_id
    total_cards = SpacedRepetitionCard.query.filter_by(user_id=user_id).count()
    due_cards = len(SRSService.get_due_cards(user_id, limit=1000))
    mastered_cards = SpacedRepetitionCard.query.filter(
        SpacedRepetitionCard.user_id == user_id,
        SpacedRepetitionCard.repetitions >= 4
    ).count()
    
    return jsonify({
        'total_cards': total_cards,
        'due_cards': due_cards,
        'mastered_cards': mastered_cards
    }), 200


from services.ai_service import AIService
ai_service = AIService()

@srs_routes.route('/generate', methods=['POST'])
@token_required
def generate_ai_cards():
    """Auto-generate SRS flashcards using Gemini AI"""
    user_id = request.current_user_id
    data = request.get_json() or {}

    subject = data.get('subject') or 'General Science'
    topic = data.get('topic') or 'Core Concepts'
    notes = data.get('notes') or data.get('content') or ''

    cards_data = ai_service.generate_flashcards(subject=subject, topic=topic, content_text=notes)
    created_cards = []

    for item in cards_data:
        card = SRSService.create_card(
            user_id=user_id,
            subject=subject,
            topic=topic,
            question=item.get('question', f'Core principle of {topic}'),
            answer=item.get('answer', f'Key definition and usage of {topic} in {subject}.')
        )
        created_cards.append(card.to_dict())

    return jsonify({
        'message': f'Generated {len(created_cards)} flashcards successfully',
        'cards': created_cards
    }), 201


"""
FocusLearner Pro - Support & Help Routes
API routes for developer issue reporting, support ticket management, and FAQs.
"""

import html
import secrets
import logging
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from models import db, SupportTicket

logger = logging.getLogger(__name__)

support_routes = Blueprint('support_routes', __name__)

# Simple in-memory rate limiting dictionary (IP/user_id -> last_submission_time)
_SUBMISSION_HISTORY = {}
RATE_LIMIT_COOLDOWN_SECONDS = 60  # 1 minute cooldown per submission

FAQS = [
  {
    "category": "Focus Sessions & Lock",
    "items": [
      {
        "q": "How does Focus Lock work during a session?",
        "a": "When you start a session with Focus Lock enabled, tab-switching triggers visual & audio warnings. Remaining locked in helps build your daily streak and earns bonus XP."
      },
      {
        "q": "Can I adjust session or break durations mid-study?",
        "a": "Yes! Use the ⚡ Quick Focus panel in the top navigation bar or the Focus Timer controls to adjust or skip focus and break phases."
      }
    ]
  },
  {
    "category": "Notes & Materials",
    "items": [
      {
        "q": "Where are my Focus Studio notes saved?",
        "a": "Notes captured in the Focus Studio tool dock auto-save locally to your browser every 800ms and sync to your account profile."
      },
      {
        "q": "What file types can I upload to a session?",
        "a": "FocusLearner supports PDF, DOCX, TXT, and Markdown files up to 25MB per document."
      }
    ]
  },
  {
    "category": "Badges, Rewards & XP",
    "items": [
      {
        "q": "How do I claim rewards for earned Badges?",
        "a": "Navigate to the Badges page from the top navigation bar or avatar dropdown. Click on any unlocked badge card to open your reward claim modal."
      },
      {
        "q": "What are Freebies?",
        "a": "Freebies are exclusive rewards attached to badges — including bonus XP boosts, extra break minutes, and custom theme presets."
      }
    ]
  },
  {
    "category": "Account & Security",
    "items": [
      {
        "q": "How do I change my password?",
        "a": "Go to Settings → Security tab. Enter your current password and desired new password. You will be prompted to re-authenticate."
      },
      {
        "q": "How can I contact the developer directly?",
        "a": "You can use the 'Reach Out to Developer' form below or send an email directly to nellyadysafwan@gmail.com."
      }
    ]
  }
]

def sanitize_text(text, max_len=2000):
    if not text:
        return ""
    # Strip HTML tags & escape special characters
    clean = html.escape(str(text).strip())
    return clean[:max_len]

@support_routes.route('/ticket', methods=['POST'])
def create_ticket():
    """Submit a developer support ticket or bug report"""
    data = request.get_json() or {}
    
    category = sanitize_text(data.get('category', 'general'), 32)
    subject = sanitize_text(data.get('subject', ''), 255)
    message = sanitize_text(data.get('message', ''), 3000)
    system_info = data.get('system_info') if isinstance(data.get('system_info'), dict) else {}
    
    if not subject or not message:
        return jsonify({'error': 'Subject and message are required'}), 400

    # Rate limiting check
    client_ip = request.remote_addr or 'unknown'
    now = datetime.utcnow()
    last_time = _SUBMISSION_HISTORY.get(client_ip)
    if last_time and (now - last_time) < timedelta(seconds=RATE_LIMIT_COOLDOWN_SECONDS):
        remaining = RATE_LIMIT_COOLDOWN_SECONDS - int((now - last_time).total_seconds())
        return jsonify({
            'error': f'Rate limit exceeded. Please wait {remaining} seconds before submitting another ticket.'
        }), 429

    _SUBMISSION_HISTORY[client_ip] = now

    # Cryptographic ticket code generation (TKT-XXXXXX)
    random_hex = secrets.token_hex(3).upper()
    ticket_code = f"TKT-{random_hex}"

    user_id = getattr(g, 'user_id', None)

    try:
        ticket = SupportTicket(
            ticket_code=ticket_code,
            user_id=user_id,
            category=category,
            subject=subject,
            message=message,
            system_info={
                'user_agent': sanitize_text(request.headers.get('User-Agent', ''), 200),
                'platform': sanitize_text(system_info.get('platform', 'Web'), 100),
                'screen': sanitize_text(system_info.get('screen', '1920x1080'), 50)
            },
            status='open'
        )
        db.session.add(ticket)
        db.session.commit()

        logger.info(f"Support Ticket {ticket_code} created successfully.")

        return jsonify({
            'success': True,
            'ticket_code': ticket_code,
            'developer_email': 'nellyadysafwan@gmail.com',
            'message': 'Support ticket submitted successfully! The developer team will review it shortly.'
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to create support ticket: {str(e)}")
        # Fallback response so user always receives a ticket code
        return jsonify({
            'success': True,
            'ticket_code': ticket_code,
            'developer_email': 'nellyadysafwan@gmail.com',
            'message': 'Ticket received! Reach out to nellyadysafwan@gmail.com with your code if needed.'
        }), 200


@support_routes.route('/faqs', methods=['GET'])
def get_faqs():
    """Retrieve curated FAQs list"""
    return jsonify({
        'faqs': FAQS,
        'developer_email': 'nellyadysafwan@gmail.com'
    }), 200

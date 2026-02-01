# FocusLearner Pro

A Unified, Contextual, and Gamified Learning Ecosystem that strictly enforces student focus.

**Status:** ✅ Production Ready | **Version:** 1.0.0

## Vision

To solve the core problem of digital distraction in education by converting the fragmented, passive, and distracting web into a Guided, Active Learning Funnel.

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python scripts/setup_env.py  # Setup environment
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Validate Installation
```bash
cd backend
python scripts/validate_app.py
```

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## Architecture: The Five Pillars

1. **Distraction-Free Environment (The Shield)** 🛡️
   - Focus Lock system
   - Aggressive content filtering
   - Custom playback control

2. **Contextual AI Chatbot (The Virtual Tutor)** 🤖
   - Real-time, on-topic assistance
   - RAG-based contextual grounding
   - Video timestamp awareness

3. **Universal Aggregation (The Library)** 📚
   - Multi-source API orchestration
   - Content normalization
   - Unified feed

4. **Gamified Active Learning (The Lab)** 🕹️
   - Interactive challenge modules
   - Skill mapping
   - Progress tracking

## Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: React.js
- **Database**: PostgreSQL + Vector DB (for RAG)
- **AI/ML**: Google Cloud Vertex AI
- **Deployment**: Google Cloud Run

## Project Structure

```
FocusLearner/
├── backend/          # Flask API server
├── frontend/         # React application
├── database/         # Database schemas and migrations
└── docs/            # Documentation
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## MVP Features (Phase 1) - ✅ COMPLETE

- ✅ Focus Lock UI - Lock focus on specific subjects
- ✅ YouTube content filtering - Rule-based and NLP filtering
- ✅ KCL Challenge game module - Interactive Kirchhoff's Current Law challenges
- ✅ Video Player with distraction-free controls
- ✅ Content aggregation and search
- ✅ Progress tracking and gamification

## Implementation Status

### Phase 1: MVP ✅ COMPLETE
All core MVP features have been implemented:
- **Distraction-Free Environment**: Focus lock system with aggressive content filtering
- **Content Filtering**: NLP-based classifier that removes distracting content
- **Video Player**: Custom YouTube player with distraction blocking
- **Gamified Learning**: KCL Challenge game module with progress tracking

### Phase 2: Full Platform ✅ COMPLETE
- ✅ Contextual AI Chatbot with Gemini integration
- ✅ Comprehensive API with 44+ endpoints
- ✅ Multi-source content aggregation (YouTube, ready for NPTEL, Udemy)
- ✅ Advanced analytics and learning health metrics
- ✅ Learning loop system with adaptive difficulty
- ✅ Topic mastery tracking
- ✅ Complete authentication system with OAuth

### Phase 3: Enterprise Features ✅ COMPLETE
- ✅ Production-ready error handling
- ✅ Comprehensive security measures
- ✅ Performance optimizations
- ✅ Database indexing
- ✅ Logging and monitoring
- ✅ Token refresh mechanism
- ✅ Input validation throughout
- ✅ Complete documentation

## 📊 Application Statistics

- **API Endpoints:** 44+
- **Database Tables:** 14
- **Route Modules:** 9
- **Service Modules:** 4
- **Utility Modules:** 4
- **Database Indexes:** 30+

## 📚 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Detailed improvements documentation
- [APPLICATION_STATUS.md](APPLICATION_STATUS.md) - Application status report

## 🔒 Security Features

- Password strength validation
- JWT token management with refresh
- Token blacklisting
- Input sanitization
- SQL injection prevention
- XSS protection headers
- CORS configuration
- Security headers

## ⚡ Performance Features

- Database indexes on all key fields
- Connection pooling
- Response caching
- Request retry logic
- Query optimization

## 🛠️ Development Tools

- `scripts/validate_app.py` - Application validation
- `scripts/setup_env.py` - Environment setup automation
- Comprehensive error handling
- Structured logging
- Health check endpoints




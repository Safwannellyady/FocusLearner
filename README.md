# FocusLearner Pro

A Unified, Contextual, and Gamified Learning Ecosystem that strictly enforces student focus.

## Vision

To solve the core problem of digital distraction in education by converting the fragmented, passive, and distracting web into a Guided, Active Learning Funnel.

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
- **Database**: PostgreSQL + Vector DB (Pinecone for RAG)
- **AI/ML**: Google Cloud Vertex AI, sentence-transformers, scikit-learn
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

### Phase 1: MVP ✅
All core MVP features have been implemented:
- **Distraction-Free Environment**: Focus lock system with aggressive content filtering
- **Content Filtering**: NLP-based classifier that removes distracting content
- **Video Player**: Custom YouTube player with distraction blocking
- **Gamified Learning**: KCL Challenge game module with progress tracking

### Phase 2: Full Platform (In Progress)
- ✅ Contextual AI Chatbot with RAG (Pinecone integration)
- ✅ Vector Database integration (Pinecone with sentence-transformers)
- ✅ Multi-source content aggregation (NPTEL, Udemy services)
- ✅ Advanced ML-based content classification (scikit-learn)
- ✅ Topic classification service with Learning Intent taxonomy
- ✅ Timestamp-aware RAG retrieval for video context
- ✅ Source citation support in AI responses




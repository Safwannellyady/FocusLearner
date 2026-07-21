# FocusLearner Pro - Setup Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- (Optional) YouTube API Key for production content fetching
- (Optional) Pinecone API Key for RAG features
- (Optional) Google Cloud Vertex AI / Gemini API Key for AI features
- (Optional) Udemy API Key for Udemy content integration

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   - Copy `env.example` to `.env` in the project root
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - (Optional) Add `YOUTUBE_API_KEY` for production
   - (Optional) Add `GEMINI_API_KEY` for AI chat features
   - (Optional) Add `PINECONE_API_KEY` for RAG/vector database features
   - (Optional) Add `UDEMY_API_KEY` for Udemy content integration

6. **Initialize database:**
   ```bash
   # Make sure PostgreSQL is running
   # Create database (in PostgreSQL):
   # CREATE DATABASE focuslearner;
   
   # Run the app to create tables
   python app.py
   ```

7. **Start the backend server:**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**
   - Create `.env` file in `frontend/` directory
   - Add `REACT_APP_API_URL=http://localhost:5000/api` if different from default

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## Testing the MVP

1. **Start both servers:**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

2. **Test Focus Lock:**
   - Navigate to `/focus`
   - Select a subject focus (e.g., "ECE/Network Analysis")
   - Click "Lock Focus"

3. **Test Video Player:**
   - After locking focus, you'll be redirected to the video player
   - Search for educational content
   - Select a video to watch
   - Notice the filtered content library

4. **Test KCL Challenge:**
   - Navigate to `/games`
   - Click "Play Game" on the KCL Challenge
   - Solve circuit problems using Kirchhoff's Current Law
   - Track your progress and mastery points

## Project Structure

```
FocusLearner/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API route blueprints
│   │   ├── focus_routes.py
│   │   ├── content_routes.py
│   │   └── game_routes.py
│   └── services/              # Business logic services
│       ├── content_filter.py
│       ├── youtube_service.py
│       └── game_service.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── FocusLock.js
│   │   │   ├── VideoPlayer.js
│   │   │   ├── GameLab.js
│   │   │   └── games/
│   │   │       └── KCLChallenge.js
│   │   ├── services/          # API client
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── README.md
└── SETUP.md
```

## API Endpoints

### Focus Session
- `POST /api/focus/lock` - Lock a focus session
- `POST /api/focus/unlock` - Unlock current session
- `GET /api/focus/current` - Get current active session
- `POST /api/focus/update-video` - Update current video
- `GET /api/focus/content` - Get filtered content

### Content
- `GET /api/content/search` - Search for content
- `POST /api/content/filter` - Filter content item
- `GET /api/content/transcript/<video_id>` - Get video transcript

### Games
- `GET /api/game/modules` - Get all game modules
- `GET /api/game/modules/<module_id>` - Get module info
- `POST /api/game/submit` - Submit game result
- `GET /api/game/progress` - Get user progress
- `GET /api/game/leaderboard/<module_id>` - Get leaderboard

## Next Steps (Phase 2)

Phase 2 features have been implemented. The following new services are available:

### New Services

- **Vector Service** (`backend/services/vector_service.py`): Pinecone integration for transcript embedding and similarity search
- **NPTEL Service** (`backend/services/nptel_service.py`): NPTEL course content aggregation
- **Udemy Service** (`backend/services/udemy_service.py`): Udemy course content aggregation
- **Content Aggregator** (`backend/services/content_aggregator.py`): Unified content search across multiple sources
- **Topic Classifier** (`backend/services/topic_classifier.py`): Automatic topic classification and tagging
- **Enhanced Content Filter** (`backend/services/content_filter.py`): ML-based content classification with scikit-learn

### New API Endpoints

- `POST /api/chat/send` - Send message to AI Tutor with RAG support (now includes timestamp parameter)
- `POST /api/chat/reindex` - Manually trigger transcript re-indexing for a video

### Configuration

Add the following to your `.env` file for Phase 2 features:

```bash
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Vector Database Configuration (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=focuslearner-transcripts
PINECONE_DIMENSION=384

# Embedding Configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# Udemy API (Optional)
UDEMY_API_KEY=your_udemy_api_key
```

### Training ML Models

To train custom ML models for content filtering and topic classification:

```python
from services.content_filter import ContentFilter
from services.topic_classifier import TopicClassifier

# Train content filter
filter_service = ContentFilter()
training_data = [...]  # Your training data
labels = [...]  # 0 for educational, 1 for distracting
filter_service.train_model(training_data, labels)

# Train topic classifier
classifier = TopicClassifier()
training_data = [...]  # Your training data
labels = [...]  # Topic labels
classifier.train_model(training_data, labels)
```

Models will be saved to `backend/models/` directory.

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure all dependencies are installed

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check CORS settings in app.py
- Verify REACT_APP_API_URL in frontend/.env

**Import errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python path and module structure

**Vector database errors:**
- Verify PINECONE_API_KEY is set in .env
- Check Pinecone index exists or will be auto-created
- Ensure network connectivity to Pinecone service

**AI chat not working:**
- Verify GEMINI_API_KEY is set in .env
- Check API key has proper permissions
- Review gemini_error.log for specific error details


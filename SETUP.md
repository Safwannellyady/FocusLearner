# FocusLearner Pro - Setup Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- (Optional) YouTube API Key for production content fetching

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

- Implement RAG-based AI Chatbot with Google Cloud Vertex AI
- Add Vector Database integration (Pinecone) for transcript storage
- Integrate additional content sources (NPTEL, Udemy)
- Enhance NLP filtering with ML models
- Add real-time video timestamp tracking for contextual AI

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


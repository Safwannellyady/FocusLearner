# FocusLearner Pro - Setup Guide

This guide will help you set up and run FocusLearner Pro in your development environment.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher (for frontend)
- PostgreSQL (optional, SQLite is used by default)
- Google API Key (for AI features)
- YouTube API Key (optional, for video search)

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

**Option A: Use Setup Script (Recommended)**
```bash
python scripts/setup_env.py
```

**Option B: Manual Setup**

Create a `.env` file in the `backend` directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///focuslearner_v3.db
GOOGLE_API_KEY=your-google-api-key
YOUTUBE_API_KEY=your-youtube-api-key
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 5. Initialize Database

```bash
python app.py
```

The database tables will be created automatically on first run.

### 6. Run the Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/update-profile
POST /api/auth/change-password
```

### Focus Sessions
```
POST /api/focus/lock
POST /api/focus/unlock
GET  /api/focus/current
POST /api/focus/update-video
GET  /api/focus/content
POST /api/focus/distraction/log
```

### Content
```
GET  /api/content/search
POST /api/content/filter
GET  /api/content/transcript/<video_id>
```

### Games & Activities
```
GET  /api/game/modules
POST /api/game/activity/generate
POST /api/game/activity/submit
GET  /api/game/progress
GET  /api/game/stats
```

### Lectures
```
GET    /api/lectures/
POST   /api/lectures/
GET    /api/lectures/<id>
PUT    /api/lectures/<id>
DELETE /api/lectures/<id>
POST   /api/lectures/quiz/generate
```

### Analytics
```
GET /api/analytics/health
GET /api/focus/analytics/summary
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `development` |
| `FLASK_DEBUG` | Enable debug mode | `True` |
| `SECRET_KEY` | Flask secret key | Required |
| `JWT_SECRET_KEY` | JWT signing key | Required |
| `DATABASE_URL` | Database connection string | `sqlite:///focuslearner_v3.db` |
| `GOOGLE_API_KEY` | Google Gemini API key | Optional |
| `YOUTUBE_API_KEY` | YouTube Data API key | Optional |
| `LOG_LEVEL` | Logging level | `INFO` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### Database Configuration

By default, the application uses SQLite for easy setup. For production, use PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost/focuslearner
```

## Troubleshooting

### Database Connection Issues

1. Check that the database URL is correct
2. Ensure database server is running (for PostgreSQL)
3. Verify database permissions

### API Key Issues

1. Ensure API keys are set in `.env` file
2. Check API key permissions and quotas
3. Verify API keys are not expired

### CORS Issues

1. Check `CORS_ORIGINS` in `.env`
2. Ensure frontend URL matches configured origins
3. Check browser console for CORS errors

### Port Already in Use

If port 5000 is already in use:

1. Change port in `app.py`:
   ```python
   app.run(debug=True, host='0.0.0.0', port=5001)
   ```

2. Update frontend `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   ```

## Development Tips

### Logging

Logs are written to `logs/app.log` in production mode. In development, logs are printed to console.

### Database Migrations

Currently using `db.create_all()`. For production, consider using Alembic for migrations.

### Testing

Run the setup script to verify your environment:
```bash
python scripts/setup_env.py
```

## Production Deployment

1. Set `FLASK_ENV=production`
2. Set `FLASK_DEBUG=False`
3. Use a production WSGI server (Gunicorn, uWSGI)
4. Set up proper database (PostgreSQL)
5. Configure Redis for caching and token blacklisting
6. Set up proper logging and monitoring
7. Use environment variables for all secrets
8. Enable HTTPS
9. Configure proper CORS origins
10. Set up backup strategy

## Support

For issues or questions:
1. Check `IMPROVEMENTS.md` for detailed changes
2. Review error logs in `logs/app.log`
3. Check API health endpoint: `/api/health`

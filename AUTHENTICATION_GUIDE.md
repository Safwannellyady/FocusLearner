# Authentication & User Management Guide

## ✅ **New Features Implemented**

### 1. **User Authentication System**
- ✅ User registration (signup) with email and password
- ✅ User login with JWT token authentication
- ✅ Protected routes (backend and frontend)
- ✅ Password hashing and secure storage
- ✅ Token-based session management

### 2. **User Account Management**
- ✅ User profile with full name, email, username
- ✅ Profile update functionality
- ✅ Password change feature
- ✅ Account activation/deactivation

### 3. **User Preferences System**
- ✅ Preferred subjects (multiple selection)
- ✅ Preferred topics (custom input)
- ✅ Difficulty level (beginner/intermediate/advanced)
- ✅ Learning style (visual/auditory/kinesthetic)
- ✅ Preferences automatically used for content filtering

### 4. **Lecture Management**
- ✅ Create custom lectures
- ✅ Set subject, topic, and description
- ✅ Associate videos with lectures
- ✅ View and manage all lectures
- ✅ Edit and delete lectures

### 5. **Enhanced Dashboard**
- ✅ **Practical Lab Tab**: Video learning based on preferences
- ✅ **Testing Lab Tab**: Practice exercises (placeholder)
- ✅ **Games Tab**: Interactive gamified learning
- ✅ **Exercises Tab**: Problem-solving modules (placeholder)
- ✅ Lecture creation and management
- ✅ User profile access

---

## 🔐 **Authentication Flow**

### Registration Flow:
1. User visits `/signup`
2. Fills in: Full Name, Username, Email, Password
3. System creates account and default preferences
4. User receives JWT token
5. Redirected to `/preferences` to set learning preferences
6. Then redirected to `/dashboard`

### Login Flow:
1. User visits `/login`
2. Enters username/email and password
3. System validates credentials
4. User receives JWT token
5. Redirected to `/dashboard`

### Protected Routes:
- All routes except `/login` and `/signup` require authentication
- Token is stored in `localStorage`
- Token automatically added to API requests
- 401 errors automatically redirect to login

---

## 📋 **API Endpoints**

### Authentication (`/api/auth`)
- `POST /register` - Create new account
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `PUT /update-profile` - Update profile (protected)
- `POST /change-password` - Change password (protected)

### Preferences (`/api/preferences`)
- `GET /` - Get user preferences (protected)
- `PUT /` - Update preferences (protected)

### Lectures (`/api/lectures`)
- `GET /` - Get all user lectures (protected)
- `POST /` - Create new lecture (protected)
- `GET /<id>` - Get specific lecture (protected)
- `PUT /<id>` - Update lecture (protected)
- `DELETE /<id>` - Delete lecture (protected)

### Updated Endpoints (Now Protected):
- All `/api/focus/*` endpoints
- All `/api/game/*` endpoints
- Content search uses user preferences automatically

---

## 🎯 **User Journey**

1. **Sign Up** → Create account
2. **Set Preferences** → Choose subjects, topics, difficulty
3. **Dashboard** → See personalized content
4. **Create Lecture** → Organize learning sessions
5. **Practical Lab** → Watch videos based on preferences
6. **Games** → Play interactive challenges
7. **Testing/Exercises** → Practice and test knowledge

---

## 🔧 **Technical Details**

### Backend:
- JWT token generation and validation
- Password hashing with Werkzeug
- Token expiration: 7 days
- Protected route decorator: `@token_required`
- User preferences stored as JSON in database

### Frontend:
- Token stored in `localStorage`
- Axios interceptors for automatic token injection
- Protected route component
- Automatic redirect on 401 errors
- User context from localStorage

---

## 📝 **Database Models Added**

### User (Updated):
- `password_hash` - Hashed password
- `full_name` - User's full name
- `is_active` - Account status

### UserPreferences (New):
- `preferred_subjects` - JSON array
- `preferred_topics` - JSON array
- `difficulty_level` - String
- `learning_style` - String

### Lecture (New):
- `title` - Lecture name
- `subject` - Subject category
- `topic` - Specific topic
- `description` - Lecture description
- `video_ids` - JSON array of video IDs

---

## 🚀 **Getting Started**

1. **Install new dependency:**
   ```bash
   cd backend
   pip install PyJWT==2.8.0
   ```

2. **Restart backend server** (if running)

3. **Start frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **First Use:**
   - Visit `http://localhost:3000`
   - You'll be redirected to `/login`
   - Click "Sign Up" to create account
   - Set your preferences
   - Start using the dashboard!

---

## 🔒 **Security Features**

- ✅ Passwords are hashed (never stored in plain text)
- ✅ JWT tokens with expiration
- ✅ Protected API endpoints
- ✅ Token validation on every request
- ✅ Automatic logout on token expiration
- ✅ CORS enabled for frontend

---

## 📌 **Notes**

- Old test user system removed - users must register
- All routes now require authentication
- Preferences are optional but recommended
- Content automatically filtered by preferences
- Lectures help organize learning sessions


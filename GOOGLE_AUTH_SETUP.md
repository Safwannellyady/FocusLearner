# Google Authentication Setup Guide

## ✅ **Google OAuth Integration Complete!**

Google Sign-In has been successfully integrated into FocusLearner Pro. Users can now sign in or sign up using their Google accounts.

---

## 🔑 **Configuration**

### Client ID
- **Client ID:** `141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com`
- Already configured in the code

### Environment Variables (Optional)
Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Note:** Client secret is optional for frontend-only OAuth flow.

---

## 🚀 **Features**

### 1. **Google Sign-In Button**
- Available on both Login and Signup pages
- One-click authentication
- Automatic account creation if user doesn't exist
- Seamless integration with existing auth system

### 2. **User Flow**
- **New Users:** Click "Sign in with Google" → Account created → Redirected to preferences
- **Existing Users:** Click "Sign in with Google" → Logged in → Redirected to dashboard

### 3. **Account Creation**
- Username auto-generated from email
- Full name from Google profile
- Email verified automatically
- Default preferences created

---

## 📋 **How It Works**

### Frontend:
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User authorizes the app
4. Access token received
5. Token sent to backend for verification

### Backend:
1. Receives Google access token
2. Verifies token with Google API
3. Gets user info (email, name, etc.)
4. Checks if user exists by email
5. Creates account if new user
6. Generates JWT token
7. Returns token to frontend

---

## 🔧 **Installation**

### Backend Dependencies (Already Installed):
```bash
pip install google-auth==2.23.4
pip install google-auth-oauthlib==1.1.0
pip install google-auth-httplib2==0.1.1
```

### Frontend Dependencies:
```bash
cd frontend
npm install @react-oauth/google
```

---

## 🎯 **API Endpoint**

### POST `/api/auth/google`
**Request:**
```json
{
  "token": "google_access_token_here"
}
```

**Response:**
```json
{
  "message": "Google authentication successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@gmail.com",
    "full_name": "John Doe"
  },
  "is_new_user": true
}
```

---

## 🔒 **Security**

- ✅ Token verification with Google
- ✅ Client ID validation
- ✅ Email verification check
- ✅ Secure JWT token generation
- ✅ No password required for Google users

---

## 📝 **User Experience**

### Login Page:
- Traditional username/password login
- **OR** button with divider
- "Sign in with Google" button

### Signup Page:
- Traditional registration form
- **OR** button with divider
- "Sign up with Google" button

### After Google Login:
- **New users:** Redirected to `/preferences` to set preferences
- **Existing users:** Redirected to `/dashboard` immediately

---

## ⚙️ **Configuration in Google Cloud Console**

If you need to update settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

---

## 🐛 **Troubleshooting**

### "Invalid Google token" error:
- Check if client ID matches
- Verify token hasn't expired
- Ensure Google OAuth is enabled in project

### "Email not provided" error:
- User may have denied email permission
- Check Google OAuth scopes

### Button not appearing:
- Check if `@react-oauth/google` is installed
- Verify GoogleOAuthProvider wraps the app
- Check browser console for errors

---

## ✅ **Testing**

1. **Start backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm install  # If not done already
   npm start
   ```

3. **Test Google Login:**
   - Visit `http://localhost:3000/login`
   - Click "Sign in with Google"
   - Complete Google OAuth flow
   - Should redirect to dashboard

---

## 📌 **Notes**

- Google users don't need passwords
- Username is auto-generated from email
- If email already exists, user is logged in (no duplicate accounts)
- Google profile picture can be stored (future enhancement)
- Works alongside traditional email/password authentication

---

## 🎉 **Ready to Use!**

Google authentication is fully integrated and ready to use. Users can now sign in with their Google accounts for a seamless experience!


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Signup from './components/Signup';
import DashboardNew from './components/DashboardNew';
import LectureDetail from './components/LectureDetail';
import Preferences from './components/Preferences';
import ProtectedRoute from './components/ProtectedRoute';
import FocusLock from './components/FocusLock';
import VideoPlayer from './components/VideoPlayer';
import GameLab from './components/GameLab';
import KCLChallenge from './components/games/KCLChallenge';
import AIChallenge from './components/games/AIChallenge';

const GOOGLE_CLIENT_ID = '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientBG 15s ease infinite',
          minHeight: '100vh',
          '@keyframes gradientBG': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
      },
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lecture/:id"
              element={
                <ProtectedRoute>
                  <LectureDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <Preferences />
                </ProtectedRoute>
              }
            />
            <Route
              path="/focus"
              element={
                <ProtectedRoute>
                  <FocusLock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/player"
              element={
                <ProtectedRoute>
                  <VideoPlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <GameLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/kcl"
              element={
                <ProtectedRoute>
                  <KCLChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/ai-challenge"
              element={
                <ProtectedRoute>
                  <AIChallenge />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


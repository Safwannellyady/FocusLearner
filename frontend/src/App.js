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
import LandingPage from './components/LandingPage';

const GOOGLE_CLIENT_ID = '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Violet
    },
    secondary: {
      main: '#3b82f6', // Blue
    },
    background: {
      default: '#050511',
      paper: '#0a0a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#050511',
          scrollbarColor: "#333 #050511",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#050511",
            width: '8px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#333",
            minHeight: 24,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7e22ce 0%, #2563eb 100%)',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.5)',
          }
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
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


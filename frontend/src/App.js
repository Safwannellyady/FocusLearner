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
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProgressDashboard from './components/ProgressDashboard';
import LandingPage from './components/LandingPage';
import Layout from './components/layout/Layout';
import MyCourses from './components/MyCourses';


const GOOGLE_CLIENT_ID = '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue
    },
    secondary: {
      main: '#475569', // Slate
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
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
          backgroundColor: '#f8fafc',
          scrollbarColor: "#cbd5e1 #f8fafc",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#f8fafc",
            width: '8px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#cbd5e1",
            minHeight: 24,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          textTransform: 'none',
          fontWeight: 600
        },
        containedPrimary: {
          background: '#2563eb',
          boxShadow: 'none',
          '&:hover': {
            background: '#1d4ed8',
            boxShadow: 'none',
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
            <Route path="/" element={<LandingPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardNew />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/my-courses" element={
              <ProtectedRoute>
                <Layout>
                  <MyCourses />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/lecture/:id" element={
              <ProtectedRoute>
                <Layout>
                  <LectureDetail />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/preferences" element={
              <ProtectedRoute>
                <Layout>
                  <Preferences />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/focus" element={
              <ProtectedRoute>
                <Layout>
                  <FocusLock />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/player" element={
              <ProtectedRoute>
                <Layout>
                  <VideoPlayer />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/games" element={
              <ProtectedRoute>
                <Layout>
                  <GameLab />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/games/kcl" element={
              <ProtectedRoute>
                <Layout>
                  <KCLChallenge />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/games/ai-challenge" element={
              <ProtectedRoute>
                <Layout>
                  <AIChallenge />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsDashboard />
                </Layout>
              </ProtectedRoute>
            }
            />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Layout>
                  <ProgressDashboard />
                </Layout>
              </ProtectedRoute>
            }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
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
import CreateFocusSession from './components/CreateFocusSession';
import MyEnrollments from './components/MyEnrollments';
import ManageFocus from './components/ManageFocus';
import Badges from './components/Badges';
import { FocusProvider } from './context/FocusContext';

const GOOGLE_CLIENT_ID = '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Refined Academic Indigo
    },
    secondary: {
      main: '#f59e0b', // Warm Scholar Amber / Gold
    },
    background: {
      default: '#0b0f19', // Deep Scholar Slate
      paper: '#111827',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", sans-serif',
    h1: { fontWeight: 800, fontFamily: '"Outfit", sans-serif' },
    h2: { fontWeight: 800, fontFamily: '"Outfit", sans-serif' },
    h3: { fontWeight: 700, fontFamily: '"Outfit", sans-serif' },
    h4: { fontWeight: 700, fontFamily: '"Outfit", sans-serif' },
    button: { textTransform: 'none', fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b0f19',
          color: '#f8fafc',
          scrollbarColor: "#475569 #0b0f19",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#0b0f19",
            width: '8px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#475569",
            minHeight: 24,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          textTransform: 'none',
          fontWeight: 600
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
        <FocusProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<LandingPage />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
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
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateFocusSession />
                  </Layout>
                </ProtectedRoute>
              }
              />
              <Route path="/create-focus-session" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateFocusSession />
                  </Layout>
                </ProtectedRoute>
              }
              />
              <Route path="/enrollments" element={
                <ProtectedRoute>
                  <Layout>
                    <MyEnrollments />
                  </Layout>
                </ProtectedRoute>
              }
              />
              <Route path="/manage-focus" element={
                <ProtectedRoute>
                  <Layout>
                    <ManageFocus />
                  </Layout>
                </ProtectedRoute>
              }
              />
              <Route path="/badges" element={
                <ProtectedRoute>
                  <Layout>
                    <Badges />
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
        </FocusProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


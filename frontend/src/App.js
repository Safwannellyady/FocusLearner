import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
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
import FocusArena from './components/FocusArena';
import KnowledgeGraph from './components/common/KnowledgeGraph';
import { FocusProvider } from './context/FocusContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#6366f1' },
    secondary:  { main: '#f59e0b' },
    success:    { main: '#10b981' },
    error:      { main: '#f43f5e' },
    background: { default: '#080d16', paper: '#0f1623' },
    text:       { primary: '#f1f5f9', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", system-ui, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 900, letterSpacing: '-0.04em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        body: {
          backgroundColor: '#080d16',
          color: '#f1f5f9',
          overflowX: 'clip',
          '&::-webkit-scrollbar':       { width: '5px', height: '5px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(99,102,241,0.35)', borderRadius: '10px' },
          '& *::-webkit-scrollbar':       { width: '5px', height: '5px' },
          '& *::-webkit-scrollbar-thumb': { background: 'rgba(99,102,241,0.35)', borderRadius: '10px' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#131d2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.5)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#0f1623',
          border: '1px solid rgba(255,255,255,0.07)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1a2540',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.75rem',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
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
              <Route path="/arena" element={
                <ProtectedRoute>
                  <Layout>
                    <FocusArena />
                  </Layout>
                </ProtectedRoute>
              }
              />
              <Route path="/knowledge-graph" element={
                <ProtectedRoute>
                  <Layout>
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                      <KnowledgeGraph />
                    </Box>
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


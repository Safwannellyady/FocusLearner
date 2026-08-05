import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { FocusProvider } from './context/FocusContext';

// Eager loaded core routes for instant initial render
import Login from './components/Login';
import Signup from './components/Signup';

// Lazy loaded page components for bundle size & main-thread optimization
const Dashboard          = lazy(() => import('./components/Dashboard'));
const LectureDetail      = lazy(() => import('./components/LectureDetail'));
const Preferences        = lazy(() => import('./components/Preferences'));
const FocusStudio        = lazy(() => import('./components/FocusStudio'));
const VideoPlayer        = lazy(() => import('./components/VideoPlayer'));
const GameLab            = lazy(() => import('./components/GameLab'));
const KCLChallenge       = lazy(() => import('./components/games/KCLChallenge'));
const AIChallenge        = lazy(() => import('./components/games/AIChallenge'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const ProgressDashboard  = lazy(() => import('./components/ProgressDashboard'));
const LandingPage        = lazy(() => import('./components/LandingPage'));
const MyCourses          = lazy(() => import('./components/MyCourses'));
const CreateFocusSession = lazy(() => import('./components/CreateFocusSession'));
const MyEnrollments      = lazy(() => import('./components/MyEnrollments'));
const ManageFocus        = lazy(() => import('./components/ManageFocus'));
const Badges             = lazy(() => import('./components/Badges'));
const FocusArena         = lazy(() => import('./components/FocusArena'));
const KnowledgeGraph     = lazy(() => import('./components/common/KnowledgeGraph'));

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#6366f1' },
    secondary:  { main: '#f59e0b' },
    success:    { main: '#10b981' },
    error:      { main: '#f43f5e' },
    background: { default: '#080d16', paper: '#0f1623' },
    text:       { primary: '#f1f5f9', secondary: '#94a3b8' },
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
        },
      },
    },
  },
});

const PageFallback = () => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <CircularProgress size={32} sx={{ color: "var(--indigo)" }} />
  </Box>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FocusProvider>
          <Router>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

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
                      <FocusStudio />
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
            </Suspense>
          </Router>
        </FocusProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

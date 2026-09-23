import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import Layout from './components/layout/Layout';
import { FocusProvider } from './context/FocusContext';

// Eager loaded core routes for instant initial render
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';

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
const StudyRoom          = lazy(() => import('./components/StudyRoom'));

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

/**
 * Inner component that has access to React Router's navigate hook.
 * Listens for the 'auth:logout' CustomEvent dispatched by api.js when
 * token refresh fails — redirects to /login without a full page reload,
 * preserving React context and avoiding infinite reload loops.
 */
function AuthLogoutHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleAuthLogout = () => navigate('/login', { replace: true });
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [navigate]);
  return null;
}


/**
 * Wraps an authenticated page: per-page error boundary (a crash in one page
 * can no longer blank the whole app) around the shared layout.
 */
const GuardedPage = ({ children }) => (
  <ProtectedRoute>
    <ErrorBoundary>
      <Layout>{children}</Layout>
    </ErrorBoundary>
  </ProtectedRoute>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FocusProvider>
          <Router>
            <AuthLogoutHandler />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
                <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />

                <Route path="/dashboard" element={<GuardedPage><Dashboard /></GuardedPage>} />
                <Route path="/my-courses" element={<GuardedPage><MyCourses /></GuardedPage>} />
                <Route path="/lecture/:id" element={<GuardedPage><LectureDetail /></GuardedPage>} />
                <Route path="/preferences" element={<GuardedPage><Preferences /></GuardedPage>} />
                <Route path="/courses" element={<GuardedPage><CreateFocusSession /></GuardedPage>} />
                <Route path="/create-focus-session" element={<GuardedPage><CreateFocusSession /></GuardedPage>} />
                <Route path="/enrollments" element={<GuardedPage><MyEnrollments /></GuardedPage>} />
                <Route path="/manage-focus" element={<GuardedPage><ManageFocus /></GuardedPage>} />
                <Route path="/study-room" element={<GuardedPage><StudyRoom /></GuardedPage>} />
                <Route path="/badges" element={<GuardedPage><Badges /></GuardedPage>} />
                <Route path="/focus" element={<GuardedPage><FocusStudio /></GuardedPage>} />

                <Route path="/player" element={<GuardedPage><VideoPlayer /></GuardedPage>} />
                <Route path="/games" element={<GuardedPage><GameLab /></GuardedPage>} />
                <Route path="/games/kcl" element={<GuardedPage><KCLChallenge /></GuardedPage>} />
                <Route path="/games/ai-challenge" element={<GuardedPage><AIChallenge /></GuardedPage>} />
                <Route path="/analytics" element={<GuardedPage><AnalyticsDashboard /></GuardedPage>} />
                <Route path="/progress" element={<GuardedPage><ProgressDashboard /></GuardedPage>} />
                <Route path="/arena" element={<GuardedPage><FocusArena /></GuardedPage>} />
                <Route path="/knowledge-graph" element={<GuardedPage><Box sx={{ p: { xs: 2, md: 4 } }}> <KnowledgeGraph /> </Box></GuardedPage>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </FocusProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

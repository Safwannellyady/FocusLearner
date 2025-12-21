import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');

      try {
        const response = await authAPI.googleLogin(tokenResponse.access_token);
        const { token, user, is_new_user } = response.data;

        // Store token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on whether user is new
        if (is_new_user) {
          navigate('/preferences');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Google login failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
      setGoogleLoading(false);
    },
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(20px)' }}>
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1 }}>
              FocusLearner Pro
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" gutterBottom sx={{ mb: 4 }}>
              Sign In to your dedicated environment.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" color="text.secondary">OR CONTINUE WITH</Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                sx={{ mb: 3, py: 1.5, borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}
              >
                {googleLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>

              <Box textAlign="center">
                <MuiLink component={Link} to="/signup" variant="body2" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Don't have an account? <strong>Sign Up</strong>
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;


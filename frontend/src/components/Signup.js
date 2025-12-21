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

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName
      );
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to preferences setup
      navigate('/preferences');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
        setError(err.response?.data?.error || 'Google signup failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google signup failed. Please try again.');
      setGoogleLoading(false);
    },
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(20px)' }}>
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" gutterBottom sx={{ mb: 4 }}>
              Join FocusLearner Pro to start your focused learning journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                margin="normal"
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Must be at least 6 characters"
                variant="filled"
                InputProps={{ sx: { borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                {loading ? 'Creating Account...' : 'Sign Up'}
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
                {googleLoading ? 'Signing up...' : 'Sign up with Google'}
              </Button>

              <Box textAlign="center">
                <MuiLink component={Link} to="/login" variant="body2" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Already have an account? <strong>Sign In</strong>
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;


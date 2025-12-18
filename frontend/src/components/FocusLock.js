import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { focusAPI } from '../services/api';

const FocusLock = () => {
  const navigate = useNavigate();
  const [subjectFocus, setSubjectFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const subjectOptions = [
    'ECE/Network Analysis',
    'ECE/Circuit Theory',
    'CS/Algorithms',
    'CS/Data Structures',
    'Math/Linear Algebra',
    'Math/Calculus',
    'Physics/Mechanics',
    'Chemistry/Organic',
    'Biology/Genetics',
    'Language/English',
    'History/World History',
  ];

  const handleLock = async () => {
    if (!subjectFocus) {
      setError('Please select a subject focus');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await focusAPI.lock(subjectFocus);
      setSuccess(true);
      setTimeout(() => {
        navigate('/player');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to lock focus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <LockIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4">Focus Lock</Typography>
          </Box>

          <Typography variant="body1" paragraph>
            Select your current subject focus. Once locked, the system will filter
            out all distracting content and guide you through focused learning.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Focus locked successfully! Redirecting to player...
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Subject Focus</InputLabel>
            <Select
              value={subjectFocus}
              label="Subject Focus"
              onChange={(e) => setSubjectFocus(e.target.value)}
            >
              {subjectOptions.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleLock}
            disabled={loading || !subjectFocus}
            sx={{ mb: 2 }}
          >
            {loading ? 'Locking...' : 'Lock Focus'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FocusLock;


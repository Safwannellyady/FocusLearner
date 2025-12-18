import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { preferencesAPI } from '../services/api';

const subjectOptions = [
  'ECE/Network Analysis',
  'ECE/Circuit Theory',
  'CS/Algorithms',
  'CS/Data Structures',
  'Math/Linear Algebra',
  'Math/Calculus',
  'Physics/Mechanics',
  'Physics/Electromagnetism',
];

const Preferences = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    preferred_subjects: [],
    preferred_topics: [],
    difficulty_level: 'intermediate',
    learning_style: 'visual',
  });
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await preferencesAPI.get();
      const prefs = response.data.preferences;
      setPreferences({
        preferred_subjects: prefs.preferred_subjects || [],
        preferred_topics: prefs.preferred_topics || [],
        difficulty_level: prefs.difficulty_level || 'intermediate',
        learning_style: prefs.learning_style || 'visual',
      });
      setTopics((prefs.preferred_topics || []).join(', '));
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert topics string to array
      const topicsArray = topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const updatedPrefs = {
        ...preferences,
        preferred_topics: topicsArray,
      };

      await preferencesAPI.update(updatedPrefs);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Set Your Learning Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Customize your learning experience by setting your preferences. You can change these
            anytime.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Preferences saved! Redirecting to dashboard...
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Autocomplete
              multiple
              options={subjectOptions}
              value={preferences.preferred_subjects}
              onChange={(event, newValue) => {
                setPreferences({ ...preferences, preferred_subjects: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Preferred Subjects" margin="normal" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
            />

            <TextField
              fullWidth
              label="Preferred Topics (comma-separated)"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              margin="normal"
              helperText="e.g., Kirchhoff's Laws, Node Analysis, Binary Trees"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={preferences.difficulty_level}
                label="Difficulty Level"
                onChange={(e) =>
                  setPreferences({ ...preferences, difficulty_level: e.target.value })
                }
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Learning Style</InputLabel>
              <Select
                value={preferences.learning_style}
                label="Learning Style"
                onChange={(e) =>
                  setPreferences({ ...preferences, learning_style: e.target.value })
                }
              >
                <MenuItem value="visual">Visual</MenuItem>
                <MenuItem value="auditory">Auditory</MenuItem>
                <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleSave} disabled={loading} fullWidth>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
              <Button variant="outlined" onClick={handleSkip} fullWidth>
                Skip for Now
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Preferences;


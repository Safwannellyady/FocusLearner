import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
} from '@mui/material';
import { preferencesAPI, taxonomyAPI } from '../services/api';

const Preferences = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    preferred_subjects: [],
    preferred_topics: [],
    difficulty_level: 'intermediate',
    learning_style: 'visual',
    advanced_options: {
      auto_start_break: true,
      distraction_sensitivity: 'balanced',
      daily_focus_target: 240,
      ai_rag_depth: 'deep',
      enable_sound_effects: true,
      strict_focus_lock: false,
    }
  });
  const [topics, setTopics] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [prefRes, subRes] = await Promise.all([
          preferencesAPI.get(),
          taxonomyAPI.getSubjects()
        ]);

        const prefs = prefRes.data.preferences;
        setPreferences({
          preferred_subjects: prefs.preferred_subjects || [],
          preferred_topics: prefs.preferred_topics || [],
          difficulty_level: prefs.difficulty_level || 'intermediate',
          learning_style: prefs.learning_style || 'visual',
          advanced_options: prefs.advanced_options || {
            auto_start_break: true,
            distraction_sensitivity: 'balanced',
            daily_focus_target: 240,
            ai_rag_depth: 'deep',
            enable_sound_effects: true,
            strict_focus_lock: false,
          }
        });
        setTopics((prefs.preferred_topics || []).join(', '));

        if (subRes.data.subjects) {
          setSubjectOptions(subRes.data.subjects);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    initData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
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

  // Dark Input Styles
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      bgcolor: 'rgba(255,255,255,0.05)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{
        p: 5,
        borderRadius: 4,
        bgcolor: '#0a0a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        color: 'white'
      }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Set Your Learning Preferences
        </Typography>
        <Typography variant="body1" color="grey.400" paragraph sx={{ mb: 4 }}>
          Customize your learning experience by setting your preferences. You can change these anytime.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Preferences saved! Redirecting to dashboard...
          </Alert>
        )}

        <Box component="form" noValidate sx={{ mt: 1 }}>

          {/* Preferred Subjects */}
          <Autocomplete
            multiple
            options={subjectOptions}
            value={preferences.preferred_subjects}
            onChange={(event, newValue) => {
              setPreferences({ ...preferences, preferred_subjects: newValue });
            }}
            popupIcon={<span style={{ color: 'white' }}>▼</span>}
            sx={{ mb: 3, ...inputSx }}
            renderInput={(params) => (
              <TextField {...params} label="Preferred Subjects" variant="outlined" placeholder="Select subjects..." />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  sx={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                />
              ))
            }
          />

          {/* Preferred Topics */}
          <TextField
            fullWidth
            label="Preferred Topics (comma-separated)"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="e.g., Kirchhoff's Laws, Node Analysis, Binary Trees"
            sx={{ mb: 3, ...inputSx }}
            helperText={<Typography variant="caption" color="grey.600">Enter specifc topics to prioritize in your feed.</Typography>}
          />

          {/* Difficulty Level */}
          <FormControl fullWidth margin="normal" sx={{ mb: 3, ...inputSx }}>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              value={preferences.difficulty_level}
              label="Difficulty Level"
              onChange={(e) => setPreferences({ ...preferences, difficulty_level: e.target.value })}
              sx={{ color: 'white' }}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: 'white' } } }}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          {/* Learning Style */}
          <FormControl fullWidth margin="normal" sx={{ mb: 4, ...inputSx }}>
            <InputLabel>Learning Style</InputLabel>
            <Select
              value={preferences.learning_style}
              label="Learning Style"
              onChange={(e) => setPreferences({ ...preferences, learning_style: e.target.value })}
              sx={{ color: 'white' }}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: 'white' } } }}
            >
              <MenuItem value="visual">Visual (Video & Diagrams)</MenuItem>
              <MenuItem value="auditory">Auditory (Lectures & Discussion)</MenuItem>
              <MenuItem value="kinesthetic">Kinesthetic (Labs & Challenges)</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

          {/* Advanced Profile Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#a78bfa' }}>
              Advanced Profile & Focus Settings
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ mb: 3 }}>
              Fine-tune focus monitoring, AI depth, and automated session transitions.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.advanced_options?.auto_start_break ?? true}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          advanced_options: { ...preferences.advanced_options, auto_start_break: e.target.checked }
                        })}
                        color="secondary"
                      />
                    }
                    label={<Typography variant="body1" fontWeight="600">Auto-Start Break Timer</Typography>}
                  />
                  <Typography variant="caption" color="grey.500" display="block" sx={{ mt: 0.5 }}>
                    Automatically transition to break (B=00.00) when focus session (F=00.00) completes.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.advanced_options?.strict_focus_lock ?? false}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          advanced_options: { ...preferences.advanced_options, strict_focus_lock: e.target.checked }
                        })}
                        color="secondary"
                      />
                    }
                    label={<Typography variant="body1" fontWeight="600">Strict Focus Lock Mode</Typography>}
                  />
                  <Typography variant="caption" color="grey.500" display="block" sx={{ mt: 0.5 }}>
                    Prevent navigating away from locked subject until session target is reached.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.advanced_options?.enable_sound_effects ?? true}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          advanced_options: { ...preferences.advanced_options, enable_sound_effects: e.target.checked }
                        })}
                        color="secondary"
                      />
                    }
                    label={<Typography variant="body1" fontWeight="600">Audio Transitions & Chimes</Typography>}
                  />
                  <Typography variant="caption" color="grey.500" display="block" sx={{ mt: 0.5 }}>
                    Play subtle haptic/audio alerts on focus and break completion milestones.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <TextField
                    fullWidth
                    label="Daily Focus Target (Minutes)"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={preferences.advanced_options?.daily_focus_target ?? 240}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      advanced_options: { ...preferences.advanced_options, daily_focus_target: Number(e.target.value) }
                    })}
                    sx={{ ...inputSx, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="grey.500" display="block">
                    Recommended goal: 240 minutes (4 hours) of deep learning per day.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ ...inputSx }}>
                  <InputLabel>Distraction Sensitivity</InputLabel>
                  <Select
                    value={preferences.advanced_options?.distraction_sensitivity ?? 'balanced'}
                    label="Distraction Sensitivity"
                    onChange={(e) => setPreferences({
                      ...preferences,
                      advanced_options: { ...preferences.advanced_options, distraction_sensitivity: e.target.value }
                    })}
                    sx={{ color: 'white' }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: 'white' } } }}
                  >
                    <MenuItem value="strict">Strict (Immediate 1s tab switch trigger)</MenuItem>
                    <MenuItem value="balanced">Balanced (2s threshold)</MenuItem>
                    <MenuItem value="relaxed">Relaxed (5s threshold before alert)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ ...inputSx }}>
                  <InputLabel>AI Tutoring RAG Depth</InputLabel>
                  <Select
                    value={preferences.advanced_options?.ai_rag_depth ?? 'deep'}
                    label="AI Tutoring RAG Depth"
                    onChange={(e) => setPreferences({
                      ...preferences,
                      advanced_options: { ...preferences.advanced_options, ai_rag_depth: e.target.value }
                    })}
                    sx={{ color: 'white' }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: 'white' } } }}
                  >
                    <MenuItem value="fast">Fast (Concise bullet points & summaries)</MenuItem>
                    <MenuItem value="deep">Deep (Comprehensive explanations & timeline citations)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              fullWidth
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleSkip}
              fullWidth
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'grey.400',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { borderColor: 'white', color: 'white' }
              }}
            >
              Skip for Now
            </Button>
          </Box>

        </Box>
      </Paper>
    </Container>
  );
};

export default Preferences;


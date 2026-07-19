import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { Bolt, Headphones, AutoAwesome, PlayArrow, Group, School } from '@mui/icons-material';
import axios from 'axios';
import { focusAPI } from '../services/api';
import FocusTimer from './FocusTimer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const FocusLock = () => {
  const navigate = useNavigate();
  const [subjectFocus, setSubjectFocus] = useState('Math/Linear Algebra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(true);
  const [selectedSoundscape, setSelectedSoundscape] = useState('Binaural Theta Waves (6Hz)');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const subjectOptions = [
    'ECE/Network Analysis',
    'ECE/Circuit Theory',
    'CS/Algorithms',
    'CS/Data Structures',
    'Math/Linear Algebra',
    'Math/Calculus',
    'Physics/Mechanics',
    'Language/English',
  ];

  const soundscapeOptions = [
    'Binaural Theta Waves (6Hz - Deep Work)',
    'Soft White Noise & Coffee Shop Rain',
    'Lo-Fi Scholar Ambient Beats',
    'Silence (Pure Focus)'
  ];

  useEffect(() => {
    const fetchRec = async () => {
      setLoadingRec(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/focus/recommendation`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.recommendation) {
          setRecommendation(res.data.recommendation);
          if (res.data.recommendation.soundscape) {
            setSelectedSoundscape(res.data.recommendation.soundscape);
          }
        }
      } catch (err) {
        console.error('Failed to get focus recommendation:', err);
        setRecommendation({
          sprint_minutes: 25,
          break_minutes: 5,
          mode: 'Standard Pomodoro Sprint',
          reasoning: 'Optimal balance for high-density academic learning without cognitive fatigue.'
        });
      } finally {
        setLoadingRec(false);
      }
    };
    fetchRec();
  }, []);

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    try {
      await focusAPI.lock(subjectFocus);
      setShowTimer(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize session.');
      setShowTimer(true); // Allow local sprint anyway without lockout
    } finally {
      setLoading(false);
    }
  };

  const toggleSoundscape = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Bolt sx={{ color: '#f59e0b', fontSize: 38 }} /> Smart Pomodoro Studio (`FocusStudio`)
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            AI-optimized focus intervals & ambient soundscapes without intrusive screen locks
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Group />}
            onClick={() => navigate('/arena')}
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', textTransform: 'none', fontWeight: 600 }}
          >
            Multiplayer Study Arena
          </Button>
          <Button
            variant="outlined"
            startIcon={<School />}
            onClick={() => navigate('/dashboard')}
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', textTransform: 'none', fontWeight: 600 }}
          >
            Knowledge Graph
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Panel: AI Recommendation & Configuration */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: '#6366f1' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                AI Attention & Cadence Briefing
              </Typography>
            </Box>

            {loadingRec ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <CircularProgress size={28} sx={{ color: '#6366f1' }} />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94a3b8' }}>Analyzing recent study cadence...</Typography>
              </Box>
            ) : recommendation ? (
              <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip label={recommendation.mode} size="small" sx={{ background: '#6366f1', color: '#fff', fontWeight: 800 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#c4b5fd' }}>
                    {recommendation.sprint_minutes}m Focus / {recommendation.break_minutes}m Break
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.6 }}>
                  {recommendation.reasoning}
                </Typography>
              </Box>
            ) : null}

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#94a3b8' }}>Subject Focus</InputLabel>
              <Select
                value={subjectFocus}
                label="Subject Focus"
                onChange={(e) => setSubjectFocus(e.target.value)}
                sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' } }}
              >
                {subjectOptions.map((subj) => (
                  <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Headphones sx={{ color: '#10b981', fontSize: 18 }} /> Ambient Audio Soundscape
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedSoundscape}
                    onChange={(e) => setSelectedSoundscape(e.target.value)}
                    sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    {soundscapeOptions.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={toggleSoundscape}
                  sx={{
                    minWidth: 110,
                    borderColor: isPlayingAudio ? '#ef4444' : '#10b981',
                    color: isPlayingAudio ? '#ef4444' : '#10b981',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  {isPlayingAudio ? 'Mute Audio' : 'Play Audio'}
                </Button>
              </Box>
            </Box>

            {!showTimer && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleStartSession}
                disabled={loading}
                startIcon={<PlayArrow />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  mt: 1,
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                }}
              >
                Launch Smart Sprint ({subjectFocus})
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Right Panel: Pomodoro Timer Studio Area */}
        <Grid item xs={12} md={6}>
          <Box sx={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 2 }}>
            <FocusTimer />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FocusLock;

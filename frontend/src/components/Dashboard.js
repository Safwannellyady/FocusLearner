import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GamesIcon from '@mui/icons-material/Games';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PaletteIcon from '@mui/icons-material/Palette';
import { motion } from 'framer-motion';
import { focusAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(null);
  const [userId] = useState(1); // In production, get from auth context
  
  // Theme aesthetic option: 'clean' (Modern Clean), 'glass' (Glassmorphism), 'cyber' (Cyber Neon)
  const [designTheme, setDesignTheme] = useState(() => {
    return localStorage.getItem('fl_design_theme') || 'clean';
  });

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      const response = await focusAPI.getCurrent(userId);
      if (response.data.session) {
        setCurrentSession(response.data.session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleThemeChange = (theme) => {
    setDesignTheme(theme);
    localStorage.setItem('fl_design_theme', theme);
  };

  const getThemeCardClass = () => {
    if (designTheme === 'glass') return 'theme-card-glass interactive-card';
    if (designTheme === 'cyber') return 'theme-card-cyber interactive-card';
    return 'theme-card-clean interactive-card';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 6, transition: 'all 0.4s ease' }}>
      {/* Top Header & Design Theme Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 3, borderBottom: '1px solid #e2e8f0', gap: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
              FocusLearner Pro
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Unified, Contextual, and Gamified Learning Ecosystem
            </Typography>
          </Box>

          {/* Multiple Designs Theme Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.8, bgcolor: designTheme === 'clean' ? '#f1f5f9' : 'rgba(30,41,59,0.7)', borderRadius: 20, border: '1px solid rgba(148,163,184,0.2)' }}>
            <PaletteIcon fontSize="small" sx={{ color: '#6366f1', ml: 1 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, mr: 0.5, color: designTheme === 'clean' ? '#334155' : '#cbd5e1' }}>DESIGN STYLE:</Typography>
            {[
              { id: 'clean', label: 'Modern Clean', color: '#2563eb' },
              { id: 'glass', label: 'Glass Aurora', color: '#8b5cf6' },
              { id: 'cyber', label: 'Cyber Neon', color: '#06b6d4' }
            ].map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                size="small"
                onClick={() => handleThemeChange(t.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: designTheme === t.id ? t.color : 'transparent',
                  color: designTheme === t.id ? '#ffffff' : (designTheme === 'clean' ? '#64748b' : '#94a3b8'),
                  boxShadow: designTheme === t.id ? `0 4px 12px ${t.color}40` : 'none',
                  '&:hover': {
                    bgcolor: designTheme === t.id ? t.color : 'rgba(148,163,184,0.15)',
                    transform: 'scale(1.04)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* Active Focus Session Banner */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Paper sx={{
            p: 3.5,
            mb: 4,
            borderRadius: 4,
            background: designTheme === 'cyber' 
              ? 'linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)'
              : designTheme === 'glass'
              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.85) 0%, rgba(37, 99, 235, 0.85) 100%)'
              : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1.2} mb={1}>
                <AutoAwesomeIcon sx={{ color: '#93c5fd', animation: 'pulse 2s infinite' }} />
                <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: '#dbeafe' }}>
                  ACTIVE FOCUS SESSION IN PROGRESS
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Subject Focus: {currentSession.subject_focus}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Distraction-free environment actively locked on your current curriculum path.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/player')}
              sx={{
                bgcolor: '#ffffff',
                color: '#1e40af',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 3,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                }
              }}
            >
              Continue Learning →
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* Main Core Features Grid */}
      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Card 1: Focus Lock */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            whileHover={{ y: -6 }}
            style={{ height: '100%' }}
          >
            <Card className={getThemeCardClass()} sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: designTheme === 'cyber' ? 'rgba(6,182,212,0.15)' : 'rgba(37,99,235,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5
                }}>
                  <LockIcon sx={{ fontSize: 32, color: designTheme === 'cyber' ? '#06b6d4' : '#2563eb' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Focus Lock
                </Typography>
                <Typography variant="body2" sx={{ color: designTheme === 'clean' ? '#64748b' : 'rgba(255,255,255,0.7)', lineHeight: 1.6, mb: 3 }}>
                  Lock your focus on a specific subject to enable distraction-free learning. The system will filter out all non-educational distractions automatically.
                </Typography>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  variant={designTheme === 'clean' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => navigate('/focus')}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: designTheme === 'clean' ? '#2563eb' : 'transparent',
                    borderColor: designTheme === 'cyber' ? '#06b6d4' : '#8b5cf6',
                    color: designTheme === 'clean' ? '#fff' : (designTheme === 'cyber' ? '#06b6d4' : '#c4b5fd'),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: designTheme === 'clean' ? '#1d4ed8' : (designTheme === 'cyber' ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.15)'),
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Configure Focus Lock
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        {/* Card 2: Video Player & AI Tutor */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            whileHover={{ y: -6 }}
            style={{ height: '100%' }}
          >
            <Card className={getThemeCardClass()} sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: designTheme === 'cyber' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5
                }}>
                  <PlayArrowIcon sx={{ fontSize: 34, color: designTheme === 'cyber' ? '#10b981' : '#7c3aed' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Interactive Lectures
                </Typography>
                <Typography variant="body2" sx={{ color: designTheme === 'clean' ? '#64748b' : 'rgba(255,255,255,0.7)', lineHeight: 1.6, mb: 3 }}>
                  Watch educational videos with distraction-free controls, contextual AI tutor assistance, and synchronized practice activities right beside your stream.
                </Typography>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  variant={designTheme === 'clean' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => navigate('/player')}
                  disabled={!currentSession}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: designTheme === 'clean' ? '#7c3aed' : 'transparent',
                    borderColor: designTheme === 'cyber' ? '#10b981' : '#7c3aed',
                    color: designTheme === 'clean' ? '#fff' : (designTheme === 'cyber' ? '#10b981' : '#d8b4fe'),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: designTheme === 'clean' ? '#6d28d9' : (designTheme === 'cyber' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)'),
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Launch Video Player
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        {/* Card 3: Game Lab */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            whileHover={{ y: -6 }}
            style={{ height: '100%' }}
          >
            <Card className={getThemeCardClass()} sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: designTheme === 'cyber' ? 'rgba(249,115,22,0.15)' : 'rgba(236,72,153,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5
                }}>
                  <GamesIcon sx={{ fontSize: 32, color: designTheme === 'cyber' ? '#f97316' : '#ec4899' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Gamified AI Lab
                </Typography>
                <Typography variant="body2" sx={{ color: designTheme === 'clean' ? '#64748b' : 'rgba(255,255,255,0.7)', lineHeight: 1.6, mb: 3 }}>
                  Engage with AI-generated challenges, interactive virtual labs, and real-time quizzes tailored specifically to your active topic and learning goals.
                </Typography>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  variant={designTheme === 'clean' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => navigate('/games')}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: designTheme === 'clean' ? '#ec4899' : 'transparent',
                    borderColor: designTheme === 'cyber' ? '#f97316' : '#ec4899',
                    color: designTheme === 'clean' ? '#fff' : (designTheme === 'cyber' ? '#f97316' : '#fbcfe8'),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: designTheme === 'clean' ? '#db2777' : (designTheme === 'cyber' ? 'rgba(249,115,22,0.15)' : 'rgba(236,72,153,0.15)'),
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Enter Gamified Arena
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

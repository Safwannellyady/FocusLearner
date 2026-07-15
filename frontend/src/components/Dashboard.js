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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion, useScroll, useSpring } from 'framer-motion';
import { focusAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(null);
  const [userId] = useState(1);
  
  // Theme aesthetic option: 'cyber' (Cyber Neon Obsidian), 'glass' (Glass Aurora), 'clean' (Modern Light)
  const [designTheme, setDesignTheme] = useState(() => {
    return localStorage.getItem('fl_design_theme') || 'cyber';
  });

  // Scroll Progress Bar Telemetry
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Magnetic Cursor Spotlight state across cards
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const getCardStyleClass = () => {
    if (designTheme === 'cyber') return 'epic-card epic-card-cyber';
    if (designTheme === 'glass') return 'epic-card';
    return 'epic-card';
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <Box className="epic-content-layer">
      {/* Top Telemetry Scroll Progress Bar */}
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 76,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 50%, #f72585 100%)',
          transformOrigin: '0%',
          zIndex: 1200,
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.8)'
        }}
      />

      {/* Background Matrix Grid */}
      <Box className="epic-matrix-grid" />

      <Container maxWidth="xl" sx={{ pt: 6, pb: 12, px: { xs: 2, md: 5 } }}>
        {/* Top Neural Telemetry HUD Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -25 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: 3,
            mb: 6, 
            p: 3.5, 
            borderRadius: var(--epic-radius-xl),
            bgcolor: 'rgba(14, 18, 38, 0.65)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.2}>
                <span className="epic-badge-glow">
                  <span className="pulse-dot-cyan" /> AI NEURAL CORE V3.4 ONLINE
                </span>
                <span className="epic-badge-purple">
                  <ShieldIcon sx={{ fontSize: 14 }} /> DISTRACTION SHIELD ACTIVE
                </span>
                <span className="epic-badge-emerald">
                  <EmojiEventsIcon sx={{ fontSize: 14 }} /> XP BOOST 2.5x
                </span>
              </Box>
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 900, 
                fontFamily: 'Outfit, sans-serif', 
                fontSize: { xs: '2.2rem', md: '3.4rem' },
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                mb: 1.2
              }}>
                FocusLearner <span className={designTheme === 'cyber' ? "epic-text-gradient-cyber" : "epic-text-gradient-cyan"}>Command Hub</span>
              </Typography>
              <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif', maxWidth: 750, fontSize: '1.08rem', lineHeight: 1.6 }}>
                High-performance, contextualized neural learning ecosystem engineered for total distraction-free mastery, interactive physics, and gamified evaluation.
              </Typography>
            </Box>

            {/* Design Atmosphere Selector */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              gap: 1.2,
              p: 2,
              borderRadius: '20px',
              bgcolor: 'rgba(3, 4, 11, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <PaletteIcon sx={{ color: '#00f2fe', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#cbd5e1', letterSpacing: '0.05em' }}>
                  AESTHETIC PROTOCOL:
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                {[
                  { id: 'cyber', label: '⚡ Cyber Obsidian', color: '#00f2fe' },
                  { id: 'glass', label: '🌌 Aurora Glass', color: '#9d4edd' },
                  { id: 'clean', label: '💎 Hyper Modern', color: '#4facfe' }
                ].map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    onClick={() => handleThemeChange(t.id)}
                    sx={{
                      fontWeight: 800,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.82rem',
                      px: 1,
                      py: 2.2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      bgcolor: designTheme === t.id ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                      color: designTheme === t.id ? '#ffffff' : '#64748b',
                      border: designTheme === t.id ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: designTheme === t.id ? `0 0 20px ${t.color}60` : 'none',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Live Holographic Active Session Cockpit Banner with Scroll Entrance */}
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box sx={{
              p: { xs: 3.5, md: 5 },
              mb: 7,
              borderRadius: var(--epic-radius-xl),
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.18) 0%, rgba(157, 78, 221, 0.22) 100%)',
              backdropFilter: 'blur(32px)',
              border: '1.5px solid rgba(0, 242, 254, 0.5)',
              boxShadow: '0 25px 60px -15px rgba(0, 242, 254, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 4
            }}>
              {/* Animated Light Sweep Background */}
              <Box sx={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointer-events: 'none'
              }} />

              <Box sx={{ zIndex: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box className="pulse-dot-cyan" />
                  <Typography variant="overline" sx={{ fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', letterSpacing: '0.12em', color: '#00f2fe' }}>
                    HOLOGRAPHIC FOCUS SESSION ACTIVE
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1.5, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  Locked Subject: <span style={{ color: '#00f2fe' }}>{currentSession.subject_focus}</span>
                </Typography>
                <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 500, maxWidth: 680, lineHeight: 1.6 }}>
                  Distraction filtering protocols are operating at peak efficiency. Jump directly back into your synchronized curriculum stream and virtual challenges.
                </Typography>
              </Box>

              <Box sx={{ zIndex: 2, display: 'flex', gap: 2 }}>
                <Button
                  onClick={() => navigate('/player')}
                  className="epic-btn-primary"
                  sx={{ fontSize: '1.08rem !important', py: '16px !important', px: '38px !important' }}
                >
                  ⚡ Engage Learning Stream →
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Section Heading with Scroll Entrance */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BoltIcon sx={{ color: '#00f2fe', fontSize: 32 }} /> Core High-Tech Learning Modules
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#64748b', fontSize: '0.85rem' }}>
              [ SYSTEM STATUS: ALL NODES OPERATIONAL ]
            </Typography>
          </Box>
        </motion.div>

        {/* Main 3 Core High-Tech Modules Grid with Staggered Scroll Animations & Magnetic Hover Spotlights */}
        <Grid container spacing={4}>
          {/* Module 1: Focus Lock Shield */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <Box 
                className={getCardStyleClass()} 
                onMouseMove={handleMouseMove}
                sx={{ 
                  p: 4.5, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  borderRadius: var(--epic-radius-xl),
                  position: 'relative',
                  overflow: 'hidden',
                  background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 242, 254, 0.12), transparent 80%), var(--epic-bg-card)`
                }}
              >
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                    <Box sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '20px',
                      background: 'radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, rgba(14, 18, 38, 0.8) 100%)',
                      border: '1px solid rgba(0, 242, 254, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 25px rgba(0, 242, 254, 0.3)'
                    }}>
                      <LockIcon sx={{ fontSize: 36, color: '#00f2fe' }} />
                    </Box>
                    <span className="epic-badge-glow">🔒 PRO SHIELD</span>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', mb: 2, color: '#ffffff' }}>
                    Focus Lock Protocol
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1.03rem' }}>
                    Lock your cognitive focus onto a specific subject vector. The neural engine automatically intercepts and filters out all non-educational web and notification distractions.
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  onClick={() => navigate('/focus')}
                  className="epic-btn-outline"
                  sx={{ py: '15px !important', fontSize: '1.03rem !important', fontWeight: '800 !important' }}
                >
                  ⚡ Configure Shield Parameters →
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Module 2: Interactive Lectures & AI Tutor */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <Box 
                className={getCardStyleClass()} 
                onMouseMove={handleMouseMove}
                sx={{ 
                  p: 4.5, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  borderRadius: var(--epic-radius-xl),
                  position: 'relative',
                  overflow: 'hidden',
                  background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(157, 78, 221, 0.14), transparent 80%), var(--epic-bg-card)`
                }}
              >
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                    <Box sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '20px',
                      background: 'radial-gradient(circle, rgba(157, 78, 221, 0.3) 0%, rgba(14, 18, 38, 0.8) 100%)',
                      border: '1px solid rgba(157, 78, 221, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 25px rgba(157, 78, 221, 0.4)'
                    }}>
                      <PlayArrowIcon sx={{ fontSize: 40, color: '#d8b4fe' }} />
                    </Box>
                    <span className="epic-badge-purple">⚡ AI RAG TUTOR</span>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', mb: 2, color: '#ffffff' }}>
                    Interactive Lectures
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1.03rem' }}>
                    Immerse yourself in distraction-free video streams synchronized precisely with real-time AI context checking, interactive notes, and contextual knowledge queries.
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  onClick={() => navigate('/player')}
                  disabled={!currentSession}
                  className="epic-btn-purple"
                  sx={{ py: '15px !important', fontSize: '1.03rem !important', fontWeight: '800 !important' }}
                >
                  🚀 Launch Neural Stream →
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Module 3: Gamified AI Lab & Quizzes */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <Box 
                className={getCardStyleClass()} 
                onMouseMove={handleMouseMove}
                sx={{ 
                  p: 4.5, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  borderRadius: var(--epic-radius-xl),
                  position: 'relative',
                  overflow: 'hidden',
                  background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.14), transparent 80%), var(--epic-bg-card)`
                }}
              >
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                    <Box sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '20px',
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(14, 18, 38, 0.8) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                    }}>
                      <GamesIcon sx={{ fontSize: 36, color: '#34d399' }} />
                    </Box>
                    <span className="epic-badge-emerald">🎮 ARENA LIVE</span>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', mb: 2, color: '#ffffff' }}>
                    Gamified AI Arena
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1.03rem' }}>
                    Test and solidify your understanding through AI-generated virtual labs, real-time code evaluation challenges, and topic-locked comprehension battles.
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  onClick={() => navigate('/games')}
                  className="epic-btn-outline"
                  sx={{ 
                    py: '15px !important', 
                    fontSize: '1.03rem !important',
                    fontWeight: '800 !important',
                    borderColor: 'rgba(16, 185, 129, 0.4) !important',
                    '&:hover': {
                      borderColor: '#10b981 !important',
                      color: '#10b981 !important',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.4) !important'
                    }
                  }}
                >
                  🎮 Enter Gamified Arena →
                </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

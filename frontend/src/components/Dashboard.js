import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GamesIcon from '@mui/icons-material/Games';
import PaletteIcon from '@mui/icons-material/Palette';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';
import { motion, useScroll, useSpring, AnimatePresence, useTransform } from 'framer-motion';
import { focusAPI } from '../services/api';

// Awwwards Staggered Text Reveal Word Component
const StaggeredHeadline = ({ text, className, gradientClass }) => {
  const words = text.split(' ');
  return (
    <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: { xs: 0.8, md: 1.4 }, alignItems: 'baseline' }}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 35, rotateX: -30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.65,
            delay: index * 0.1,
            type: 'spring',
            stiffness: 130,
            damping: 20
          }}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
          className={word.includes('FocusLearner') || word.includes('Command') || word.includes('Neural') ? gradientClass : className}
        >
          {word}
        </motion.span>
      ))}
    </Box>
  );
};

// 3D Perspective Tilt Card Component
const TiltCard = ({ children, className, sx, onClick, dataCursorText }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = (mouseY - height / 2) / -18;
    const rotateY = (mouseX - width / 2) / 18;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor-text={dataCursorText}
      style={{
        transformPerspective: 1100,
        rotateX: isHovered ? rotation.x : 0,
        rotateY: isHovered ? rotation.y : 0,
        scale: isHovered ? 1.025 : 1,
        transition: isHovered ? 'rotateX 0.1s ease, rotateY 0.1s ease' : 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
        height: '100%'
      }}
      className={className}
    >
      <Box sx={{ ...sx, transform: 'translateZ(20px)', height: '100%' }}>
        {children}
      </Box>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(null);
  const [userId] = useState(1);
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Theme aesthetic option: 'cyber' (Cyber Neon Obsidian), 'glass' (Glass Aurora), 'clean' (Modern Light)
  const [designTheme, setDesignTheme] = useState(() => {
    return localStorage.getItem('fl_design_theme') || 'cyber';
  });

  // Parallax & Scroll Telemetry
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heroParallaxY = useTransform(scrollYProgress, [0, 0.5], [0, -120]);

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

  // Interactive Projects / Curriculum Vector List
  const projectsList = [
    {
      id: 'cs-algo',
      title: 'CS / Advanced Algorithms & Data Structures',
      subtitle: 'Graph Theory & Dynamic Programming Curriculum',
      icon: <CodeIcon sx={{ fontSize: 32, color: '#6366f1' }} />,
      color: '#6366f1',
      badge: '🎯 ACTIVE CURRICULUM',
      progress: 84,
      details: 'Deep dive into Bellman-Ford shortest path algorithms, dynamic programming table construction, and self-balancing red-black tree structures. Includes 4 interactive virtual labs and 12 real-time code evaluation exercises.',
      metrics: [
        { label: 'Completion Rate', val: '84%' },
        { label: 'Virtual Labs Ready', val: '4 Active' },
        { label: 'Mastery Score', val: '96/100' }
      ]
    },
    {
      id: 'ece-circuits',
      title: 'ECE / Quantum Circuit & Network Synthesis',
      subtitle: 'Two-Port Parameters & Frequency Response Analysis',
      icon: <MemoryIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      badge: '⚡ SYNCED LAB',
      progress: 68,
      details: 'Comprehensive study of s-domain transfer functions, resonant RLC network damping, and operational amplifier circuit stability analysis. Integrated directly with interactive circuit simulator labs.',
      metrics: [
        { label: 'Completion Rate', val: '68%' },
        { label: 'Virtual Labs Ready', val: '6 Active' },
        { label: 'Mastery Score', val: '91/100' }
      ]
    },
    {
      id: 'cyber-sec',
      title: 'Systems / Kernel Security & Applied Cryptography',
      subtitle: 'Zero-Trust Architecture & Elliptic Curve Protocols',
      icon: <SecurityIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      color: '#10b981',
      badge: '🛡️ SECURITY LAB',
      progress: 92,
      details: 'Master buffer overflow mitigation, TLS 1.3 cryptographic handshake protocols, and zero-knowledge proof verification. Features live simulation challenges and defensive coding workshops.',
      metrics: [
        { label: 'Completion Rate', val: '92%' },
        { label: 'Virtual Labs Ready', val: '5 Active' },
        { label: 'Mastery Score', val: '98/100' }
      ]
    }
  ];

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
          height: '3.5px',
          background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 50%, #f59e0b 100%)',
          transformOrigin: '0%',
          zIndex: 1200,
          boxShadow: '0 0 14px rgba(99, 102, 241, 0.6)'
        }}
      />

      {/* Background Matrix Grid */}
      <Box className="epic-matrix-grid" />

      <Container maxWidth="xl" sx={{ pt: 8, pb: 16, px: { xs: 2.5, md: 6 } }}>
        
        {/* HERO SECTION: Staggered Headline + Parallax Shift */}
        <motion.div style={{ y: heroParallaxY }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: 4,
            mb: 8, 
            p: { xs: 4, md: 6 }, 
            borderRadius: '24px',
            bgcolor: 'rgba(17, 24, 39, 0.75)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Luminous Background Orb */}
            <Box sx={{
              position: 'absolute',
              top: '-30%',
              left: '20%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none'
            }} />

            <Box sx={{ zIndex: 2, maxWidth: 860 }}>
              <Box display="flex" alignItems="center" gap={1.8} mb={2.5}>
                <span className="epic-badge-glow" style={{ borderColor: '#6366f1', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)' }}>
                  <span className="pulse-dot-cyan" style={{ background: '#6366f1' }} /> Academic Studio v2.4
                </span>
                <span className="epic-badge-purple" style={{ borderColor: '#8b5cf6', color: '#d8b4fe', background: 'rgba(139, 92, 246, 0.15)' }}>
                  <ShieldIcon sx={{ fontSize: 14 }} /> Focus Shield Active
                </span>
                <span className="epic-badge-emerald">
                  <EmojiEventsIcon sx={{ fontSize: 14 }} /> Adaptive Pathways
                </span>
              </Box>

              <Typography variant="h1" component="h1" sx={{ 
                fontFamily: 'Outfit, sans-serif', 
                fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4.2rem' },
                fontWeight: 800,
                lineHeight: 1.08,
                mb: 3,
                letterSpacing: '-0.03em',
                color: '#ffffff'
              }}>
                FocusLearner <span style={{ color: '#6366f1' }}>Study & Mastery Studio</span>
              </Typography>

              <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 400, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', lineHeight: 1.7, maxWidth: 780 }}>
                A distraction-free, adaptive study environment engineered for deep concentration, interactive circuit & code labs, and structured knowledge mastery without visual clutter.
              </Typography>
            </Box>

            {/* Design Atmosphere Selector */}
            <Box sx={{ 
              zIndex: 2,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              gap: 1.5,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <PaletteIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#cbd5e1', letterSpacing: '0.04em' }}>
                  STUDY ENVIRONMENT:
                </Typography>
              </Box>
              <Box display="flex" gap={1.2}>
                {[
                  { id: 'cyber', label: '🌙 Scholar Slate', color: '#6366f1' },
                  { id: 'glass', label: '🌌 Deep Navy', color: '#8b5cf6' },
                  { id: 'clean', label: '💎 Clean Modern', color: '#3b82f6' }
                ].map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    onClick={() => handleThemeChange(t.id)}
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: '0.85rem',
                      px: 1.2,
                      py: 2.2,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      bgcolor: designTheme === t.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: designTheme === t.id ? '#ffffff' : '#94a3b8',
                      border: designTheme === t.id ? `1px solid ${t.color}` : '1px solid rgba(255,255,255,0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Continuous Journey Connector Line */}
        <Box className="epic-journey-connector" sx={{ mb: 6 }} />

        {/* Active Study Session Banner */}
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box sx={{
              p: { xs: 4, md: 5 },
              mb: 8,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.2) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 4
            }}>
              <Box sx={{ zIndex: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box className="pulse-dot-cyan" style={{ background: '#6366f1' }} />
                  <Typography variant="overline" sx={{ fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.82rem', letterSpacing: '0.08em', color: '#a5b4fc' }}>
                    ACTIVE FOCUS PERIOD IN PROGRESS
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', fontSize: { xs: '2rem', md: '2.5rem' }, mb: 1.2, color: '#ffffff' }}>
                  Current Subject: <span style={{ color: '#818cf8' }}>{currentSession.subject_focus}</span>
                </Typography>
                <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 400, maxWidth: 700, lineHeight: 1.6, fontSize: '1.05rem' }}>
                  Distraction filtering is active. Resume your study session directly where you left off.
                </Typography>
              </Box>

              <Box sx={{ zIndex: 2 }}>
                <Button
                  onClick={() => navigate('/player')}
                  variant="contained"
                  sx={{ 
                    bgcolor: '#6366f1', 
                    color: '#ffffff', 
                    fontSize: '1.05rem', 
                    py: 1.8, 
                    px: 4, 
                    borderRadius: '12px',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#4f46e5' } 
                  }}
                >
                  Resume Study Stream →
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Section Heading: Core Study Tools */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2, color: '#ffffff' }}>
              <BoltIcon sx={{ color: '#6366f1', fontSize: 32 }} /> Essential Study & Focus Modules
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              SYSTEM STATUS: OPERATIONAL
            </Typography>
          </Box>
        </motion.div>

        {/* Main 3 Core Modules Grid */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {/* Module 1: Focus Lock Shield */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <TiltCard className={getCardStyleClass()}>
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                      <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)'
                      }}>
                        <LockIcon sx={{ fontSize: 32, color: '#818cf8' }} />
                      </Box>
                      <span className="epic-badge-glow" style={{ borderColor: '#6366f1', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)' }}>🔒 FOCUS SHIELD</span>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1.8, color: '#ffffff' }}>
                      Focus Lock Protocol
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1rem' }}>
                      Lock your concentration onto a dedicated study subject. Automatic filtering isolates you from social feeds, non-academic sites, and alerts.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    onClick={() => navigate('/focus')}
                    variant="outlined"
                    sx={{ 
                      py: 1.5, 
                      fontSize: '0.98rem', 
                      fontWeight: 600,
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                      color: '#a5b4fc',
                      borderRadius: '10px',
                      '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' }
                    }}
                  >
                    Configure Focus Shield →
                  </Button>
                </Box>
              </TiltCard>
            </motion.div>
          </Grid>

          {/* Module 2: Interactive Lectures & AI Tutor */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <TiltCard className={getCardStyleClass()}>
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                      <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)'
                      }}>
                        <PlayArrowIcon sx={{ fontSize: 34, color: '#c4b5fd' }} />
                      </Box>
                      <span className="epic-badge-purple" style={{ borderColor: '#8b5cf6', color: '#d8b4fe', background: 'rgba(139, 92, 246, 0.15)' }}>📖 SMART LECTURES</span>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1.8, color: '#ffffff' }}>
                      Interactive Study Player
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1rem' }}>
                      Watch high-definition academic lectures synchronized with interactive transcripts, automated note-taking, and contextual conceptual search.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    onClick={() => navigate('/player')}
                    variant="contained"
                    sx={{ 
                      py: 1.5, 
                      fontSize: '0.98rem', 
                      fontWeight: 600,
                      bgcolor: '#8b5cf6',
                      color: '#ffffff',
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#7c3aed' }
                    }}
                  >
                    Open Study Player →
                  </Button>
                </Box>
              </TiltCard>
            </motion.div>
          </Grid>

          {/* Module 3: Interactive Practice & Labs */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <TiltCard className={getCardStyleClass()}>
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
                      <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                      }}>
                        <GamesIcon sx={{ fontSize: 32, color: '#34d399' }} />
                      </Box>
                      <span className="epic-badge-emerald">🧪 PRACTICE LABS</span>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 1.8, color: '#ffffff' }}>
                      Interactive Practice Arena
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 4, fontSize: '1rem' }}>
                      Solidify your understanding through virtual lab simulations, interactive problem-solving exercises, and topic-locked comprehension checkpoints.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    onClick={() => navigate('/games')}
                    variant="outlined"
                    sx={{ 
                      py: 1.5, 
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      borderColor: 'rgba(16, 185, 129, 0.5)',
                      color: '#6ee7b7',
                      borderRadius: '10px',
                      '&:hover': {
                        borderColor: '#10b981',
                        bgcolor: 'rgba(16, 185, 129, 0.1)'
                      }
                    }}
                  >
                    Enter Practice Labs →
                  </Button>
                </Box>
              </TiltCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Section Heading: Curriculum Execution */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box mb={5}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2, color: '#ffffff' }}>
                <RocketLaunchIcon sx={{ color: '#f59e0b', fontSize: 32 }} /> Active Study Curriculums
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                CLICK ANY SUBJECT TO INSPECT SYLLABUS
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: 750 }}>
              Inspect detailed course progress and lab readiness. Click any subject card below to expand syllabus topics and performance analytics directly inside your study view.
            </Typography>
          </Box>
        </motion.div>

        {/* Staggered Interactive Projects Accordion / Layout Expansion */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {projectsList.map((project) => {
            const isExpanded = expandedProject === project.id;
            return (
              <motion.div
                key={project.id}
                layout
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                style={{
                  borderRadius: '18px',
                  cursor: 'pointer'
                }}
                className={getCardStyleClass()}
              >
                <motion.div layout sx={{ p: { xs: 3, md: 4.5 } }}>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3}>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box sx={{
                        width: 58,
                        height: 58,
                        borderRadius: '14px',
                        background: `radial-gradient(circle, ${project.color}25 0%, rgba(15, 23, 42, 0.9) 100%)`,
                        border: `1px solid ${project.color}50`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {project.icon}
                      </Box>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1.5} mb={0.6}>
                          <span style={{ 
                            color: project.color, 
                            fontFamily: 'Plus Jakarta Sans, sans-serif', 
                            fontSize: '0.8rem', 
                            fontWeight: 700,
                            letterSpacing: '0.04em' 
                          }}>
                            {project.badge}
                          </span>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', fontSize: { xs: '1.3rem', md: '1.65rem' } }}>
                          {project.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.98rem', mt: 0.4 }}>
                          {project.subtitle}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={4}>
                      <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>
                          PROGRESS
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: project.color }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProject(isExpanded ? null : project.id);
                        }}
                        sx={{
                          borderRadius: '10px',
                          borderColor: `${project.color}50`,
                          color: project.color,
                          fontWeight: 600,
                          px: 2.5,
                          py: 1
                        }}
                      >
                        {isExpanded ? 'Collapse ↑' : 'Inspect Details ↓'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Smooth In-Place Detail Reveal */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Box sx={{ pt: 3.5, mt: 3.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8, mb: 3.5, fontSize: '1.02rem', maxWidth: 900 }}>
                            {project.details}
                          </Typography>

                          <Grid container spacing={3} sx={{ mb: 3.5 }}>
                            {project.metrics.map((m, idx) => (
                              <Grid item xs={12} sm={4} key={idx}>
                                <Box sx={{
                                  p: 2.5,
                                  borderRadius: '14px',
                                  bgcolor: 'rgba(15, 23, 42, 0.6)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  textAlign: 'center'
                                }}>
                                  <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, letterSpacing: '0.04em' }}>
                                    {m.label}
                                  </Typography>
                                  <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: project.color, mt: 0.6 }}>
                                    {m.val}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>

                          <Box display="flex" gap={2}>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/player');
                              }}
                              variant="contained"
                              sx={{ 
                                bgcolor: project.color, 
                                color: '#ffffff', 
                                py: 1.4, 
                                px: 3, 
                                borderRadius: '10px',
                                fontWeight: 600,
                                '&:hover': { opacity: 0.9 }
                              }}
                            >
                              Launch Course Stream →
                            </Button>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </Box>

      </Container>
    </Box>
  );
};

export default Dashboard;

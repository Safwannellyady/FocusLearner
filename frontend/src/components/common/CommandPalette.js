import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, TextField, Typography, Chip, IconButton, CircularProgress, Divider, Paper } from '@mui/material';
import { Search, AutoAwesome, School, Launch, Close, ArrowForward, Bolt } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else if (onNavigate) {
          // Trigger modal opening from layout if closed
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const quickLinks = [
    { label: 'Collaborative Study Arena & Discussions', path: '/arena', icon: <Launch fontSize="small" /> },
    { label: 'Interactive Knowledge Graph', path: '/dashboard', icon: <School fontSize="small" /> },
    { label: 'Smart Pomodoro Studio', path: '/focus', icon: <Bolt fontSize="small" /> },
    { label: 'AI Coding Arena & Games', path: '/games', icon: <AutoAwesome fontSize="small" /> },
    { label: 'Session Vault & RAG Documents', path: '/vault', icon: <Search fontSize="small" /> }
  ];

  const filteredLinks = quickLinks.filter(l => l.label.toLowerCase().includes(query.toLowerCase()));

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setLoadingAi(true);
    setAiAnswer(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/chat/send`, {
        message: query.trim(),
        context: 'Quick Command Palette Instant RAG Query'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setAiAnswer(res.data.response || res.data.message || 'No instant response generated.');
    } catch (err) {
      console.error('Command Palette AI error:', err);
      setAiAnswer('AI Tutor currently offline. Please check network connection or Gemini API key.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleLinkClick = (path) => {
    if (onNavigate) onNavigate(path);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          color: '#fff',
          p: 1
        }
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Search sx={{ color: '#6366f1', fontSize: 26 }} />
          <TextField
            autoFocus
            fullWidth
            placeholder="Type navigation shortcut or ask AI Tutor an instant question... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600 }
            }}
          />
          <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2.5 }} />

        {/* Instant AI Question Action Bar */}
        {query.trim().length > 2 && (
          <Box sx={{ mb: 3 }}>
            <Paper
              onClick={handleAskAI}
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)',
                border: '1px solid #6366f1',
                borderRadius: 2.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AutoAwesome sx={{ color: '#818cf8', fontSize: 22 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    Instant Ask AI Tutor: "{query}"
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    Press Enter or click to generate an instant RAG briefing
                  </Typography>
                </Box>
              </Box>
              {loadingAi ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <ArrowForward sx={{ color: '#818cf8' }} />}
            </Paper>

            {aiAnswer && (
              <Box sx={{ mt: 2, p: 2.5, background: 'rgba(30, 41, 59, 0.8)', borderRadius: 2.5, borderLeft: '3px solid #10b981', maxHeight: 300, overflowY: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  ✨ Instant AI Tutor Briefing:
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {aiAnswer}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Quick Navigation Shortcuts */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
          Quick Navigation & Workspaces
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredLinks.map((link, idx) => (
            <Box
              key={idx}
              onClick={() => handleLinkClick(link.path)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  background: 'rgba(30, 41, 59, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ color: '#818cf8' }}>{link.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                  {link.label}
                </Typography>
              </Box>
              <Chip label={link.path} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem' }} />
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;

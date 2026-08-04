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
  Alert,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion } from 'framer-motion';
import { gameAPI } from '../services/api';
import ActivityView from './ActivityView';
import Leaderboard from './Leaderboard';

const GameLab = ({ embedded = false, subject: propSubject, topic: propTopic, gameConfig = null }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null); // The current AI activity object
  const [customSubject, setCustomSubject] = useState('General');
  const [customTopic, setCustomTopic] = useState('');

  // Dialog for Activity View
  const [activityOpen, setActivityOpen] = useState(false);
  const [result, setResult] = useState(null);

  const handleStartChallenge = async (subject, type = 'auto', topic = propTopic || 'General Practice') => {
    setLoading(true);
    setResult(null);
    try {
      if (gameConfig && gameConfig.trivia_list && gameConfig.trivia_list.length > 0) {
        setActiveActivity({
          challenge_id: `deep_learned_${Date.now()}`,
          type: 'quiz',
          title: gameConfig.title || `${topic} Arena Challenge`,
          questions: gameConfig.trivia_list,
          points: gameConfig.xp_reward || 150
        });
        setActivityOpen(true);
        setLoading(false);
        return;
      }
      const response = await gameAPI.generateChallenge(subject, 1, topic, null);
      if (response.data.challenge) {
        setActiveActivity(response.data.challenge);
        setActivityOpen(true);
      } else {
        alert("Could not load challenge.");
      }
    } catch (error) {
      console.error("Failed to generate activity", error);
      alert("Could not generate a challenge right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async (answer, violationCount = 0) => {
    try {
      const response = await gameAPI.submitActivity(activeActivity.challenge_id, answer, violationCount);
      setResult(response.data.result);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Error submitting answer. Please try again.");
    }
  };

  const handleNext = () => {
    setActivityOpen(false);
    setResult(null);
    setActiveActivity(null);
  };

  return (
    <Container maxWidth={embedded ? false : "xl"} disableGutters={embedded} sx={{ mt: embedded ? 1 : 4, mb: embedded ? 1 : 4 }}>
      {!embedded && (
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
            Gamified <span style={{ color: '#a78bfa' }}>Learning Lab</span>
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' } }}
        >
          <Tab label="Challenges & Labs" icon={<AutoAwesomeIcon />} iconPosition="start" />
          <Tab label="Global Leaderboard" icon={<EmojiEventsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <Grid container spacing={4}>
          {/* 1. Quick Start AI Challenge */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" color="white" gutterBottom mb={3}>choose Your Path</Typography>
            <Grid container spacing={3}>
              {propSubject ? (
                <Grid item xs={12} sm={6}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(30,58,138,0.4) 100%)',
                      border: '2px solid #38bdf8',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'visible'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -10,
                        right: 20,
                        background: '#38bdf8',
                        color: '#000',
                        fontWeight: 'bold',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}>
                        ACTIVE SESSION
                      </Box>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" color="white" gutterBottom>
                          {propTopic || 'Session Core'} Challenge
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          Personalized AI challenge synced with your active lesson: {propTopic || propSubject}.
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleStartChallenge(propSubject, 'auto', propTopic)}
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
                            textTransform: 'none',
                            py: 1.5
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Challenge'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ) : null}
              
              <Grid item xs={12} sm={propSubject ? 6 : 12}>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(30,30,50,0.9) 0%, rgba(20,20,30,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: -10,
                      right: 20,
                      background: '#a78bfa',
                      color: '#000',
                      fontWeight: 'bold',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      AI GENERATOR
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" color="white" gutterBottom>
                        Deep Learning Instance
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Input any subject and topic. Our AI will analyze the concept and dynamically construct an interactive challenge.
                      </Typography>
                      
                      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
                        <TextField 
                          fullWidth
                          size="small"
                          label="Subject (e.g. Physics)"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { color: 'white' },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                          }}
                        />
                        <TextField 
                          fullWidth
                          size="small"
                          label="Topic (e.g. Quantum Mechanics)"
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { color: 'white' },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                          }}
                        />
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleStartChallenge(customSubject, 'auto', customTopic)}
                        disabled={loading || !customTopic}
                        sx={{
                          background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)',
                          textTransform: 'none',
                          py: 1.5
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate AI Challenge'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>

          {/* 2. Mini Leaderboard Preview */}
          <Grid item xs={12} md={4}>
            <Leaderboard moduleId="global" />
          </Grid>
        </Grid>
      ) : (
        /* Full Leaderboard Tab */
        <Box>
          <Leaderboard moduleId="global" />
        </Box>
      )}

      {/* Activity Player Dialog */}
      <Dialog
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f0f15',
            color: 'white',
            minHeight: '80vh',
            borderRadius: 2
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {activeActivity && (
            <Box sx={{ p: 3 }}>
              {!result && (
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Chip label={activeActivity.subject} color="primary" variant="outlined" />
                  <Button onClick={() => setActivityOpen(false)} color="error">Quit Activity</Button>
                </Box>
              )}
              <ActivityView
                activity={activeActivity}
                onSubmit={handleActivitySubmit}
                result={result}
                onNext={handleNext}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default GameLab;

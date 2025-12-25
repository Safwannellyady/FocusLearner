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
  DialogContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion } from 'framer-motion';
import { gameAPI } from '../services/api';
import ActivityView from './ActivityView';
import Leaderboard from './Leaderboard';

const GameLab = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null); // The current AI activity object

  // Dialog for Activity View
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    // Initial load logic if needed
  }, []);

  const handleStartChallenge = async (subject, type = 'auto') => {
    setLoading(true);
    try {
      // 1. Generate Activity via AI
      const response = await gameAPI.generateActivity(subject, "General Practice", type);
      if (response.data.activity) {
        setActiveActivity({ ...response.data.activity, subject });
        setActivityOpen(true);
      }
    } catch (error) {
      console.error("Failed to generate activity", error);
      alert("Could not generate a challenge right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async (answer) => {
    try {
      const response = await gameAPI.submitActivity(activeActivity.challenge_id, answer);
      const result = response.data.result;

      let message = "";
      if (result.is_correct) {
        message = `Success! +${result.xp_earned} XP.\nMastery: ${result.mastery_state} (${result.new_proficiency}%)`;
      } else {
        message = `Not quite. Score: ${Math.floor(result.score * 100)}%. +${result.xp_earned} XP.\nFeedback: ${result.feedback}`;
      }

      alert(message);
      setActivityOpen(false);
      setActiveActivity(null);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Error submitting answer. Please try again.");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
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
              {['CS/Algorithms', 'Science/Physics', 'Language/English'].map((subject, idx) => (
                <Grid item xs={12} sm={6} key={subject}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                        AI GENERATED
                      </Box>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" color="white" gutterBottom>
                          {subject.split('/')[1]} Challenge
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          {subject.includes('CS') ? 'Solve coding problems with real-time testing.' :
                            subject.includes('Science') ? 'Perform virtual experiments in a simulated lab.' :
                              'Master vocabulary with interactive puzzles.'}
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleStartChallenge(subject)}
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)',
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
              ))}
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
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Chip label={activeActivity.subject} color="primary" variant="outlined" />
                <Button onClick={() => setActivityOpen(false)} color="error">Quit Activity</Button>
              </Box>
              <ActivityView activity={activeActivity} onSubmit={handleActivitySubmit} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default GameLab;

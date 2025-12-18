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
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GamesIcon from '@mui/icons-material/Games';
import { focusAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(null);
  const [userId] = useState(1); // In production, get from auth context

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

  const subjectOptions = [
    'ECE/Network Analysis',
    'ECE/Circuit Theory',
    'CS/Algorithms',
    'CS/Data Structures',
    'Math/Linear Algebra',
    'Math/Calculus',
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        FocusLearner Pro
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
        Unified, Contextual, and Gamified Learning Ecosystem
      </Typography>

      {currentSession && (
        <Paper sx={{ p: 3, mt: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            Active Focus Session
          </Typography>
          <Typography variant="body1">
            Subject: <strong>{currentSession.subject_focus}</strong>
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/player')}
            sx={{ mt: 2 }}
          >
            Continue Learning
          </Button>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LockIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Focus Lock</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Lock your focus on a specific subject to enable distraction-free learning.
                The system will filter out all non-educational content.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/focus')}
              >
                Set Focus
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PlayArrowIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Video Player</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Watch educational videos with distraction-free controls and contextual
                AI tutor assistance.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/player')}
                disabled={!currentSession}
              >
                Open Player
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GamesIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Game Lab</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Engage with interactive challenges to reinforce learning through
                gamified active learning modules.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/games')}
              >
                Play Games
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;


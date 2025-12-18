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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { gameAPI } from '../services/api';

const GameLab = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const response = await gameAPI.getModules();
      setModules(response.data.modules || {});
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (moduleId) => {
    navigate(`/games/${moduleId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Game Lab</Typography>
      </Box>

      <Typography variant="body1" paragraph>
        Engage with interactive challenges to reinforce your learning through
        gamified active learning modules.
      </Typography>

      {loading ? (
        <Alert severity="info">Loading game modules...</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Auto-generated AI Challenge Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '2px solid #7c3aed' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  AI Adaptive Challenge
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  A unique, infinitely generated challenge tailored to your current focus subject.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Powered by Gemini AI
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => navigate('/games/ai-challenge')}
                  fullWidth
                >
                  Start AI Challenge
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {Object.entries(modules).map(([moduleId, module]) => (
            <Grid item xs={12} md={6} key={moduleId}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {module.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {module.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Subject: {module.subject_focus}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handlePlayGame(moduleId)}
                    fullWidth
                  >
                    Play Game
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default GameLab;


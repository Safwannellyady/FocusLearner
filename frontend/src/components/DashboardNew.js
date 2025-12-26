import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import VideoPlayer from './VideoPlayer';
import LearningHealthDashboard from './LearningHealthDashboard';
import { motion } from 'framer-motion';
import { lectureAPI, authAPI, contentAPI, gameAPI, taxonomyAPI } from '../services/api';
// NO REPLACEMENT CONTENT IN THIS TOOL CALL - SWITCHING TO MULTI_REPLACE

const DashboardNew = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    subject: '',
    topic: '',
    description: '',
  });
  const [gameProgress, setGameProgress] = useState(null);
  const [viewMode, setViewMode] = useState('lectures'); // 'lectures' | 'health'

  // Taxonomy State
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loopStates, setLoopStates] = useState({}); // { intentId: { stage: 'UNDERSTAND', ... } }

  useEffect(() => {
    loadUser();
    loadDashboardData();
  }, []);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [lecturesRes, progressRes, subjectsRes] = await Promise.all([
        lectureAPI.getAll(),
        gameAPI.getProgress(),
        taxonomyAPI.getSubjects()
      ]);
      setLectures(lecturesRes.data.lectures || []);

      // Fetch Loop States for these lectures
      const fetchedLectures = lecturesRes.data.lectures || [];
      const states = {};

      // Parallel fetch for speed
      await Promise.all(fetchedLectures.map(async (lecture) => {
        if (lecture.learning_intent_id) {
          try {
            const stateRes = await taxonomyAPI.getLoopStatus(lecture.learning_intent_id);
            states[lecture.learning_intent_id] = stateRes.data;
          } catch (e) {
            // Silence 404s or errors for clean UI
          }
        }
      }));
      setLoopStates(states);

      if (progressRes.data.progress && progressRes.data.progress.length > 0) {
        setGameProgress(progressRes.data.progress[0]);
      }

      if (subjectsRes.data.subjects) {
        setAvailableSubjects(subjectsRes.data.subjects);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubjectChange = async (subject) => {
    setNewLecture({ ...newLecture, subject, topic: '' });
    setAvailableTopics([]); // Clear previous topics
    try {
      const res = await taxonomyAPI.getTopics(subject);
      if (res.data.topics) {
        setAvailableTopics(res.data.topics);
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  const handleCreateLecture = async (overrideData = null) => {
    try {
      // Use override data if provided (for custom topic handling), otherwise usage state
      let dataToSubmit = overrideData || newLecture;

      // Handle Custom Topic Logic
      if (dataToSubmit.topic === 'custom' && dataToSubmit.customTopic) {
        dataToSubmit = { ...dataToSubmit, topic: dataToSubmit.customTopic };
      }
      // Remove temporary fields
      const { customTopic, ...finalPayload } = dataToSubmit;

      await lectureAPI.create(finalPayload);
      setCreateDialogOpen(false);
      setNewLecture({ title: '', subject: '', topic: '', description: '', customTopic: '' });
      loadDashboardData();
    } catch (err) {
      console.error('Error creating lecture:', err);
    }
  };
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={5}
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            borderRadius: 4,
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '1.5rem',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
                }}
              >
                FL
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
                FocusLearner Pro
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, ml: 1 }}>
              Welcome back, <strong>{user?.full_name || user?.username}</strong>!
            </Typography>
          </Box>

          {/* Gamification Stats Widget */}
          {gameProgress && (
            <Box sx={{
              ml: 4,
              pl: 4,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              display: { xs: 'none', md: 'block' }
            }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>LEVEL</Typography>
                  <Typography variant="h4" sx={{ color: '#a78bfa', fontWeight: 700, lineHeight: 1 }}>{gameProgress.level}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>TOTAL XP</Typography>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, lineHeight: 1 }}>{gameProgress.mastery_points}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1 }}>STREAK</Typography>
                  <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 600, lineHeight: 1 }}>{user?.streak_days || 0} 🔥</Typography>
                </Box>
              </Box>
            </Box>
          )}
          <Box>
            <IconButton onClick={() => navigate('/analytics')} sx={{ color: '#06b6d4', '&:hover': { background: 'rgba(6, 182, 212, 0.1)' } }}>
              <InsightsIcon />
            </IconButton>
            <IconButton onClick={() => navigate('/preferences')} sx={{ color: 'text.primary', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={handleLogout} sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" gap={1} bgcolor="rgba(255,255,255,0.05)" p={0.5} borderRadius={3}>
            <Button
              variant={viewMode === 'lectures' ? "contained" : "text"}
              onClick={() => setViewMode('lectures')}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                px: 3,
                bgcolor: viewMode === 'lectures' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
              }}
            >
              My Focus Sessions
            </Button>
            <Button
              variant={viewMode === 'health' ? "contained" : "text"}
              onClick={() => setViewMode('health')}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                px: 3,
                bgcolor: viewMode === 'health' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
              }}
            >
              Learning Health
            </Button>
          </Box>

          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 3, textTransform: 'none', px: 3, background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)' }}
            >
              New Lecture
            </Button>
          </Box>
        </Box>

        {viewMode === 'health' ? (
          <LearningHealthDashboard />
        ) : lectures.length > 0 ? (
          <Grid container spacing={3}>
            {lectures.map((lecture, index) => {
              const intentId = lecture.learning_intent_id;
              const loopState = intentId ? loopStates[intentId] : null;
              const currentStage = loopState ? loopState.stage : 'UNDERSTAND'; // Default

              let stageColor = 'default';
              let stageLabel = 'Watch Lecture';
              let buttonText = 'Start Learning';

              if (currentStage === 'APPLY') {
                stageColor = 'warning';
                stageLabel = 'Apply Integration';
                buttonText = 'Start Activity';
              } else if (currentStage === 'MASTERED') {
                stageColor = 'success';
                stageLabel = 'Mastered';
                buttonText = 'Review Topic';
              } else if (currentStage === 'REMEDIATE') {
                stageColor = 'error';
                stageLabel = 'Needs Review';
                buttonText = 'Watch Remediation';
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={lecture.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card sx={{
                      height: '100%',
                      background: 'rgba(20, 20, 35, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: 4,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={lecture.subject.split('/')[0]}
                              size="small"
                              sx={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                fontWeight: 600
                              }}
                            />
                            {currentStage !== 'UNDERSTAND' && (
                              <Chip
                                label={stageLabel}
                                color={stageColor}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 700, minHeight: '64px' }}>
                          {lecture.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {lecture.topic}
                        </Typography>

                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            if (currentStage === 'APPLY') {
                              // For now, redirect to a generic game activity generator. 
                              // Ideally we'd have a specific route.
                              // I'll assume /game/play exists or I'll just go to lecture for now with a param
                              navigate(`/lecture/${lecture.id}?mode=apply`);
                            } else {
                              navigate(`/lecture/${lecture.id}`);
                            }
                          }}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#8b5cf6',
                              background: 'rgba(139, 92, 246, 0.1)'
                            }
                          }}
                        >
                          {buttonText}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: 4
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your learning journey starts here.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Create First Lecture
            </Button>
          </Paper>
        )}
      </motion.div>

      {/* Create Lecture Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0a0a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Plan Your Study Session</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a subject and topic to automatically generate a curated learning path.
          </Typography>

          {/* 1. Subject Selection */}
          <FormControl fullWidth margin="normal" variant="filled">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Subject Focus</InputLabel>
            <Select
              value={newLecture.subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: 2, color: 'white' }}
            >
              {availableSubjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 2. Topic/Sub-division Selection */}
          {newLecture.subject && (
            <FormControl fullWidth margin="normal" variant="filled">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Topic / Sub-Chapter</InputLabel>
              <Select
                value={newLecture.topic}
                onChange={(e) => setNewLecture({ ...newLecture, topic: e.target.value })}
                sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: 2, color: 'white' }}
                displayEmpty
              >
                {/* Dynamic Topic Population */}
                {availableTopics.map((intent) => (
                  <MenuItem key={intent.id} value={intent.topic}>{intent.topic}</MenuItem>
                ))}
                <MenuItem value="custom"><em>+ Custom Topic</em></MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Custom Topic Input (if needed) */}
          {newLecture.topic === 'custom' && (
            <TextField
              fullWidth
              label="Enter Custom Topic"
              value={newLecture.customTopic || ''}
              onChange={(e) => setNewLecture({ ...newLecture, topic: 'custom', customTopic: e.target.value })}
              margin="normal"
              variant="filled"
              InputProps={{ sx: { background: 'rgba(255,255,255,0.05)', borderRadius: 2, color: 'white' } }}
            />
          )}

          {/* 3. Title */}
          <TextField
            fullWidth
            label="Session Title"
            placeholder="e.g., My Exam Prep"
            value={newLecture.title}
            onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
            margin="normal"
            variant="filled"
            InputProps={{ sx: { background: 'rgba(255,255,255,0.05)', borderRadius: 2, color: 'white' } }}
          />

          <TextField
            fullWidth
            label="Notes / Description (Optional)"
            value={newLecture.description}
            onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            variant="filled"
            InputProps={{ sx: { background: 'rgba(255,255,255,0.05)', borderRadius: 2, color: 'white' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            onClick={() => {
              // Resolve the final topic before calling handleCreateLecture
              const finalTopic = newLecture.topic === 'custom' ? newLecture.customTopic : newLecture.topic;
              handleCreateLecture({ ...newLecture, topic: finalTopic });
            }}
            variant="contained"
            disabled={!newLecture.title || !newLecture.subject || (!newLecture.topic && newLecture.topic !== 'custom') || (newLecture.topic === 'custom' && !newLecture.customTopic)}
            sx={{ background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)' }}
          >
            Create & Auto-Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardNew;

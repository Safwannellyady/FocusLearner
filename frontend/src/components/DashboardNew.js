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
import { motion } from 'framer-motion';
import { lectureAPI, authAPI, contentAPI } from '../services/api';
import VideoPlayer from './VideoPlayer';

const subjectOptions = [
  // Engineering
  'Engineering/Network Analysis',
  'Engineering/Circuit Theory',
  'Engineering/Algorithms',
  'Engineering/Data Structures',
  'Engineering/Thermodynamics',
  'Engineering/Fluid Mechanics',
  'Engineering/Digital Logic',

  // Medical & Science
  'Medical/Anatomy',
  'Medical/Physiology',
  'Medical/Biochemistry',
  'Medical/Pharmacology',
  'Science/Physics',
  'Science/Chemistry',
  'Science/Biology',

  // Mathematics
  'Math/Linear Algebra',
  'Math/Calculus',
  'Math/Statistics',
  'Math/Discrete Math',

  // Commerce & Business
  'Commerce/Economics',
  'Commerce/Accounting',
  'Commerce/Business Studies',
  'Commerce/Finance',
  'Commerce/Marketing',

  // Arts & Humanities
  'Arts/History',
  'Arts/Political Science',
  'Arts/Psychology',
  'Arts/Sociology',
  'Arts/Literature',
  'Arts/Philosophy',

  // Law
  'Law/Constitutional Law',
  'Law/Criminal Law',
  'Law/Contract Law',

  // Technology
  'Tech/Web Development',
  'Tech/Machine Learning',
  'Tech/Cybersecurity',

  // Languages
  'Language/English',
  'Language/Spanish',
  'Language/French',
];

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

  useEffect(() => {
    loadUser();
    loadLectures();
  }, []);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  };

  const loadLectures = async () => {
    try {
      const response = await lectureAPI.getAll();
      setLectures(response.data.lectures || []);
    } catch (err) {
      console.error('Error loading lectures:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateLecture = async () => {
    try {
      await lectureAPI.create(newLecture);
      setCreateDialogOpen(false);
      setNewLecture({ title: '', subject: '', topic: '', description: '' });
      loadLectures();
    } catch (err) {
      console.error('Error creating lecture:', err);
    }
  };
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.5))',
            borderRadius: 2,
            p: 2
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                }}
              >
                FL
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FocusLearner Pro
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Welcome back, <strong>{user?.full_name || user?.username}</strong>! Ready to learn something new today?
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={() => navigate('/preferences')} color="primary">
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={handleLogout} color="error">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)'
          }}
          elevation={0}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={3} borderBottom={1} borderColor="divider">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>My Lectures</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              New Lecture
            </Button>
          </Box>

          <Box p={2}>
            {lectures.length > 0 ? (
              <List>
                {lectures.map((lecture, index) => (
                  <motion.div
                    key={lecture.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <ListItem
                      divider={index !== lectures.length - 1}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.05)' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600">
                            {lecture.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {lecture.subject} • {lecture.topic}
                          </Typography>
                        }
                      />
                      <Chip
                        label={lecture.subject.split('/')[0]}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 2 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/lecture/${lecture.id}`)}
                      >
                        Start Learning
                      </Button>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            ) : (
              <Box p={6} textAlign="center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your learning journey starts here.
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Create your first lecture to unlock personalized videos, quizzes, and games.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Now
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Legacy Tab Content Removed */}

      {/* Create Lecture Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Lecture</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Lecture Title"
            value={newLecture.title}
            onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              value={newLecture.subject}
              label="Subject"
              onChange={(e) => setNewLecture({ ...newLecture, subject: e.target.value })}
            >
              {subjectOptions.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Topic"
            value={newLecture.topic}
            onChange={(e) => setNewLecture({ ...newLecture, topic: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newLecture.description}
            onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateLecture} variant="contained" disabled={!newLecture.title || !newLecture.subject || !newLecture.topic}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardNew;


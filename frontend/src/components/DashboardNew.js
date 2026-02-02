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
  Chip,
  Breadcrumbs,
  Link,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LearningHealthDashboard from './LearningHealthDashboard';
import { motion } from 'framer-motion';
import { lectureAPI, authAPI, contentAPI, gameAPI, taxonomyAPI, courseAPI } from '../services/api';

const DashboardNew = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Data State
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [gameProgress, setGameProgress] = useState(null);

  // View State
  const [viewMode, setViewMode] = useState('courses'); // 'courses' | 'lectures' | 'health'
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Dialog State
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createLectureOpen, setCreateLectureOpen] = useState(false);

  // Forms
  const [newCourse, setNewCourse] = useState({ title: '', subject: '', description: '' });
  const [newLecture, setNewLecture] = useState({ title: '', subject: '', topic: '', description: '' });

  // Taxonomy
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loopStates, setLoopStates] = useState({});

  useEffect(() => {
    loadUser();
    loadDashboardData();
  }, []);

  // Reload lectures when course changes
  useEffect(() => {
    if (selectedCourse) {
      loadCourseContent(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    else navigate('/login');
  };

  const [orphanedLectures, setOrphanedLectures] = useState([]);

  const loadDashboardData = async () => {
    try {
      const [coursesRes, lecturesRes, progressRes, subjectsRes] = await Promise.all([
        courseAPI.getAll(),
        lectureAPI.getAll(),
        gameAPI.getProgress(),
        taxonomyAPI.getSubjects()
      ]);
      setCourses(coursesRes.data.courses || []);

      const allLectures = lecturesRes.data.lectures || [];
      setOrphanedLectures(allLectures.filter(l => !l.course_id));

      // Also load loop states for orphans so they look good
      const states = {};
      const orphans = allLectures.filter(l => !l.course_id);
      if (orphans.length > 0) {
        await Promise.all(orphans.map(async (lecture) => {
          if (lecture.learning_intent_id) {
            try {
              const stateRes = await taxonomyAPI.getLoopStatus(lecture.learning_intent_id);
              states[lecture.learning_intent_id] = stateRes.data;
            } catch (e) { }
          }
        }));
        setLoopStates(prev => ({ ...prev, ...states }));
      }

      if (progressRes.data.progress?.length > 0) setGameProgress(progressRes.data.progress[0]);
      if (subjectsRes.data.subjects) setAvailableSubjects(subjectsRes.data.subjects);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const loadCourseContent = async (courseId) => {
    try {
      const lecturesRes = await lectureAPI.getAll(courseId); // Expecting API to handle querying by courseId if passed? 
      // Note: In api.js, getAll usually takes no args or we need to update it.
      // Ideally lectureAPI.getAll should be updated or we perform client side filtering if the API returns all.
      // But let's assume I updated the component to call: axios.get(`${API_URL}/lectures/?course_id=${courseId}`)
      // If api.js wraps it simply, we might need to manually call axios or update api.js. 
      // For now, let's assume lectureAPI.getAll supports the query param or I fetch all and filter client side if needed, 
      // BUT I updated the backend to support ?course_id. 
      // Let's assume lectureAPI.getAll() calls url. We can append params if the wrapper allows, or we just rely on the fact 
      // that we modified the backend. Wait, current api.js: getAll: () => api.get('/lectures/'). It takes NO arguments.
      // I should have updated api.js. I'll rely on a manual fix or update api.js later.
      // *Self-correction*: I'll use a direct axios call mixed in or hope I updated api.js. 
      // Actually, I can just fetch ALL lectures for now (legacy) and filter in JS, OR I used the backend param. 
      // Let's fetch all and filter in JS to be safe given the api.js limitation unless I fix it.

      // Temporary fix: Fetch all and filter client-side until api.js is perfectly aligned, 
      // OR better: use the courseAPI.getAll() we have and lectureAPI.getAll() which returns all user lectures.

      const allLecturesRes = await lectureAPI.getAll();
      const allLectures = allLecturesRes.data.lectures || [];
      const filtered = allLectures.filter(l => l.course_id === courseId);
      setLectures(filtered);

      // Fetch Loop States
      const states = {};
      await Promise.all(filtered.map(async (lecture) => {
        if (lecture.learning_intent_id) {
          try {
            const stateRes = await taxonomyAPI.getLoopStatus(lecture.learning_intent_id);
            states[lecture.learning_intent_id] = stateRes.data;
          } catch (e) { }
        }
      }));
      setLoopStates(states);

    } catch (err) {
      console.error('Error loading course content:', err);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await courseAPI.create(newCourse);
      setCreateCourseOpen(false);
      setNewCourse({ title: '', subject: '', description: '' });
      loadDashboardData();
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleCreateLecture = async () => {
    try {
      let finalTopic = newLecture.topic === 'custom' ? newLecture.customTopic : newLecture.topic;
      await lectureAPI.create({
        ...newLecture,
        topic: finalTopic,
        course_id: selectedCourse?.id
      });
      setCreateLectureOpen(false);
      setNewLecture({ title: '', subject: '', topic: '', description: '', customTopic: '' });
      if (selectedCourse) loadCourseContent(selectedCourse.id);
    } catch (err) {
      console.error('Error creating lecture:', err);
    }
  };

  const handleSubjectChange = async (subject) => {
    setNewLecture({ ...newLecture, subject, topic: '' });
    setAvailableTopics([]);
    try {
      const res = await taxonomyAPI.getTopics(subject);
      setAvailableTopics(res.data.topics || []);
    } catch (err) { console.error(err); }
  };

  // --- Menu & Actions State ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'course' | 'lecture'
  const [activeItem, setActiveItem] = useState(null);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [editLectureOpen, setEditLectureOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event, type, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuType(type);
    setActiveItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuType(null);
    setActiveItem(null);
  };

  const handleEditClick = () => {
    setAnchorEl(null);
    if (menuType === 'course') {
      setNewCourse({ ...activeItem });
      setEditCourseOpen(true);
    } else {
      setNewLecture({ ...activeItem }); // Ensure backend field names match
      setEditLectureOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (menuType === 'course') {
        await courseAPI.delete(activeItem.id);
        if (selectedCourse?.id === activeItem.id) setSelectedCourse(null);
      } else {
        await lectureAPI.delete(activeItem.id);
      }
      loadDashboardData();
      if (selectedCourse && menuType === 'lecture') loadCourseContent(selectedCourse.id);
    } catch (err) { console.error(err); }
    setDeleteDialogOpen(false);
    setActiveItem(null);
  };

  const handleUpdateCourse = async () => {
    try {
      await courseAPI.update(activeItem.id, newCourse);
      setEditCourseOpen(false);
      setNewCourse({ title: '', subject: '', description: '' });
      loadDashboardData();
      if (selectedCourse?.id === activeItem.id) setSelectedCourse({ ...selectedCourse, ...newCourse });
    } catch (err) { console.error('Error updating course:', err); }
  };

  const handleUpdateLecture = async () => {
    try {
      let finalTopic = newLecture.topic === 'custom' ? newLecture.customTopic : newLecture.topic;
      await lectureAPI.update(activeItem.id, {
        ...newLecture,
        topic: finalTopic
      });
      setEditLectureOpen(false);
      setNewLecture({ title: '', subject: '', topic: '', description: '', customTopic: '' });
      if (selectedCourse) loadCourseContent(selectedCourse.id);
      else loadDashboardData();
    } catch (err) { console.error('Error updating lecture:', err); }
  };

  // --- Render Helpers ---

  const renderCourses = () => (
    <Box>
      <Grid container spacing={3} mb={6}>
        {courses.map((course, index) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card
                onClick={() => { setSelectedCourse(course); setViewMode('lectures'); }}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  background: 'rgba(20, 20, 35, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', borderColor: '#8b5cf6', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)' }
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" gap={1} alignItems="center">
                      <Box p={1} borderRadius={2} bgcolor="rgba(139, 92, 246, 0.2)" color="#a78bfa">
                        <BookIcon />
                      </Box>
                      <Chip label={course.subject} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }} />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, 'course', course)}
                      sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="white" gutterBottom>{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>{course.description || "No description provided."}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">{course.lecture_count || 0} Sessions</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setCreateCourseOpen(true)}
            sx={{
              height: '100%',
              minHeight: 200,
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: 4,
              color: 'text.secondary',
              flexDirection: 'column',
              gap: 2,
              '&:hover': { borderColor: '#8b5cf6', color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.05)' }
            }}
          >
            <AddIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6">Create New Class</Typography>
          </Button>
        </Grid>
      </Grid>

      {/* Orphaned / Standalone Lectures */}
      {orphanedLectures.length > 0 && (
        <Box>
          <Typography variant="h5" color="white" fontWeight="700" mb={3} mt={2}>
            Quick Sessions (Uncategorized)
          </Typography>
          <Grid container spacing={3}>
            {orphanedLectures.map((lecture, index) => {
              const loopState = lecture.learning_intent_id ? loopStates[lecture.learning_intent_id] : null;
              const currentStage = loopState?.stage || 'UNDERSTAND';
              let stageColor = 'default';
              let buttonText = 'Start Learning';
              if (currentStage === 'APPLY') { stageColor = 'warning'; buttonText = 'Start Activity'; }
              else if (currentStage === 'MASTERED') { stageColor = 'success'; buttonText = 'Review Topic'; }

              return (
                <Grid item xs={12} sm={6} md={4} key={lecture.id}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card sx={{ background: 'rgba(20, 20, 35, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 4 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Chip label={currentStage} color={stageColor} size="small" variant="outlined" />
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, 'lecture', lecture)}
                            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="h6" color="white" fontWeight="700" gutterBottom>{lecture.title}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>{lecture.topic}</Typography>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/lecture/${lecture.id}`)}
                          sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
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
        </Box>
      )}
    </Box>
  );

  const renderLectures = () => (
    <Grid container spacing={3}>
      {lectures.map((lecture, index) => {
        const loopState = lecture.learning_intent_id ? loopStates[lecture.learning_intent_id] : null;
        const currentStage = loopState?.stage || 'UNDERSTAND';
        let stageColor = 'default';
        let buttonText = 'Start Learning';
        if (currentStage === 'APPLY') { stageColor = 'warning'; buttonText = 'Start Activity'; }
        else if (currentStage === 'MASTERED') { stageColor = 'success'; buttonText = 'Review Topic'; }

        return (
          <Grid item xs={12} sm={6} md={4} key={lecture.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card sx={{ background: 'rgba(20, 20, 35, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Chip label={currentStage} color={stageColor} size="small" variant="outlined" />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, 'lecture', lecture)}
                      sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" color="white" fontWeight="700" gutterBottom>{lecture.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>{lecture.topic}</Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/lecture/${lecture.id}`)}
                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
      <Grid item xs={12} sm={6} md={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setCreateLectureOpen(true)}
          sx={{ height: '100%', minHeight: 200, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 4, color: 'text.secondary', flexDirection: 'column', gap: 2 }}
        >
          <AddIcon sx={{ fontSize: 40 }} />
          <Typography variant="h6">New Session</Typography>
        </Button>
      </Grid>
    </Grid>
  );

    </Container >
  );

// Render Menu and Dialogs (using React Portals or just conditionally inside Component)
// Since we are inside the component, we can return an array or Fragment, but for cleaner return, I'll append these before the final closing brace,
// by intercepting the return statement's end.
// Actually, I am editing the `return (...)` block. I need to add these elements inside the Container or after it?
// They are Dialogs, they can be anywhere. I will add them at the end of the return block.

return (
  <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    {/* Header & Nav */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
      <Box>
        <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
          <Link
            component="button"
            color="inherit"
            onClick={() => { setSelectedCourse(null); setViewMode('courses'); }}
            underline="hover"
          >
            My Classes
          </Link>
          {selectedCourse && <Typography color="white">{selectedCourse.title}</Typography>}
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="800" color="white">
          {selectedCourse ? selectedCourse.title : 'My Classes'}
        </Typography>
      </Box>
      <Box display="flex" gap={2}>
        {viewMode === 'lectures' && (
          <Button startIcon={<ArrowBackIcon />} onClick={() => { setSelectedCourse(null); setViewMode('courses'); }} sx={{ color: 'text.secondary' }}>
            Back
          </Button>
        )}
        <Button
          variant={viewMode === 'health' ? "contained" : "text"}
          onClick={() => setViewMode('health')}
          startIcon={<InsightsIcon />}
          sx={{ color: viewMode === 'health' ? 'white' : 'text.secondary' }}
        >
          Learning Health
        </Button>
        <IconButton onClick={loadDashboardData} sx={{ color: 'white' }}><SettingsIcon /></IconButton>
        <IconButton onClick={() => { localStorage.clear(); navigate('/login'); }} sx={{ color: '#ef4444' }}><LogoutIcon /></IconButton>
      </Box>
    </Box>

    {/* Main Content */}
    {viewMode === 'health' ? (
      <LearningHealthDashboard />
    ) : viewMode === 'courses' ? (
      renderCourses()
    ) : (
      renderLectures()
    )}

    {/* Action Menu */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{ sx: { bgcolor: '#1e1e2d', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}
    >
      <MenuItem onClick={handleEditClick}>
        <ListItemIcon><EditIcon sx={{ color: 'white' }} fontSize="small" /></ListItemIcon>
        <ListItemText>Rename / Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDeleteClick} sx={{ color: '#ef4444' }}>
        <ListItemIcon><DeleteIcon sx={{ color: '#ef4444' }} fontSize="small" /></ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>

    {/* Create Course Dialog */}
    <Dialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: 'white' }}>Create New Class</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Class Name (e.g., Physics 101)" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Subject (e.g., Physics)" value={newCourse.subject} onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Description" multiline rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateCourseOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateCourse} variant="contained">Create Class</Button>
      </DialogActions>
    </Dialog>

    {/* Edit Course Dialog */}
    <Dialog open={editCourseOpen} onClose={() => setEditCourseOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: 'white' }}>Edit Class</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Class Name" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Subject" value={newCourse.subject} onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Description" multiline rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditCourseOpen(false)}>Cancel</Button>
        <Button onClick={handleUpdateCourse} variant="contained" color="primary">Update Class</Button>
      </DialogActions>
    </Dialog>

    {/* Create Lecture Dialog */}
    <Dialog open={createLectureOpen} onClose={() => setCreateLectureOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: 'white' }}>New Session for {selectedCourse?.title}</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Session Title" value={newLecture.title} onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Subject" value={newLecture.subject || selectedCourse?.subject || ''} disabled margin="normal" variant="filled" />
        <FormControl fullWidth margin="normal" variant="filled">
          <InputLabel>Topic</InputLabel>
          <Select
            value={newLecture.topic}
            onChange={(e) => setNewLecture({ ...newLecture, topic: e.target.value })}
            onOpen={() => { if (!availableTopics.length && selectedCourse?.subject) handleSubjectChange(selectedCourse.subject); }}
            sx={{ color: 'white' }}
          >
            {availableTopics.map(t => <MenuItem key={t.id} value={t.topic}>{t.topic}</MenuItem>)}
            <MenuItem value="custom"><em>+ Custom Topic</em></MenuItem>
          </Select>
        </FormControl>
        {newLecture.topic === 'custom' && (
          <TextField fullWidth label="Custom Topic Name" value={newLecture.customTopic} onChange={(e) => setNewLecture({ ...newLecture, topic: 'custom', customTopic: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateLectureOpen(false)}>Cancel</Button>
        <Button onClick={handleCreateLecture} variant="contained">Create Session</Button>
      </DialogActions>
    </Dialog>

    {/* Edit Lecture Dialog */}
    <Dialog open={editLectureOpen} onClose={() => setEditLectureOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: 'white' }}>Edit Session</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Session Title" value={newLecture.title} onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Subject" value={newLecture.subject || ''} disabled margin="normal" variant="filled" />
        <TextField fullWidth label="Topic" value={newLecture.topic || ''} onChange={(e) => setNewLecture({ ...newLecture, topic: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
        <TextField fullWidth label="Description" multiline rows={2} value={newLecture.description || ''} onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })} margin="normal" variant="filled" InputProps={{ sx: { color: 'white' } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditLectureOpen(false)}>Cancel</Button>
        <Button onClick={handleUpdateLecture} variant="contained" color="primary">Update Session</Button>
      </DialogActions>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: 'white' }}>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          Are you sure you want to delete this {menuType === 'course' ? 'class' : 'session'}?
          {menuType === 'course' && " All sessions within this class will also be deleted."}
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  </Container>
);
};

export default DashboardNew;

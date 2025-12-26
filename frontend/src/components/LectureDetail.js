import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import ScienceIcon from '@mui/icons-material/Science';
import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { lectureAPI, contentAPI, focusAPI, gameAPI, taxonomyAPI } from '../services/api';
import GameLab from './GameLab';
import ActivityView from './ActivityView';
import VideoPlayer from './VideoPlayer';
import AIChatWidget from './AIChatWidget';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [activeTab, setActiveTab] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Gatekeeping State
  const [mastery, setMastery] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [gateActivity, setGateActivity] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateResult, setGateResult] = useState(null);
  const [loopStatus, setLoopStatus] = useState(null);

  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        // Fetch lecture details
        const lectureRes = await lectureAPI.getById(id);
        const lectureData = lectureRes.data.lecture;
        setLecture(lectureData);

        // Fetch Loop Status
        if (lectureData.learning_intent_id) {
          try {
            const loopRes = await taxonomyAPI.getLoopStatus(lectureData.learning_intent_id);
            setLoopStatus(loopRes.data);
          } catch (e) {
            console.warn("Failed to load loop status", e);
          }
        }

        // Fetch related videos based on lecture subject/topic
        if (lectureData) {
          // 1. Check Mastery to see if content should be locked
          try {
            const masteryRes = await gameAPI.getMastery(lectureData.subject, lectureData.topic);
            const mState = masteryRes.data.mastery;
            setMastery(mState);

            if (mState.proficiency < 30) {
              setIsLocked(true);
            }
          } catch (e) {
            console.warn("Failed to check mastery", e);
          }

          const searchQuery = `${lectureData.subject} ${lectureData.topic}`;
          const videoRes = await contentAPI.search('', lectureData.subject);
          const fetchedVideos = videoRes.data.results || [];
          setVideos(fetchedVideos);

          if (fetchedVideos.length > 0) {
            setActiveVideo(fetchedVideos[0]);
          }
        }
      } catch (error) {
        console.error("Error loading lecture details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLectureData();
    }
  }, [id]);

  const handleStartQuiz = async () => {
    try {
      // Basic Quiz Generation
      const res = await lectureAPI.generateQuiz(lecture.subject, lecture.topic, 5);
      if (res.data.quiz) {
        setQuiz(res.data.quiz);
        setShowQuiz(true);
      }
    } catch (e) {
      console.error("Quiz failed", e);
    }
  };

  const handleQuizSubmit = () => {
    setQuizResult({ score: 4, total: 5 });
  };

  const handleGateUnlock = async () => {
    try {
      const type = lecture.subject.includes("CS") ? 'coding' : 'lab';
      const res = await gameAPI.generateActivity(lecture.subject, lecture.topic, type);
      setGateActivity(res.data.activity);
      setGateOpen(true);
    } catch (e) {
      alert("Could not generate entrance gate. Please try again.");
    }
  };

  const handleGateSubmit = async (answer, violationCount = 0) => {
    try {
      const response = await gameAPI.submitActivity(gateActivity.challenge_id, answer, violationCount);
      const res = response.data.result;
      setGateResult(res);

      if (res.is_correct) {
        setIsLocked(false);
        setMastery({ ...mastery, proficiency: res.new_proficiency, state: res.mastery_state });
      }
    } catch (e) {
      console.error(e);
      alert("Submission error");
    }
  };

  const handleGateNext = () => {
    setGateOpen(false);
    setGateResult(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderRightColumnContent = () => {
    switch (activeTab) {
      case 0: // Testing Lab
        return (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>Testing Lab</Typography>
            {!showQuiz ? (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">Unit Test: {lecture?.topic}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Test your knowledge on {lecture?.topic} with a quick AI-generated quiz.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 1 }} size="small" onClick={handleStartQuiz}>
                    Start AI Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {quizResult ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You scored {quizResult.score} out of {quizResult.total}!
                    <Button size="small" onClick={() => setShowQuiz(false)} sx={{ ml: 2 }}>Close</Button>
                  </Alert>
                ) : (
                  <Box>
                    {quiz?.map((q, index) => (
                      <Card key={q.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1">{index + 1}. {q.question}</Typography>
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            {q.options.map((opt) => (
                              <Grid item xs={12} key={opt}>
                                <Button
                                  variant={quizAnswers[q.id] === opt ? "contained" : "outlined"}
                                  fullWidth
                                  size="small"
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                                >
                                  {opt}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="contained" color="primary" fullWidth onClick={handleQuizSubmit}>
                      Submit Quiz
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      case 1: // Games
        return (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>Game Lab</Typography>
            <GameLab />
          </Box>
        );
      case 2: // Quiz (formerly Exercises, now combined with quiz functionality)
        return (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>Quiz & Exercises</Typography>
            {!showQuiz ? (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">Unit Test: {lecture?.topic}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Test your knowledge on {lecture?.topic} with a quick AI-generated quiz.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 1 }} size="small" onClick={handleStartQuiz}>
                    Start AI Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {quizResult ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You scored {quizResult.score} out of {quizResult.total}!
                    <Button size="small" onClick={() => setShowQuiz(false)} sx={{ ml: 2 }}>Close</Button>
                  </Alert>
                ) : (
                  <Box>
                    {quiz?.map((q, index) => (
                      <Card key={q.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1">{index + 1}. {q.question}</Typography>
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            {q.options.map((opt) => (
                              <Grid item xs={12} key={opt}>
                                <Button
                                  variant={quizAnswers[q.id] === opt ? "contained" : "outlined"}
                                  fullWidth
                                  size="small"
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                                >
                                  {opt}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="contained" color="primary" fullWidth onClick={handleQuizSubmit}>
                      Submit Quiz
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            <Card sx={{ mb: 2, mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">Problem Set 1</Typography>
                <Typography variant="body2" color="text.secondary">
                  Solve 5 problems related to {lecture?.subject}.
                </Typography>
                <Button variant="outlined" sx={{ mt: 1 }} size="small">
                  View Problems
                </Button>
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!lecture) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">Lecture not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4, height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              mr: 2,
              color: 'white',
              background: 'rgba(255,255,255,0.05)',
              '&:hover': { background: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>{lecture.title}</Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip
                label={lecture.subject}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  height: 24
                }}
              />
              <Chip
                label={lecture.topic}
                variant="outlined"
                size="small"
                sx={{
                  color: 'text.secondary',
                  borderColor: 'rgba(255,255,255,0.2)',
                  height: 24
                }}
              />
            </Box>
          </Box>
        </Box>
        {/* Loop Status Mini Badge */}
        {loopStatus && (
          <Chip
            label={loopStatus.stage}
            color={loopStatus.stage === 'MASTERED' ? 'success' : 'default'}
            variant="filled"
          />
        )}
      </Box>

      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Left Column: Video Player & Playlist */}
        <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(20, 20, 35, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            position: 'relative' // For Overlay
          }}>

            {/* Forbidden Overlay */}
            {isLocked && (
              <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backdropFilter: 'blur(10px)',
                background: 'rgba(10, 10, 20, 0.95)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ScienceIcon sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
                <Typography variant="h4" color="white" fontWeight="bold">Access Restricted</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center', mb: 4 }}>
                  Complete the prerequisite check to unlock.
                </Typography>
                <Button variant="contained" color="error" startIcon={<LockIcon />} onClick={handleGateUnlock}>
                  Start Prerequisite Gate
                </Button>
              </Box>
            )}

            {/* Video Player Section */}
            <Box sx={{ width: '100%', bgcolor: 'black' }}>
              <VideoPlayer
                video={activeVideo}
                onTimeUpdate={setCurrentTime}
              />
            </Box>

            {/* Playlist Section (Scrollable) */}
            <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Lecture Playlist
              </Typography>
              <List>
                {videos.map((vid, idx) => (
                  <ListItem
                    key={vid.video_id}
                    button
                    selected={activeVideo?.video_id === vid.video_id}
                    onClick={() => setActiveVideo(vid)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: activeVideo?.video_id === vid.video_id ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}
                  >
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary', fontSize: 12 }}>
                      {idx + 1}
                    </Box>
                    <ListItemText
                      primary={vid.title}
                      secondary={vid.channel}
                      primaryTypographyProps={{ color: activeVideo?.video_id === vid.video_id ? '#a78bfa' : 'white', fontSize: '0.95rem' }}
                    />
                    {activeVideo?.video_id === vid.video_id && <PlayArrowIcon sx={{ fontSize: 16, color: '#a78bfa' }} />}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Unified Tools (Chat/Lab/Games) */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(20, 20, 35, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden'
          }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="variant"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                '& .MuiTab-root': { color: 'text.secondary', minWidth: 'auto', px: 2 },
                '& .Mui-selected': { color: '#a78bfa' },
                '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' }
              }}
            >
              <Tab icon={<ScienceIcon fontSize="small" />} label="Lab" iconPosition="start" />
              <Tab icon={<SportsEsportsIcon fontSize="small" />} label="Games" iconPosition="start" />
              <Tab icon={<AssignmentIcon fontSize="small" />} label="Quiz" iconPosition="start" />
            </Tabs>

            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {renderRightColumnContent()}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Persistent AI Chat Widget (Floating) */}
      <AIChatWidget
        context={`Viewing Lecture: ${lecture.title}. Topic: ${lecture.topic}. Video: ${activeVideo?.title || 'None'} @ ${Math.floor(currentTime)}s. Active Loop Stage: ${loopStatus?.stage || 'Unknown'}`}
      />

      {/* Gate Activity Dialog */}
      <Dialog
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f0f15', color: 'white', minHeight: '80vh' } }}
      >
        <DialogContent>
          {gateActivity && (
            <Box height="100%">
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6" color="error">⚠️ Mandatory Check</Typography>
                <Button color="inherit" onClick={() => setGateOpen(false)}>Exit (Stays Locked)</Button>
              </Box>
              <ActivityView
                activity={gateActivity}
                onSubmit={handleGateSubmit}
                result={gateResult}
                onNext={handleGateNext}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container >
  );
};

export default LectureDetail;

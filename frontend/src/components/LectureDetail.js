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
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';
import { lectureAPI, contentAPI, focusAPI } from '../services/api'; // Fixed import path
import GameLab from './GameLab'; // Fixed import path

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    // ... existing useEffect ...
  }, [id]);

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      const res = await lectureAPI.generateQuiz(lecture.subject, lecture.topic, 5);
      setQuiz(res.data.quiz);
      setShowQuiz(true);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    setQuizResult({ score, total: quiz.length });
  };


  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        // Fetch lecture details
        const lectureRes = await lectureAPI.getById(id);
        const lectureData = lectureRes.data.lecture;
        setLecture(lectureData);

        // Fetch related videos based on lecture subject/topic
        if (lectureData) {
          const searchQuery = `${lectureData.subject} ${lectureData.topic}`;
          const videoRes = await contentAPI.search('', lectureData.subject); // Using subject for broad match first
          setVideos(videoRes.data.results || []);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderRightColumnContent = () => {
    switch (activeTab) {
      case 0: // Testing Lab
        return (
          <Box>
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
          <Box>
            <Typography variant="h6" gutterBottom>Game Lab</Typography>
            <GameLab />
          </Box>
        );
      case 2: // Exercises
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Exercises</Typography>
            <Card sx={{ mb: 2 }}>
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
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center">
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>{lecture.title}</Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip
              label={lecture.subject}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                color: 'white',
                fontWeight: 600
              }}
            />
            <Chip
              label={lecture.topic}
              variant="outlined"
              size="small"
              sx={{
                color: 'text.secondary',
                borderColor: 'rgba(255,255,255,0.2)'
              }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Videos (Practical Lab) */}
        <Grid item xs={12} md={8}>
          <Box sx={{
            p: 3,
            height: '100%',
            minHeight: '600px',
            background: 'rgba(20, 20, 35, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, color: 'white', fontWeight: 600 }}>
              Practical Lab (Videos)
            </Typography>

            <Box sx={{ mt: 3 }}>
              {videos.length > 0 ? (
                <Grid container spacing={3}>
                  {videos.map((video) => (
                    <Grid item xs={12} sm={6} key={video.video_id}>
                      <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }
                      }}>
                        {/* Thumbnail placeholder */}
                        <Box sx={{ height: 160, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)'
                          }} />
                          <PlayArrowIcon sx={{ color: 'white', fontSize: 48, zIndex: 1, opacity: 0.8 }} />
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography gutterBottom variant="subtitle1" component="div" noWrap sx={{ color: 'white', fontWeight: 600 }}>
                            {video.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }} noWrap>
                            {video.channel}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            sx={{ mt: 'auto', borderRadius: 2 }}
                            onClick={async () => {
                              try {
                                await focusAPI.lock(lecture.subject);
                                navigate('/player', { state: { video } });
                              } catch (e) {
                                console.error("Auto-lock failed", e);
                                navigate('/player', { state: { video } });
                              }
                            }}
                          >
                            Watch Now
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">No related videos found for this topic.</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Activities */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            height: '100%',
            minHeight: '600px',
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
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                '& .MuiTab-root': { color: 'text.secondary' },
                '& .Mui-selected': { color: '#a78bfa' },
                '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' }
              }}
            >
              <Tab label="Testing Lab" />
              <Tab label="Games" />
              <Tab label="Exercises" />
            </Tabs>

            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
              {renderRightColumnContent()}
            </Box>

            <Box sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <Typography variant="caption" sx={{ color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                ✨ AI Suggestions Enabled
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LectureDetail;

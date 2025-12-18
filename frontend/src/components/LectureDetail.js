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
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">{lecture.title}</Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip label={lecture.subject} color="primary" size="small" />
            <Chip label={lecture.topic} variant="outlined" size="small" />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Videos (Practical Lab) */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%', minHeight: '600px' }}>
            <Typography variant="h5" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              Practical Lab (Videos)
            </Typography>

            <Box sx={{ mt: 2 }}>
              {videos.length > 0 ? (
                <Grid container spacing={2}>
                  {videos.map((video) => (
                    <Grid item xs={12} sm={6} key={video.video_id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Thumbnail placeholder or actual thumbnail if available */}
                        <Box sx={{ height: 140, bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PlayArrowIcon sx={{ color: 'white', fontSize: 40 }} />
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="subtitle1" component="div" noWrap>
                            {video.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {video.channel}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={async () => {
                              try {
                                // Auto-lock based on lecture subject
                                await focusAPI.lock(lecture.subject);
                                navigate('/player', { state: { video } });
                              } catch (e) {
                                console.error("Auto-lock failed", e);
                                // Navigate anyway
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
          </Paper>
        </Grid>

        {/* Right Column: Activities */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Testing Lab" />
              <Tab label="Games" />
              <Tab label="Exercises" />
            </Tabs>

            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
              {renderRightColumnContent()}
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block" align="center">
                AI Suggestions Enabled
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LectureDetail;

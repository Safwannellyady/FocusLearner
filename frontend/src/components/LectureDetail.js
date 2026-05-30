import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Tabs, Tab, Button, LinearProgress, Avatar,
  Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Chip,
  Card, CardContent, Dialog, DialogContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { lectureAPI, contentAPI, gameAPI, taxonomyAPI } from '../services/api';
import VideoPlayer from './VideoPlayer';
import GameLab from './GameLab';
import ActivityView from './ActivityView';
import AIChatWidget from './AIChatWidget';
import FocusVault from './FocusVault';
import FolderIcon from '@mui/icons-material/Folder';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [activeTab, setActiveTab] = useState(0);

  // FocusLearner Interactive State
  const [quiz, setQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // { q.id: { selected: string, isCorrect: boolean } }
  const [quizResult, setQuizResult] = useState(null);

  const [mastery, setMastery] = useState(null);
  const [gateActivity, setGateActivity] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateResult, setGateResult] = useState(null);
  const [loopStatus, setLoopStatus] = useState(null);

  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        const lectureRes = await lectureAPI.getById(id);
        const lectureData = lectureRes.data.lecture;
        setLecture(lectureData);

        if (lectureData) {
          if (lectureData.learning_intent_id) {
            try {
              const loopRes = await taxonomyAPI.getLoopStatus(lectureData.learning_intent_id);
              setLoopStatus(loopRes.data);
            } catch (e) { }
          }
          try {
            const masteryRes = await gameAPI.getMastery(lectureData.subject, lectureData.topic);
            setMastery(masteryRes.data.mastery);
          } catch (e) { }

          const searchQuery = `${lectureData.subject} ${lectureData.topic}`;
          const videoRes = await contentAPI.search(searchQuery, lectureData.subject);
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
    if (id) fetchLectureData();
  }, [id]);

  const handleStartQuiz = async () => {
    try {
      const videoContext = lecture ? { title: lecture.title, description: lecture.description } : null;
      const res = await lectureAPI.generateQuiz(lecture.subject, lecture.topic, 5, videoContext);
      if (res.data.quiz) { setQuiz(res.data.quiz); setShowQuiz(true); }
    } catch (e) { console.error(e); }
  };
  const handleQuizOptionClick = (q, opt) => {
    if (quizAnswers[q.id]) return; // Already answered
    const isCorrect = opt === q.correct_answer;
    setQuizAnswers({ ...quizAnswers, [q.id]: { selected: opt, isCorrect } });
  };

  const handleQuizSubmit = () => {
    const correctCount = Object.values(quizAnswers).filter(a => a.isCorrect).length;
    setQuizResult({ score: correctCount, total: quiz.length });
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    handleStartQuiz();
  };
  const handleGateUnlock = async () => {
    try {
      const type = lecture.subject.includes("CS") ? 'coding' : 'lab';
      const videoContext = lecture ? { title: lecture.title, description: lecture.description } : null;
      const res = await gameAPI.generateActivity(lecture.subject, lecture.topic, type, videoContext);
      setGateActivity(res.data.activity);
      setGateOpen(true);
    } catch (e) { alert("Error generating gate."); }
  };
  const handleGateSubmit = async (answer, violationCount = 0) => {
    try {
      const res = await gameAPI.submitActivity(gateActivity.challenge_id, answer, violationCount);
      setGateResult(res.data.result);
      if (res.data.result.is_correct) {
        setMastery({ ...mastery, proficiency: res.data.result.new_proficiency, state: res.data.result.mastery_state });
      }
    } catch (e) { alert("Submission error"); }
  };
  const handleGateNext = () => { setGateOpen(false); setGateResult(null); };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, pb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>Learning</Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>Continue your learning journey</Typography>
      </Box>

      {/* Main Container */}
      <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', textAlign: 'center', mb: 4 }}>
          {lecture?.title || 'FocusLearner Demo Sequence: AI & Adaptive Learning'}
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column (Video + Tabs) */}
          <Grid item xs={12} md={8}>
            {/* Video Player Header banner */}
            <Box sx={{
              p: 1.5,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              border: '1px solid #e2e8f0',
              borderBottom: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PlayCircleOutlineIcon fontSize="small" sx={{ color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>Lecture 1: Introduction to Enterpreneurship</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>• week-01</Typography>
            </Box>

            {/* Video Player */}
            <Box sx={{
              borderRadius: 0,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              bgcolor: '#000',
              position: 'relative',
              mb: 4
            }}>
              <VideoPlayer video={activeVideo} onTimeUpdate={setCurrentTime} />
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748b' }, '& .Mui-selected': { color: '#2563eb' } }}>
                <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Lab" />
                <Tab icon={<SportsEsportsIcon fontSize="small" />} iconPosition="start" label="Games" />
                <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Quiz" />
                <Tab icon={<FolderIcon fontSize="small" />} iconPosition="start" label="Workspace Vault" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
              {activeTab === 0 && (
                <Box p={4} sx={{ border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc', textAlign: 'center', mt: 2 }}>
                  <ScienceIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Interactive Lab Booting Up...</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    The containerized practice environment for this session is currently being compiled. Check back soon!
                  </Typography>
                </Box>
              )}
              {activeTab === 1 && (
                <Box p={4} sx={{ border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc', textAlign: 'center', mt: 2 }}>
                  <SportsEsportsIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Gamified Reinforcement Scaling...</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    The game lab modules for this topic are currently syncing telemetry. Check back soon!
                  </Typography>
                </Box>
              )}
              {activeTab === 2 && (
                <Box p={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Quiz & Exercises</Typography>
                  {!showQuiz ? (
                    <Box sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#eff6ff' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#1e40af" mb={1}>Unit Test: {lecture?.topic}</Typography>
                      <Typography variant="body2" color="#3b82f6" mb={2}>Assess your understanding with a dynamic AI-generated quiz.</Typography>
                      <Button variant="contained" onClick={handleStartQuiz} sx={{ bgcolor: '#2563eb', color: '#fff' }}>Start AI Quiz</Button>
                    </Box>
                  ) : (
                    <Box>
                      {quizResult ? (
                        <Box>
                          <Alert severity={quizResult.score === quizResult.total ? "success" : "info"} sx={{ mb: 2 }}>
                            You scored {quizResult.score} out of {quizResult.total}!
                          </Alert>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={handleRetakeQuiz} sx={{ bgcolor: '#2563eb' }}>Retake Quiz</Button>
                            <Button variant="outlined" onClick={() => setShowQuiz(false)}>Close</Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          {quiz?.map((q, index) => {
                            const answered = quizAnswers[q.id];
                            return (
                              <Card key={q.id} sx={{ mb: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <CardContent>
                                  <Typography variant="subtitle1" fontWeight={600}>{index + 1}. {q.question}</Typography>
                                  <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {q.options.map(opt => {
                                      let btnColor = '#0f172a';
                                      let btnBgcolor = 'transparent';
                                      let borderColor = 'rgba(0, 0, 0, 0.23)';

                                      if (answered) {
                                        if (opt === q.correct_answer) {
                                          btnBgcolor = '#22c55e'; // Green
                                          btnColor = '#fff';
                                          borderColor = '#22c55e';
                                        } else if (answered.selected === opt && !answered.isCorrect) {
                                          btnBgcolor = '#ef4444'; // Red
                                          btnColor = '#fff';
                                          borderColor = '#ef4444';
                                        }
                                      }

                                      return (
                                        <Grid item xs={12} key={opt}>
                                          <Button
                                            variant={answered ? "contained" : "outlined"}
                                            fullWidth
                                            size="small"
                                            disabled={!!answered && opt !== q.correct_answer && answered.selected !== opt}
                                            onClick={() => handleQuizOptionClick(q, opt)}
                                            sx={{
                                              justifyContent: "flex-start",
                                              textAlign: "left",
                                              color: btnColor,
                                              bgcolor: btnBgcolor,
                                              borderColor: borderColor,
                                              '&:hover': answered ? { bgcolor: btnBgcolor } : {},
                                              '&.Mui-disabled': {
                                                bgcolor: btnBgcolor !== 'transparent' ? btnBgcolor : 'transparent',
                                                color: btnColor !== '#0f172a' ? btnColor : 'rgba(0, 0, 0, 0.26)'
                                              }
                                            }}
                                          >
                                            {opt}
                                          </Button>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                </CardContent>
                              </Card>
                            );
                          })}
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={Object.keys(quizAnswers).length !== quiz?.length}
                            onClick={handleQuizSubmit}
                            sx={{ mt: 2, bgcolor: '#2563eb' }}
                          >
                            Finish & View Score
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {activeTab === 3 && (
                <Box p={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Workspace Vault</Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
                    Store and search all your essential study materials here without leaving the focus zone.
                  </Typography>
                  <FocusVault subjectFocus={lecture?.subject} />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column (Progress + Active Session) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>Session Progress</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>{loopStatus?.stage === 'completed' ? '100%' : '50%'} Complete</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>{loopStatus?.stage === 'completed' ? '1/1' : '0/1'} Lessons</Typography>
              </Box>
              <LinearProgress variant="determinate" value={loopStatus?.stage === 'completed' ? 100 : 50} sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e7ff', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', mt: 4, mb: 2 }}>Curriculum Track</Typography>

              {/* Dynamic Single-Session List */}
              <Accordion sx={{ boxShadow: 'none', border: '1px solid #2563eb', borderRadius: '8px !important', '&:before': { display: 'none' } }} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{lecture?.subject || 'Active Focus Module'}</Typography>
                  <Typography variant="caption" sx={{ color: '#2563eb', ml: 'auto', alignSelf: 'center', fontWeight: 'bold' }}>Current</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: '#eff6ff', borderRadius: 2, color: '#2563eb', border: '1px solid #bfdbfe' }}>
                    <PlayCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lecture?.topic || 'Session Core'}
                    </Typography>
                    <Chip label={loopStatus?.stage === 'completed' ? 'Done' : 'Playing'} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'transparent', color: loopStatus?.stage === 'completed' ? 'green' : '#2563eb', border: 'none' }} />
                  </Box>
                </AccordionDetails>
              </Accordion>




            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Persistent AI Chat Widget (Floating) */}
      <AIChatWidget
        context={`Viewing Lecture: ${lecture.title}. Topic: ${lecture.topic}. Video: ${activeVideo?.title || 'None'} @ ${Math.floor(currentTime)}s. Active Loop Stage: ${loopStatus?.stage || 'Unknown'}`}
        videoId={activeVideo?.video_id}
      />

      {/* Gate Activity Dialog */}
      <Dialog open={gateOpen} onClose={() => setGateOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ bgcolor: '#f8fafc', minHeight: '80vh', p: 4 }}>
          {gateActivity && (
            <Box height="100%">
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6" color="error" fontWeight={700}>⚠️ Mandatory Check</Typography>
                <Button color="inherit" onClick={() => setGateOpen(false)}>Exit (Stays Locked)</Button>
              </Box>
              <ActivityView activity={gateActivity} onSubmit={handleGateSubmit} result={gateResult} onNext={handleGateNext} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default LectureDetail;

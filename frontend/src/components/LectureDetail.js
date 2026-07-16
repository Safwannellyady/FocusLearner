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
import VirtualLab from './VirtualLab';
import FolderIcon from '@mui/icons-material/Folder';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Interactive Virtual Lab State
  const [labActivity, setLabActivity] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labResult, setLabResult] = useState(null);

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

          let lectureVideos = [];
          if (lectureData.video_ids && Array.isArray(lectureData.video_ids) && lectureData.video_ids.length > 0) {
            lectureVideos = lectureData.video_ids.map((vid, idx) => ({
              video_id: vid,
              title: `${lectureData.title} (Part ${idx + 1})`,
              description: lectureData.description || `Session video for ${lectureData.topic}`,
              url: `https://www.youtube.com/watch?v=${vid}`,
              source: 'lecture_saved',
              subject_focus: lectureData.subject
            }));
          }

          let fetchedVideos = [];
          try {
            const searchQuery = `${lectureData.subject} ${lectureData.topic}`;
            const videoRes = await contentAPI.search(searchQuery, lectureData.subject);
            fetchedVideos = videoRes.data.results || [];
          } catch (err) {
            console.error("Error searching extra videos:", err);
          }

          // Combine saved lecture videos with search recommendations, deduplicating by video_id
          const seenIds = new Set();
          const allVideos = [];
          for (const v of [...lectureVideos, ...fetchedVideos]) {
            const vid = v.video_id || v.url;
            if (vid && !seenIds.has(vid)) {
              seenIds.add(vid);
              allVideos.push(v);
            }
          }

          setVideos(allVideos);
          if (allVideos.length > 0) {
            setActiveVideo(allVideos[0]);
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
      if (lecture?.quiz_config && Array.isArray(lecture.quiz_config) && lecture.quiz_config.length > 0) {
        setQuiz(lecture.quiz_config);
        setShowQuiz(true);
        return;
      }
      const videoContext = lecture ? { title: lecture.title, description: lecture.description } : null;
      const res = await lectureAPI.generateQuiz(lecture.subject, lecture.topic, 5, videoContext);
      if (res.data.quiz) { setQuiz(res.data.quiz); setShowQuiz(true); }
    } catch (e) { console.error(e); }
  };
  const handleQuizOptionClick = (q, opt) => {
    if (quizAnswers[q.id]) return; // Already answered
    const correctAns = q.correctAnswer || q.correct_answer;
    const isCorrect = opt === correctAns;
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

  const handleLaunchLab = async () => {
    setLabLoading(true);
    setLabResult(null);
    try {
      const type = lecture?.subject?.includes("CS") ? 'coding' : 'lab';
      const videoContext = lecture ? { title: lecture.title, description: lecture.description } : null;
      const res = await gameAPI.generateActivity(lecture?.subject, lecture?.topic, type, videoContext);
      setLabActivity(res.data.activity);
    } catch (err) {
      console.error("Failed to generate lab activity:", err);
    } finally {
      setLabLoading(false);
    }
  };

  useEffect(() => {
    if (lecture && activeTab === 0 && !labActivity && !labLoading) {
      handleLaunchLab();
    }
    if (lecture && activeTab === 2 && !quiz && !showQuiz) {
      handleStartQuiz();
    }
  }, [activeTab, lecture]);

  const handleLabSubmit = async (answer) => {
    try {
      const res = await gameAPI.submitActivity(labActivity.challenge_id, answer, 0);
      setLabResult(res.data.result);
      if (res.data.result?.is_correct && mastery) {
        setMastery({ ...mastery, proficiency: res.data.result.new_proficiency, state: res.data.result.mastery_state });
      }
    } catch (err) {
      console.error("Error submitting lab answer:", err);
    }
  };

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
              gap: 1,
              bgcolor: '#f8fafc'
            }}>
              <PlayCircleOutlineIcon fontSize="small" sx={{ color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                {lecture?.title || 'Interactive Lecture Session'} — {lecture?.topic || ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>• {lecture?.subject || 'FocusLearner'}</Typography>
            </Box>

            {/* Video Player */}
            <Box sx={{
              borderRadius: 0,
              borderBottomLeftRadius: videos.length > 1 ? 0 : 12,
              borderBottomRightRadius: videos.length > 1 ? 0 : 12,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              bgcolor: '#000',
              position: 'relative',
              mb: videos.length > 1 ? 0 : 4
            }}>
              <VideoPlayer video={activeVideo} onTimeUpdate={setCurrentTime} />
            </Box>

            {/* Interactive Video Playlist Bar */}
            {videos.length > 1 && (
              <Box sx={{
                p: 2,
                border: '1px solid #e2e8f0',
                borderTop: 'none',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                bgcolor: '#f8fafc',
                mb: 4
              }}>
                <Typography variant="caption" fontWeight={700} color="#475569" display="block" mb={1.5}>
                  PLAYLIST & RECOMMENDED LECTURES ({videos.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
                  {videos.map((v, idx) => {
                    const isSelected = activeVideo?.video_id === v.video_id || activeVideo?.url === v.url;
                    return (
                      <Card
                        key={idx}
                        onClick={() => setActiveVideo(v)}
                        sx={{
                          minWidth: 200,
                          maxWidth: 240,
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#3b82f6', transform: 'translateY(-2px)' }
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: isSelected ? '#1e40af' : '#0f172a' }}>
                            {idx + 1}. {v.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {v.channel || v.source || 'YouTube'}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* High-Tech Cockpit Tabs Switcher */}
            <Box sx={{ 
              bgcolor: 'rgba(14, 18, 38, 0.75)', 
              backdropFilter: 'blur(20px)',
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              p: 0.8, 
              mb: 3,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, val) => setActiveTab(val)} 
                variant="fullWidth"
                sx={{ 
                  '& .MuiTabs-indicator': { 
                    height: '100%', 
                    borderRadius: '16px', 
                    bgcolor: 'rgba(0, 242, 254, 0.15)', 
                    border: '1px solid rgba(0, 242, 254, 0.45)',
                    boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)',
                    zIndex: 0 
                  }, 
                  '& .MuiTab-root': { 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.95rem',
                    color: '#94a3b8', 
                    zIndex: 1,
                    minHeight: 46,
                    borderRadius: '16px',
                    transition: 'all 0.3s ease'
                  }, 
                  '& .Mui-selected': { 
                    color: '#00f2fe !important',
                    textShadow: '0 0 12px rgba(0, 242, 254, 0.6)'
                  } 
                }}
              >
                <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Virtual AI Lab" />
                <Tab icon={<SportsEsportsIcon fontSize="small" />} iconPosition="start" label="Gamified Arena" />
                <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Neural Quiz" />
                <Tab icon={<FolderIcon fontSize="small" />} iconPosition="start" label="Workspace Vault" />
              </Tabs>
            </Box>

            {/* Tab Content with Smooth Transitions & Epic Styling */}
            <Box sx={{ position: 'relative', minHeight: 440 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important', mb: 3 }}>
                        <VirtualLab subject={lecture?.subject} topic={lecture?.topic} videoTitle={activeVideo?.title} />
                      </Box>
                      {!labActivity ? (
                        <Box className="epic-card" p={3.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '20px !important' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff">
                              ⚡ Want a Scored Problem Challenge?
                            </Typography>
                            <Typography variant="body2" color="#94a3b8">
                              Our AI will generate a specific hypothesis & multi-step practice challenge for {lecture?.topic}.
                            </Typography>
                          </Box>
                          <Button
                            onClick={handleLaunchLab}
                            disabled={labLoading}
                            className="epic-btn-purple"
                            startIcon={labLoading ? <CircularProgress size={18} color="inherit" /> : <ScienceIcon />}
                            sx={{ fontSize: '0.95rem !important', py: '12px !important', px: '28px !important' }}
                          >
                            {labLoading ? 'Generating Challenge...' : '⚡ Generate Practice Problem →'}
                          </Button>
                        </Box>
                      ) : (
                        <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important', mt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <span className="pulse-dot-cyan" />
                              <Typography variant="h5" fontWeight="900" fontFamily="Outfit, sans-serif" color="#ffffff">
                                Scored Lab Challenge: {labActivity.title || lecture?.topic}
                              </Typography>
                            </Box>
                            <Button className="epic-btn-outline" size="small" onClick={() => { setLabActivity(null); setLabResult(null); }}>
                              🔄 Close Problem
                            </Button>
                          </Box>
                          {labResult && (
                            <Alert severity={labResult.is_correct ? "success" : "info"} sx={{ mb: 3, borderRadius: '16px', bgcolor: labResult.is_correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 242, 254, 0.15)', color: '#ffffff', border: labResult.is_correct ? '1px solid #10b981' : '1px solid #00f2fe' }}>
                              <Typography fontWeight="800" fontFamily="Outfit, sans-serif">{labResult.is_correct ? "🏆 Lab Challenge Passed! +XP Earned" : "Check Your Solution"}</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>{labResult.feedback}</Typography>
                            </Alert>
                          )}
                          <ActivityView activity={labActivity} onSubmit={handleLabSubmit} />
                        </Box>
                      )}
                    </Box>
                  )}
                  {activeTab === 1 && (
                    <Box className="epic-card" sx={{ mt: 1, p: 3, borderRadius: '24px !important' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} pb={2} borderBottom="1px solid rgba(255, 255, 255, 0.1)">
                        <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <SportsEsportsIcon sx={{ color: '#34d399', fontSize: 30 }} /> Gamified Arena: <span style={{ color: '#34d399' }}>{lecture?.subject || 'Curriculum'}</span>
                        </Typography>
                        <span className="epic-badge-emerald">🎮 REAL-TIME ENGINE</span>
                      </Box>
                      <Box sx={{ minHeight: '520px' }}>
                        <GameLab embedded={true} subject={lecture?.subject} topic={lecture?.topic} gameConfig={lecture?.game_config} />
                      </Box>
                    </Box>
                  )}
                  {activeTab === 2 && (
                    <Box sx={{ mt: 1 }}>
                      {!showQuiz ? (
                        <Box className="epic-card" p={6} sx={{ textAlign: 'center', borderRadius: '24px !important', border: '1px solid rgba(157, 78, 221, 0.4) !important' }}>
                          <Box sx={{ width: 84, height: 84, mx: 'auto', mb: 3, borderRadius: '24px', background: 'radial-gradient(circle, rgba(157, 78, 221, 0.35) 0%, rgba(14, 18, 38, 0.8) 100%)', border: '1px solid rgba(157, 78, 221, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 35px rgba(157, 78, 221, 0.4)' }}>
                            <AssignmentIcon sx={{ fontSize: 44, color: '#d8b4fe' }} />
                          </Box>
                          <span className="epic-badge-purple" style={{ marginBottom: '16px' }}>⚡ NEURAL COMPREHENSION TEST</span>
                          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#ffffff', mb: 1.5 }}>
                            AI Assessment Quiz: <span style={{ color: '#d8b4fe' }}>{lecture?.topic}</span>
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4, maxWidth: 620, mx: 'auto', lineHeight: 1.7 }}>
                            Test your comprehension with dynamically generated multiple-choice challenges based on this exact video sequence. Answer accurately to unlock progression gates.
                          </Typography>
                          <Button onClick={handleStartQuiz} className="epic-btn-purple" sx={{ fontSize: '1.05rem !important', py: '15px !important', px: '38px !important' }}>
                            ⚡ Start Neural Quiz Assessment →
                          </Button>
                        </Box>
                      ) : (
                        <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <span className="pulse-dot-cyan" />
                              <Typography variant="h5" fontWeight="900" fontFamily="Outfit, sans-serif" color="#ffffff">
                                Neural Quiz: {lecture?.topic}
                              </Typography>
                            </Box>
                            <Button className="epic-btn-outline" size="small" onClick={handleRetakeQuiz}>
                              🔄 Generate New Assessment
                            </Button>
                          </Box>
                          {quizResult ? (
                            <Alert severity={quizResult.score >= 3 ? "success" : "warning"} sx={{ mb: 4, borderRadius: '16px', bgcolor: quizResult.score >= 3 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)', color: '#ffffff', border: quizResult.score >= 3 ? '1px solid #10b981' : '1px solid #f59e0b' }}>
                              <Typography variant="h6" fontWeight="900" fontFamily="Outfit, sans-serif">
                                🏆 Quiz Completed! Neural Mastery Score: {quizResult.score} / {quizResult.total}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, color: '#e2e8f0' }}>
                                {quizResult.score >= 3 ? 'Outstanding achievement! You have mastered this module and unlocked progression.' : 'Review the synchronized video sequence above and re-try to boost your neural score.'}
                              </Typography>
                            </Alert>
                          ) : null}
                          {quiz?.map((q, index) => {
                            const answered = quizAnswers[q.id];
                            return (
                              <Box key={q.id} sx={{ mb: 3, p: 3, borderRadius: '20px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(0, 242, 254, 0.3)', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                                <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" sx={{ mb: 2, color: '#ffffff', display: 'flex', gap: 1.2 }}>
                                  <span style={{ color: '#00f2fe' }}>{index + 1}.</span> {q.question}
                                </Typography>
                                <Grid container spacing={1.5}>
                                  {q.options.map(opt => {
                                    const correctAns = q.correctAnswer || q.correct_answer;
                                    let btnColor = '#cbd5e1';
                                    let btnBgcolor = 'rgba(255, 255, 255, 0.04)';
                                    let borderColor = 'rgba(255, 255, 255, 0.12)';

                                    if (answered) {
                                      if (opt === correctAns) {
                                        btnBgcolor = 'rgba(16, 185, 129, 0.25)'; // Green
                                        btnColor = '#ffffff';
                                        borderColor = '#10b981';
                                      } else if (answered.selected === opt && !answered.isCorrect) {
                                        btnBgcolor = 'rgba(239, 68, 68, 0.25)'; // Red
                                        btnColor = '#ffffff';
                                        borderColor = '#ef4444';
                                      }
                                    }

                                    return (
                                      <Grid item xs={12} key={opt}>
                                        <Button
                                          variant="outlined"
                                          fullWidth
                                          disabled={!!answered && opt !== correctAns && answered.selected !== opt}
                                          onClick={() => handleQuizOptionClick(q, opt)}
                                          sx={{
                                            justifyContent: "flex-start",
                                            textAlign: "left",
                                            py: 1.4,
                                            px: 2.5,
                                            borderRadius: '14px',
                                            fontWeight: 700,
                                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                                            fontSize: '0.98rem',
                                            textTransform: 'none',
                                            color: btnColor,
                                            bgcolor: btnBgcolor,
                                            border: `1.5px solid ${borderColor}`,
                                            boxShadow: answered && opt === correctAns ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            '&:hover': answered ? {} : { bgcolor: 'rgba(0, 242, 254, 0.12)', borderColor: '#00f2fe', color: '#ffffff', transform: 'translateX(6px)' },
                                            '&.Mui-disabled': {
                                              bgcolor: btnBgcolor,
                                              color: answered && opt === correctAns ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                                              borderColor: borderColor
                                            }
                                          }}
                                        >
                                          {opt}
                                        </Button>
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                              </Box>
                            );
                          })}
                          {!quizResult && quiz && quiz.length > 0 && (
                            <Button
                              onClick={handleQuizSubmit}
                              className="epic-btn-primary"
                              fullWidth
                              sx={{ mt: 2, py: '16px !important', fontSize: '1.08rem !important' }}
                            >
                              ⚡ Submit Neural Quiz Answers & Evaluate Score →
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                  {activeTab === 3 && (
                    <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important' }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#ffffff', mb: 1, display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <FolderIcon sx={{ color: '#a78bfa' }} /> Workspace Vault & Knowledge Base
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
                        Store, query, and search all your essential study materials, encyclopedia references, and code docs right inside this focus zone.
                      </Typography>
                      <FocusVault subjectFocus={lecture?.subject} />
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>
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

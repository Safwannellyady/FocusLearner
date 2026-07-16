import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Chip, Divider, Tabs, Tab, Alert } from '@mui/material';
import { Group, AccessTime, Chat, Schedule, Send, EmojiEvents, PlayArrow, AddCircle } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FocusArena = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Study Room & Pomodoro, 1: Discussion & Scheduled Reviews
  const [room, setRoom] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('Engineering Final Exam Sprint');
  const [newRoomSubject, setNewRoomSubject] = useState('Math/Linear Algebra');
  const [targetDuration, setTargetDuration] = useState(25);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [reviewTitleInput, setReviewTitleInput] = useState('Post-Pomodoro Concept Review');
  const [reviewSummaryInput, setReviewSummaryInput] = useState('');
  const [reviewTimeInput, setReviewTimeInput] = useState('2026-07-17T15:00');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchRoomStatus = async (code) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/rooms/${code}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(res.data.room);
      fetchMessages(code);
    } catch (err) {
      console.error('Error fetching room status:', err);
      setError('Could not connect to live study room.');
    }
  };

  const fetchMessages = async (code) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/rooms/${code}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error fetching room messages:', err);
    }
  };

  useEffect(() => {
    if (room && room.room_code) {
      const interval = setInterval(() => {
        fetchRoomStatus(room.room_code);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [room]);

  const handleCreateRoom = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/rooms/create`, {
        title: newRoomTitle,
        subject_focus: newRoomSubject,
        target_duration: targetDuration
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setRoom(res.data.room);
      setSuccessMsg(`Room created! Code: ${res.data.room.room_code}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!joinCodeInput.trim()) {
      setError('Please enter a 6-character room code.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/rooms/join`, {
        room_code: joinCodeInput.trim().toUpperCase()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setRoom(res.data.room);
      setSuccessMsg(`Successfully joined ${res.data.room.title}!`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not join room. Check code.');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !room) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/rooms/${room.room_code}/messages`, {
        message: chatInput.trim(),
        is_review_note: false
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setChatInput('');
      fetchMessages(room.room_code);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const handleScheduleReview = async () => {
    if (!room) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/rooms/${room.room_code}/schedule_review`, {
        title: reviewTitleInput,
        topic_summary: reviewSummaryInput,
        scheduled_at: `${reviewTimeInput}:00Z`
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setReviewSummaryInput('');
      setSuccessMsg('After-study review discussion scheduled!');
      fetchRoomStatus(room.room_code);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not schedule review session.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '85vh', background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 60%, #0b0f19 100%)' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Group sx={{ color: '#6366f1', fontSize: 36 }} /> Collaborative Focus Arena & Discussion Rooms
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Multiplayer Pomodoro sprints with scheduled classmate review sessions & live chat
          </Typography>
        </Box>
        {room && (
          <Chip 
            label={`Room Code: ${room.room_code}`} 
            sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontWeight: 800, fontSize: '1rem', py: 2.5, px: 2 }} 
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>{successMsg}</Alert>}

      {!room ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddCircle sx={{ color: '#6366f1' }} /> Create a Study Room
              </Typography>
              <TextField 
                label="Room Title / Topic" 
                fullWidth 
                value={newRoomTitle} 
                onChange={(e) => setNewRoomTitle(e.target.value)} 
                sx={{ mb: 2.5, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
              />
              <TextField 
                label="Subject Focus" 
                fullWidth 
                value={newRoomSubject} 
                onChange={(e) => setNewRoomSubject(e.target.value)} 
                sx={{ mb: 2.5, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
              />
              <TextField 
                label="Pomodoro Target Duration (minutes)" 
                type="number" 
                fullWidth 
                value={targetDuration} 
                onChange={(e) => setTargetDuration(e.target.value)} 
                sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
              />
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleCreateRoom}
                sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', py: 1.5, fontWeight: 700, textTransform: 'none' }}
              >
                Launch New Study Arena
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrow sx={{ color: '#10b981' }} /> Join Classmate Study Room
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Enter the 6-character room code shared by your friend or study group to join their Pomodoro timer and discussion room.
              </Typography>
              <TextField 
                label="6-Character Room Code" 
                fullWidth 
                value={joinCodeInput} 
                onChange={(e) => setJoinCodeInput(e.target.value)} 
                sx={{ mb: 3, input: { color: '#fff', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 2 }, label: { color: '#94a3b8' } }} 
              />
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleJoinRoom}
                sx={{ borderColor: '#10b981', color: '#10b981', py: 1.5, fontWeight: 700, textTransform: 'none', '&:hover': { background: 'rgba(16, 185, 129, 0.1)' } }}
              >
                Join Study Room
              </Button>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <>
          <Paper sx={{ mb: 3, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, val) => setActiveTab(val)}
              sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.08)', '.MuiTab-root': { color: '#94a3b8', fontWeight: 600, textTransform: 'none', minHeight: 56 } }}
            >
              <Tab icon={<AccessTime sx={{ mr: 1 }} />} iconPosition="start" label="Live Study Room & Peers" />
              <Tab icon={<Chat sx={{ mr: 1 }} />} iconPosition="start" label="Classmate Discussion & Scheduled Reviews" />
            </Tabs>
          </Paper>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Synchronized Pomodoro Status */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 4, background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1 }}>{room.title}</Typography>
                  <Chip label={room.subject_focus} size="small" sx={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', mb: 4, fontWeight: 600 }} />
                  
                  <Box sx={{ width: 220, height: 220, mx: 'auto', borderRadius: '50%', border: '6px solid #6366f1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 32px rgba(99, 102, 241, 0.3)', mb: 4 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
                      {room.target_duration}:00
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, mt: 0.5 }}>
                      Synchronized Sprint
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Silent focus during active blocks. Use the Discussion Room tab during scheduled after-study review sessions!
                  </Typography>
                </Paper>
              </Grid>

              {/* Active Participants List */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents sx={{ color: '#f59e0b' }} /> Active Classmates ({room.participants?.length || 1})
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {room.participants?.map((p) => (
                      <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {p.username?.charAt(0).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>{p.username}</Typography>
                            <Typography variant="caption" sx={{ color: p.is_focused ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: p.is_focused ? '#10b981' : '#f59e0b' }} />
                              {p.is_focused ? 'In Deep Focus' : 'On Break'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label={`${p.current_streak || 1} 🔥`} size="small" sx={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700 }} />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Scheduled After-Study Review Sessions */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: '#8b5cf6' }} /> Scheduled Classmate Review Sessions
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                    Schedule when your study group will meet after studying to discuss quiz questions, summarize key formulas, and review together.
                  </Typography>

                  <Box sx={{ mb: 3, p: 2, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 2 }}>
                    <TextField 
                      label="Review Session Title" 
                      fullWidth 
                      size="small" 
                      value={reviewTitleInput} 
                      onChange={(e) => setReviewTitleInput(e.target.value)} 
                      sx={{ mb: 1.5, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
                    />
                    <TextField 
                      label="Key Formulas / Topics to Review" 
                      fullWidth 
                      size="small" 
                      value={reviewSummaryInput} 
                      onChange={(e) => setReviewSummaryInput(e.target.value)} 
                      sx={{ mb: 1.5, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
                    />
                    <TextField 
                      label="Schedule Time (Local / UTC)" 
                      type="datetime-local" 
                      fullWidth 
                      size="small" 
                      value={reviewTimeInput} 
                      onChange={(e) => setReviewTimeInput(e.target.value)} 
                      sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#94a3b8' } }} 
                    />
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="small" 
                      onClick={handleScheduleReview}
                      sx={{ background: '#8b5cf6', textTransform: 'none', fontWeight: 600 }}
                    >
                      Schedule Classmate Review
                    </Button>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

                  <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 700, mb: 1.5 }}>Upcoming Review Sessions:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {room.scheduled_discussions?.length === 0 ? (
                      <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>No post-study review sessions scheduled yet.</Typography>
                    ) : (
                      room.scheduled_discussions?.map((sd) => (
                        <Box key={sd.id} sx={{ p: 1.5, background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>{sd.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#c4b5fd', display: 'block', mb: 0.5 }}>
                            ⏰ Scheduled for: {new Date(sd.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(sd.scheduled_at).toLocaleDateString()})
                          </Typography>
                          {sd.topic_summary && <Typography variant="caption" sx={{ color: '#e2e8f0' }}>Topic: {sd.topic_summary}</Typography>}
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Discussion Chat Room */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, display: 'flex', flexDirection: 'column', height: 480 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chat sx={{ color: '#10b981' }} /> Classmate Discussion & Review Room
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mb: 2 }}>
                    Discuss formulas, share concept summaries, and collaborate on difficult practice questions.
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

                  <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, pr: 1 }}>
                    {messages.length === 0 ? (
                      <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', my: 'auto' }}>
                        No messages inside the review room yet. Say hello or post a concept note!
                      </Typography>
                    ) : (
                      messages.map((m) => (
                        <Box key={m.id} sx={{ p: 1.5, background: m.is_review_note ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)', borderLeft: m.is_review_note ? '3px solid #6366f1' : 'none', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#818cf8' }}>{m.username}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#f8fafc', wordBreak: 'break-word' }}>{m.message}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder="Type discussion message or formula note..." 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      sx={{ input: { color: '#fff' } }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleSendMessage}
                      sx={{ background: '#10b981', minWidth: 48, px: 2 }}
                    >
                      <Send fontSize="small" />
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default FocusArena;

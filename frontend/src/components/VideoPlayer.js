import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import YouTube from 'react-youtube';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { focusAPI, contentAPI, gameAPI } from '../services/api';
import AIChatWidget from './AIChatWidget';
import FocusMonitor from './FocusMonitor';
import FocusCheckModal from './FocusCheckModal';

const VideoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSession, setCurrentSession] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [xpEarned, setXpEarned] = useState(null);

  useEffect(() => {
    // Check if video was passed via navigation state
    if (location.state?.video) {
      setSelectedVideo(location.state.video);
    }
    loadCurrentSession();
  }, []); // Run once on mount

  useEffect(() => {
    if (currentSession || selectedVideo) {
      loadContent();
    }
  }, [currentSession, selectedVideo?.subject_focus]);

  const loadCurrentSession = async () => {
    try {
      const response = await focusAPI.getCurrent();
      if (response.data.session) {
        setCurrentSession(response.data.session);
      } else {
        // Did not redirect to /focus here - allow standalone video play if available
        if (!location.state?.video) {
          console.log("No active session and no video state. User might need to select subject.");
          // Optional: check user preferences here if needed in future
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadContent = async () => {
    // Determine subject from session OR selected video (fallback)
    const subject = currentSession?.subject_focus || selectedVideo?.subject_focus || '';

    if (!subject && !searchQuery) return;

    setLoading(true);
    try {
      // Pass subject explicitely if no session
      const response = await (currentSession
        ? focusAPI.getContent(searchQuery)
        : contentAPI.search(searchQuery, subject));

      setVideos(response.data.results || response.data.videos || []);

      // If we just loaded videos and didn't have one selected, select the first
      if (response.data.results?.length > 0 && !selectedVideo) {
        setSelectedVideo(response.data.results[0]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadContent();
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    if (currentSession) {
      focusAPI.updateVideo(video.video_id, 0);
    }
  };

  const handleVideoStateChange = (event) => {
    // Track video progress
    if (event.data === YouTube.PlayerState.PLAYING && currentSession) {
      const player = event.target;
      const currentTime = player.getCurrentTime();
      focusAPI.updateVideo(selectedVideo?.video_id, Math.floor(currentTime));
    }
    // Track completion (State 0 is ENDED)
    if (event.data === 0 && selectedVideo) {
      handleVideoCompletion();
    }
  };

  const handleVideoCompletion = async () => {
    try {
      // Module ID 'video_completion', 1 point per video (backend multiplies by 50)
      const response = await gameAPI.submitResult(
        'video_completion',
        1,
        1,
        selectedVideo.subject_focus || 'General'
      );
      if (response.data.progress) {
        setXpEarned(50); // Hardcoded for visual feedback, or calc from response
        // Could show a snackbar here
      }
    } catch (error) {
      console.error("Error submitting game result:", error);
    }
  };

  const opts = {
    height: '480',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0, // Don't show related videos
      modestbranding: 1,
    },
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Deep Focus Logic
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionDuration, setDistractionDuration] = useState(0);
  const [playerRef, setPlayerRef] = useState(null);

  const handleDistractionStart = () => {
    if (playerRef) {
      playerRef.pauseVideo();
    }
  };

  const handleDistractionEnd = (duration) => {
    setDistractionDuration(duration);
    setIsDistracted(true);
  };

  const handleResumeFocus = () => {
    setIsDistracted(false);
    // Optional: Auto-resume video?
    // if (playerRef) playerRef.playVideo();
  };

  const onPlayerReady = (event) => {
    setPlayerRef(event.target);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'white', background: 'rgba(255,255,255,0.1)' } }}
        >
          Back
        </Button>
        {currentSession && (
          <Typography variant="h6" sx={{ color: '#a78bfa', fontWeight: 600 }}>
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, mr: 1 }}>Focusing on:</Box>
            {currentSession.subject_focus}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{
            p: 0,
            mb: 3,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            background: '#000'
          }}>
            {selectedVideo ? (
              <Box>
                <YouTube
                  videoId={extractVideoId(selectedVideo.url)}
                  opts={opts}
                  onReady={onPlayerReady}
                  onStateChange={handleVideoStateChange}
                  style={{ width: '100%' }}
                />
                <Box sx={{ p: 3, background: 'rgba(20, 20, 35, 0.9)' }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {selectedVideo.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedVideo.description}
                  </Typography>
                  {xpEarned && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                      🎉 Video Completed! +{xpEarned} XP Earned!
                    </Alert>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10, background: 'rgba(255,255,255,0.03)' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a video to start learning
                </Typography>
              </Box>
            )}
          </Box>

          {/* Custom Overlay - Next Step */}
          {selectedVideo && (
            <Box sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(to right, rgba(107, 33, 168, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Ready for the next step?
                </Typography>
                <Typography variant="body2" sx={{ color: '#a78bfa' }}>
                  Continue your momentum with the next recommended video.
                </Typography>
              </Box>
              {videos.length > 1 && (
                <Button
                  variant="contained"
                  sx={{
                    background: 'white',
                    color: '#6b21a8',
                    fontWeight: 600,
                    '&:hover': { background: '#f8fafc' }
                  }}
                  onClick={() => {
                    const currentIndex = videos.findIndex(
                      (v) => v.video_id === selectedVideo.video_id
                    );
                    const nextVideo = videos[(currentIndex + 1) % videos.length];
                    handleVideoSelect(nextVideo);
                  }}
                >
                  Next Video
                </Button>
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{
            height: 'fit-content',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(20, 20, 35, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            p: 2
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', px: 1, pt: 1, fontWeight: 600 }}>
              Up Next
            </Typography>

            <Box sx={{ mb: 3, px: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search related content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                variant="filled"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.05)',
                    '&:hover': { background: 'rgba(255,255,255,0.08)' }
                  }
                }}
              />
            </Box>

            <List sx={{ overflowY: 'auto', px: 1 }}>
              {videos.length > 0 ? (
                videos.map((video) => (
                  <ListItem
                    key={video.video_id}
                    button
                    selected={selectedVideo?.video_id === video.video_id}
                    onClick={() => handleVideoSelect(video)}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      border: selectedVideo?.video_id === video.video_id ? '1px solid #8b5cf6' : '1px solid transparent',
                      background: selectedVideo?.video_id === video.video_id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      '&:hover': { background: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{video.title}</Typography>}
                      secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{video.channel}</Typography>}
                    />
                  </ListItem>
                ))
              ) : (
                <Alert severity="info" sx={{ background: 'transparent', color: 'text.secondary' }}>
                  {loading ? 'Loading...' : 'No videos found.'}
                </Alert>
              )}
            </List>
          </Box>
        </Grid>
      </Grid>

      {/* AI Tutor Chat Widget */}
      <AIChatWidget context={`Subject: ${currentSession?.subject_focus || selectedVideo?.subject_focus}, Video: ${selectedVideo?.title}`} />

      {/* Deep Focus Monitor */}
      <FocusMonitor
        active={!!currentSession}
        onDistractionStart={handleDistractionStart}
        onDistractionEnd={handleDistractionEnd}
      />

      <FocusCheckModal
        open={isDistracted}
        duration={distractionDuration}
        onResume={handleResumeFocus}
      />
    </Container >
  );
};

export default VideoPlayer;


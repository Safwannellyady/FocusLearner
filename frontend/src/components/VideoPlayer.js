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
import { focusAPI, contentAPI } from '../services/api';

const VideoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSession, setCurrentSession] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        {currentSession && (
          <Typography variant="h6" color="primary">
            Focus: {currentSession.subject_focus}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            {selectedVideo ? (
              <Box>
                <YouTube
                  videoId={extractVideoId(selectedVideo.url)}
                  opts={opts}
                  onStateChange={handleVideoStateChange}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {selectedVideo.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedVideo.description}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Select a video to start learning
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Custom Overlay - Next Step */}
          {selectedVideo && (
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Next Step
              </Typography>
              {videos.length > 1 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    const currentIndex = videos.findIndex(
                      (v) => v.video_id === selectedVideo.video_id
                    );
                    const nextVideo = videos[(currentIndex + 1) % videos.length];
                    handleVideoSelect(nextVideo);
                  }}
                >
                  Continue to Next Video
                </Button>
              )}
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filtered Content Library
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </Box>

            {videos.length > 0 ? (
              <List>
                {videos.map((video) => (
                  <ListItem
                    key={video.video_id}
                    button
                    selected={selectedVideo?.video_id === video.video_id}
                    onClick={() => handleVideoSelect(video)}
                    sx={{
                      mb: 1,
                      border: selectedVideo?.video_id === video.video_id ? 2 : 0,
                      borderColor: 'primary.main',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={video.title}
                      secondary={video.channel}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                {loading ? 'Loading...' : 'No videos found. Try a different search.'}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoPlayer;


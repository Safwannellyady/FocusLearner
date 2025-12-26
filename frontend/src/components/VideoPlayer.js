import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { focusAPI, gameAPI } from '../services/api';

const VideoPlayer = ({ video, onVideoEnd, onTimeUpdate }) => {
  const [xpEarned, setXpEarned] = useState(null);
  const [playerRef, setPlayerRef] = useState(null);

  useEffect(() => {
    setXpEarned(null); // Reset when video changes
  }, [video?.video_id]);

  const handleVideoStateChange = (event) => {
    // Track video progress
    if (event.data === YouTube.PlayerState.PLAYING) {
      const player = event.target;
      const currentTime = player.getCurrentTime();
      if (onTimeUpdate) onTimeUpdate(currentTime);

      // Update backend periodically? Or let parent do it via onTimeUpdate?
      // Keeping simple backend ping here for specific video tracking if needed:
      if (video?.video_id) {
        focusAPI.updateVideo(video.video_id, Math.floor(currentTime)).catch(console.error);
      }
    }
    // Track completion (State 0 is ENDED)
    if (event.data === 0) {
      handleVideoCompletion();
      if (onVideoEnd) onVideoEnd();
    }
  };

  const handleVideoCompletion = async () => {
    if (!video) return;
    try {
      // Module ID 'video_completion', 1 point per video (backend multiplies by 50)
      const response = await gameAPI.submitResult(
        'video_completion',
        1,
        1,
        video.subject_focus || 'General'
      );
      if (response.data.progress) {
        setXpEarned(50);
      }
    } catch (error) {
      console.error("Error submitting game result:", error);
    }
  };

  const onPlayerReady = (event) => {
    setPlayerRef(event.target);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    // Handle both youtube.com and youtu.be, and raw IDs if passed
    if (url.length === 11) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const opts = {
    height: '480',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  if (!video) {
    return (
      <Box sx={{
        height: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 4
      }}>
        <Typography color="text.secondary">Select a video to start watching</Typography>
      </Box>
    );
  }

  const videoId = video.video_id || extractVideoId(video.url);

  return (
    <Box sx={{
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      background: '#000'
    }}>
      <Box>
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={handleVideoStateChange}
            style={{ width: '100%' }}
          />
        ) : (
          <Alert severity="error">Invalid Video URL</Alert>
        )}

        <Box sx={{ p: 3, background: 'rgba(20, 20, 35, 0.9)' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            {video.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {video.description}
          </Typography>
          {xpEarned && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
              🎉 Video Completed! +{xpEarned} XP Earned!
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;


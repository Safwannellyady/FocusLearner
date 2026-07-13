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
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    setXpEarned(null);
    setVideoError(null);
  }, [video?.video_id, video?.url]);

  const handleVideoStateChange = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      const player = event.target;
      const currentTime = player.getCurrentTime();
      if (onTimeUpdate) onTimeUpdate(currentTime);

      if (video?.video_id) {
        focusAPI.updateVideo(video.video_id, Math.floor(currentTime)).catch(console.error);
      }
    }
    if (event.data === 0) {
      handleVideoCompletion();
      if (onVideoEnd) onVideoEnd();
    }
  };

  const handleVideoError = (event) => {
    console.error("YouTube embed error code:", event.data);
    let errorMsg = "An error occurred while loading this video.";
    if (event.data === 101 || event.data === 150) {
      errorMsg = "The owner of this YouTube video does not allow embedded playback outside of YouTube.";
    } else if (event.data === 2) {
      errorMsg = "Invalid YouTube video ID or corrupted URL.";
    }
    setVideoError(errorMsg);
  };

  const handleVideoCompletion = async () => {
    if (!video) return;
    try {
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

  const extractVideoId = (url) => {
    if (!url) return null;
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
        <Typography color="text.secondary">Select a video from the playlist below to start watching</Typography>
      </Box>
    );
  }

  const videoId = video.video_id || extractVideoId(video.url);
  const directUrl = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

  return (
    <Box sx={{
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      background: '#000'
    }}>
      <Box>
        {videoId && !videoError ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onError={handleVideoError}
            onStateChange={handleVideoStateChange}
            style={{ width: '100%' }}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#1e293b', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3, maxWidth: 600 }}>
              {videoError || "Invalid Video ID or URL"}
            </Alert>
            <Typography variant="body1" color="white" mb={2}>
              Don't worry! You can watch this video directly on YouTube or select another recommended video below.
            </Typography>
            {directUrl && (
              <a href={directUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box component="span" sx={{ px: 3, py: 1.5, bgcolor: '#ef4444', color: 'white', borderRadius: 2, fontWeight: 700, display: 'inline-block' }}>
                  Open Direct YouTube Link
                </Box>
              </a>
            )}
          </Box>
        )}

        <Box sx={{ p: 3, background: 'rgba(20, 20, 35, 0.9)' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            {video.title || 'Educational Lecture Video'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {video.description || 'Watch the lecture carefully to prepare for the lab challenge and exercises.'}
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


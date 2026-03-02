import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Tabs, Tab, Button, LinearProgress, Avatar,
  Accordion, AccordionSummary, AccordionDetails, CircularProgress, Alert, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { lectureAPI, contentAPI, gameAPI, taxonomyAPI } from '../services/api';
import VideoPlayer from './VideoPlayer';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        const lectureRes = await lectureAPI.getById(id);
        const lectureData = lectureRes.data.lecture;
        setLecture(lectureData);

        if (lectureData) {
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
          {lecture?.title || 'Understanding Incubation and Entrepreneurship Prof. B K Chakravarthy'}
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
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748b' }, '& .Mui-selected': { color: '#0f172a' } }}>
                <Tab label="Review" />
                <Tab label="Quiz" />
                <Tab label="Discussion" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Course Review</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>Share your thoughts and rate this course. Your feedback helps improve the learning experience.</Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>Reviews (2)</Typography>

                  {/* Mock Review */}
                  <Box sx={{ display: 'flex', gap: 2, p: 3, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#8b5cf6' }}>S</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Sanjaykumar</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>1 day ago</Typography>
                      </Box>
                      <Box sx={{ color: '#fbbf24', mb: 1, fontSize: '0.875rem' }}>★★★★☆ 4/5</Box>
                      <Typography variant="body2" sx={{ color: '#475569' }}>Good & well Explained easy to understand.</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Quiz</Typography>
                  <Button variant="contained" sx={{ bgcolor: '#2563eb', color: '#fff' }}>Start Quiz</Button>
                </Box>
              )}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Discussion</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>No discussions yet.</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column (Progress + Accordion) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>Course Progress</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>0% Complete</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>0/0 Lessons</Typography>
              </Box>
              <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e7ff', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', mt: 4, mb: 2 }}>Course Content</Typography>

              {/* Accordion List */}
              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>week-01</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto', alignSelf: 'center' }}>1 lecture</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: '#eff6ff', borderRadius: 2, color: '#2563eb', border: '1px solid #bfdbfe' }}>
                    <PlayCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>Lecture 1: Introduction to Enter...</Typography>
                    <Chip label="Playing" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'transparent', color: '#2563eb', border: 'none' }} />
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important', mt: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>week-02</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto', alignSelf: 'center' }}>1 lecture</Typography>
                </AccordionSummary>
              </Accordion>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important', mt: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>week-03</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto', alignSelf: 'center' }}>3 lectures</Typography>
                </AccordionSummary>
              </Accordion>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important', mt: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>week-04</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto', alignSelf: 'center' }}>2 lectures</Typography>
                </AccordionSummary>
              </Accordion>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '8px !important', mt: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>week-05</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto', alignSelf: 'center' }}>3 lectures</Typography>
                </AccordionSummary>
              </Accordion>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LectureDetail;

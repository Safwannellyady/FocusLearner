import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Card, Button, Chip, IconButton, LinearProgress
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { lectureAPI } from '../services/api';

const MyCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const res = await lectureAPI.getAll();
            setCourses(res.data.lectures || []);
        } catch (err) {
            console.error('Error loading sessions:', err);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                    My Focus Sessions
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Track your progress and continue learning
                </Typography>
            </Box>

            {/* Courses List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(courses.length > 0 ? courses : [1]).map((course, idx) => (
                    <Card key={idx} sx={{ display: 'flex', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' }}>
                        {/* Left Image Placeholder */}
                        <Box sx={{
                            width: 240,
                            bgcolor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            <Chip label="Not Started" size="small" sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#e2e8f0', color: '#475569', fontWeight: 600, borderRadius: 1 }} />
                            <MenuBookIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
                        </Box>

                        {/* Right Content */}
                        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', maxWidth: '80%' }}>
                                    {course.title || "FocusLearner Demo Course: AI & Adaptive Learning"}
                                </Typography>
                                <IconButton size="small" sx={{ color: '#cbd5e1' }}>
                                    <StarBorderIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600, mb: 1 }}>
                                    Progress 0%
                                </Typography>
                                <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e7ff', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 'auto' }}>
                                <Button variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', textTransform: 'none', px: 3 }}>
                                    View Details
                                </Button>
                                <Button variant="contained" onClick={() => navigate(course.id ? `/lecture/${course.id}` : '/lecture/1')} sx={{ borderRadius: 2, bgcolor: '#2563eb', color: '#ffffff', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#1d4ed8' } }}>
                                    Start Session
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default MyCourses;

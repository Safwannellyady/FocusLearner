import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Paper, LinearProgress, Chip, IconButton,
    Card, CardContent, Divider, CircularProgress, Button, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { gameAPI } from '../services/api';
import { motion } from 'framer-motion';

const ProgressDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await gameAPI.getStats();
                setStats(res.data.stats);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0f0f15">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f15', color: 'white', pb: 8 }}>
            <Container maxWidth="lg" sx={{ pt: 4 }}>
                <Box mb={4} display="flex" alignItems="center">
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'white', mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">My Learning Progress</Typography>
                </Box>

                {/* Subject Summary Cards */}
                <Typography variant="h6" gutterBottom color="#a78bfa">Subject Mastery</Typography>
                <Grid container spacing={3} mb={6}>
                    {stats?.subject_summary.map((subj) => (
                        <Grid item xs={12} sm={6} md={4} key={subj.subject}>
                            <Paper sx={{
                                p: 3,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                borderRadius: 4,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">{subj.subject}</Typography>
                                    <Chip label={`${subj.mastered_count} Mastered`} size="small" color="success" variant="outlined" />
                                </Box>
                                <Box display="flex" alignItems="center" gap={2} mb={1}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={subj.avg_proficiency}
                                        sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <Typography variant="body2" fontWeight="bold">{subj.avg_proficiency}%</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {subj.topics_started} topics started
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                    {(!stats?.subject_summary || stats.subject_summary.length === 0) && (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#90caf9' }}>
                                Start some activities to track your progress!
                            </Alert>
                        </Grid>
                    )}
                </Grid>

                <Grid container spacing={4}>
                    {/* Weak Areas */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'rgba(255, 50, 50, 0.05)', border: '1px solid rgba(255, 50, 50, 0.2)', borderRadius: 4 }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <WarningAmberIcon color="error" />
                                    <Typography variant="h6" color="error">Needs Attention</Typography>
                                </Box>
                                {stats?.weak_areas.length > 0 ? (
                                    stats.weak_areas.map((topic) => (
                                        <Box key={topic.topic} mb={2} p={2} bgcolor="rgba(0,0,0,0.2)" borderRadius={2}>
                                            <Typography variant="subtitle1">{topic.topic}</Typography>
                                            <Typography variant="caption" color="text.secondary">{topic.subject}</Typography>
                                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={topic.proficiency_score}
                                                    color="error"
                                                    sx={{ flexGrow: 1 }}
                                                />
                                                <Typography variant="caption">{Math.floor(topic.proficiency_score)}%</Typography>
                                            </Box>
                                            <Button
                                                size="small"
                                                color="error"
                                                sx={{ mt: 1 }}
                                                onClick={() => navigate(`/lecture/${topic.subject}`)} // Rough navigation
                                            >
                                                Retry Lab
                                            </Button>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.secondary" align="center" py={4}>No critical weak areas found. Keep it up!</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Activity */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <TrendingUpIcon color="primary" />
                                    <Typography variant="h6">Recent Activity</Typography>
                                </Box>
                                {stats?.recent_activity.map((topic, i) => (
                                    <Box key={i}>
                                        <Box display="flex" justifyContent="space-between" py={1.5}>
                                            <Box>
                                                <Typography variant="body1">{topic.topic}</Typography>
                                                <Typography variant="caption" color="text.secondary">{topic.subject}</Typography>
                                            </Box>
                                            <Box textAlign="right">
                                                <Typography
                                                    variant="body2"
                                                    color={topic.state === 'MASTERED' ? 'success.main' : 'warning.main'}
                                                    fontWeight="bold"
                                                >
                                                    {topic.state.replace('_', ' ')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {Math.floor(topic.proficiency_score)}% Prof.
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {i < stats.recent_activity.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ProgressDashboard;

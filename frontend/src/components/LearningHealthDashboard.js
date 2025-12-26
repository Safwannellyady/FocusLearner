import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, LinearProgress,
    CircularProgress, Chip, Card, CardContent
} from '@mui/material';
import { analyticsAPI } from '../services/api';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import WhatshotIcon from '@mui/icons-material/Whatshot'; // Consistency
import VisibilityIcon from '@mui/icons-material/Visibility'; // Focus
import PsychologyIcon from '@mui/icons-material/Psychology'; // Stability (Topics)
import RefreshIcon from '@mui/icons-material/Refresh'; // Resilience

const MetricCard = ({ title, value, icon, color, description }) => (
    <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', height: '100%' }}>
        <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}20`, color: color, mr: 2 }}>
                    {icon}
                </Box>
                <Typography variant="h6" color="white">{title}</Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color={color} gutterBottom>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
            <Box mt={2} width="100%">
                <LinearProgress
                    variant="determinate"
                    value={parseFloat(value)}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: color }
                    }}
                />
            </Box>
        </CardContent>
    </Card>
);

const LearningHealthDashboard = () => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await analyticsAPI.getHealth();
                setHealthData(response.data);
            } catch (error) {
                console.error("Failed to fetch health data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box p={4}><CircularProgress /></Box>;
    if (!healthData) return <Typography color="error">Health data unavailable</Typography>;

    const { metrics, overall_health, insights } = healthData;

    // Health Level Color
    const getHealthColor = (score) => {
        if (score >= 80) return '#4ade80'; // Green
        if (score >= 50) return '#fbbf24'; // Yellow
        return '#f87171'; // Red
    };

    return (
        <Box sx={{ p: 0 }}>
            {/* Header / Overall */}
            <Paper sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #1e1e2e 0%, #1a1a2e 100%)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography variant="overline" color="text.secondary" letterSpacing={2}>META-COGNITIVE SIGNAL</Typography>
                    <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                        Learning Health
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                        {insights.map((insight, idx) => (
                            <Chip key={idx} label={insight} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                        ))}
                    </Box>
                </Box>

                <Box position="relative" display="inline-flex">
                    <CircularProgress
                        variant="determinate"
                        value={overall_health}
                        size={120}
                        thickness={4}
                        sx={{ color: getHealthColor(overall_health) }}
                    />
                    <Box
                        sx={{
                            top: 0, left: 0, bottom: 0, right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h4" component="div" color="white" fontWeight="bold">
                            {overall_health}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">SCORE</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Metrics Grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Consistency"
                        value={metrics.consistency}
                        icon={<WhatshotIcon />}
                        color="#f97316"
                        description="Regular practice streak"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Deep Focus"
                        value={metrics.focus}
                        icon={<VisibilityIcon />}
                        color="#8b5cf6"
                        description="Attention span during tasks"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Resilience"
                        value={metrics.resilience}
                        icon={<RefreshIcon />}
                        color="#3b82f6"
                        description="Recovery from failure"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Stability"
                        value={metrics.stability}
                        icon={<PsychologyIcon />}
                        color="#ec4899"
                        description="Concept retention avg"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default LearningHealthDashboard;

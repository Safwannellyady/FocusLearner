import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    useTheme,
    Button
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ trends: [], distribution: [] });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await analyticsAPI.getSummary();
            setData(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={4}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'white' } }}
                >
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                    Learning Analytics
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Weekly Trends Chart */}
                <Grid item xs={12} md={8}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            sx={{
                                p: 3,
                                background: 'rgba(20, 20, 35, 0.6)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                height: '400px'
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                                Weekly Focus Trends (Minutes)
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={data.trends}>
                                    <defs>
                                        <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="minutes" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMinutes)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Subject Distribution */}
                <Grid item xs={12} md={4}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Paper
                            sx={{
                                p: 3,
                                background: 'rgba(20, 20, 35, 0.6)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                height: '400px'
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                                Subject Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={data.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Summary Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Focus Time</Typography>
                                <Typography variant="h3" fontWeight="700">
                                    {Math.round(data.trends.reduce((acc, curr) => acc + curr.minutes, 0))} <span style={{ fontSize: '1rem' }}>mins</span>
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Active Subjects</Typography>
                                <Typography variant="h3" fontWeight="700">{data.distribution.length}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Most Focused</Typography>
                                <Typography variant="h5" fontWeight="700" sx={{ mt: 1 }}>
                                    {data.distribution.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </Container>
    );
};

export default AnalyticsDashboard;

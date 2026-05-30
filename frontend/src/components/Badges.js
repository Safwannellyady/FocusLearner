import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, Card, Avatar } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NightlightIcon from '@mui/icons-material/Nightlight';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { badgesAPI } from '../services/api';

const getIcon = (iconName, earned) => {
    const props = { sx: { fontSize: 40, color: earned ? '#2563eb' : '#cbd5e1' } };
    switch (iconName) {
        case 'Timer': return <TimerIcon {...props} />;
        case 'EmojiEvents': return <EmojiEventsIcon {...props} />;
        case 'LocalFireDepartment': return <LocalFireDepartmentIcon {...props} />;
        case 'Nightlight': return <NightlightIcon {...props} />;
        default: return <EmojiEventsOutlinedIcon {...props} />;
    }
};

const Badges = () => {
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await badgesAPI.getBadges();
                if (response.data && response.data.badges) {
                    setBadges(response.data.badges);
                }
            } catch (err) {
                console.error("Failed to fetch badges", err);
            }
        };
        fetchBadges();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    My Badges
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    View the badges earned from deep focus sessions and tough challenges.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {badges.map((badge) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                            opacity: badge.earned ? 1 : 0.6,
                            border: badge.earned ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <Avatar sx={{
                                width: 80,
                                height: 80,
                                bgcolor: badge.earned ? '#eff6ff' : '#f8fafc',
                                mb: 2
                            }}>
                                {getIcon(badge.icon, badge.earned)}
                            </Avatar>
                            <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                                {badge.name}
                            </Typography>
                            <Typography variant="body2" align="center" color="text.secondary">
                                {badge.description}
                            </Typography>
                            {badge.earned && (
                                <Typography variant="caption" sx={{ mt: 2, color: '#10b981', fontWeight: 600 }}>
                                    Earned!
                                </Typography>
                            )}
                        </Card>
                    </Grid>
                ))}
                {badges.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <Typography color="text.secondary">Loading badges...</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default Badges;

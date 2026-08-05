import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    CircularProgress,
    Divider
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { gameAPI } from '../services/api';

const Leaderboard = ({ moduleId = 'global' }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [moduleId]);

    const loadLeaderboard = async () => {
        setLoading(true);
        let currentUser = null;
        try {
            const uStr = localStorage.getItem('user');
            if (uStr) currentUser = JSON.parse(uStr);
        } catch {}
        const currentName = currentUser?.username || currentUser?.full_name || 'Learner';

        try {
            const response = await gameAPI.getLeaderboard(moduleId);
            let board = response?.data?.leaderboard || [];
            
            // Check if current user is in leaderboard, else include them
            if (currentUser && !board.some(p => (p.user_name || p.username) === currentName)) {
                board.push({
                    user_name: currentName,
                    username: currentName,
                    score: 0,
                    level: 1,
                    metric: 'XP'
                });
            }
            setLeaders(board);
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            setLeaders([
                { user_name: currentName, username: currentName, score: 0, level: 1 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getTrophyColor = (index) => {
        if (index === 0) return '#ffd700'; // Gold
        if (index === 1) return '#c0c0c0'; // Silver
        if (index === 2) return '#cd7f32'; // Bronze
        return 'transparent';
    };

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(180deg, rgba(20,20,35,0.8) 0%, rgba(30,30,50,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            height: '100%'
        }}>
            <Box display="flex" alignItems="center" mb={3} gap={2}>
                <EmojiEventsIcon sx={{ color: '#ffd700', fontSize: 32 }} />
                <Typography variant="h5" fontWeight="bold">Top Learners</Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {leaders.map((player, index) => (
                        <React.Fragment key={index}>
                            <ListItem sx={{
                                py: 2,
                                borderRadius: 2,
                                mb: 1,
                                background: index < 3 ? 'rgba(255,255,255,0.03)' : 'transparent',
                                border: index === 0 ? '1px solid rgba(255, 215, 0, 0.2)' : 'none'
                            }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        fontWeight: 'bold',
                                        color: index < 3 ? getTrophyColor(index) : 'text.secondary',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    #{index + 1}
                                </Box>
                                <ListItemAvatar>
                                    <Avatar sx={{
                                        bgcolor: getRandomColor(player.user_name || player.username || 'User'),
                                        border: `2px solid ${getTrophyColor(index)}`
                                    }}>
                                        {(player.user_name || player.username || 'U')[0]?.toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography fontWeight="500" color="white">
                                            {player.user_name || player.username}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                                            Level {player.level || Math.floor((player.score || 0) / 100) + 1} • {player.metric || 'XP'}
                                        </Typography>
                                    }
                                />
                                <Typography variant="h6" color="#a78bfa" fontWeight="bold">
                                    {(player.score || 0).toLocaleString()} XP
                                </Typography>
                            </ListItem>
                            {index < leaders.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Paper>
    );
};

// Helper for random consistent colors
const getRandomColor = (stringInput) => {
    let hash = 0;
    for (let i = 0; i < stringInput.length; i++) {
        hash = stringInput.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
}

export default Leaderboard;

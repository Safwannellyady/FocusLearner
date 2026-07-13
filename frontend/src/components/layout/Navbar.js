import React from 'react';
import { Box, Typography, Button, Avatar, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { useFocusTimer } from '../../context/FocusContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { studyDuration, breakDuration, timeLeft, timerActive, isStudying } = useFocusTimer();

    const userStr = localStorage.getItem('user');
    let user = { name: "Focus Learner" }; // Fallback name
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) { }
    }
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'FL';

    const formatCountdown = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}.${s}`;
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            height: 72,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
        }}>
            {/* Center Links */}
            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, justifyContent: 'center' }}>
                <Typography onClick={() => navigate('/dashboard')} variant="body2" sx={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Home</Typography>
                <Typography onClick={() => navigate('/dashboard')} variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Programs <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} /></Typography>
                <Typography onClick={() => navigate('/courses')} variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}>Courses</Typography>
                <Typography onClick={() => navigate('/manage-focus')} variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Applications <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} /></Typography>
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title="Visual Countdown: Remaining Focus Time (F) & Break Time (B). Click to manage timers.">
                    <Box 
                        onClick={() => navigate('/manage-focus')}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            px: 2, 
                            py: 0.6, 
                            borderRadius: 20, 
                            bgcolor: timerActive ? (isStudying ? '#eff6ff' : '#ecfdf5') : '#f8fafc', 
                            border: '1px solid',
                            borderColor: timerActive ? (isStudying ? '#60a5fa' : '#34d399') : '#cbd5e1',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#94a3b8', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.82rem', color: isStudying ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center' }}>
                            {timerActive && isStudying && <span style={{ marginRight: 5, color: '#2563eb' }}>●</span>}
                            F={formatCountdown(isStudying ? timeLeft : studyDuration)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold' }}>|</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.82rem', color: !isStudying ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center' }}>
                            {timerActive && !isStudying && <span style={{ marginRight: 5, color: '#10b981' }}>●</span>}
                            B={formatCountdown(!isStudying ? timeLeft : breakDuration)}
                        </Typography>
                    </Box>
                </Tooltip>

                <Button onClick={() => navigate('/focus')} variant="contained" size="small" sx={{ borderRadius: 20, bgcolor: '#2563eb', color: '#ffffff', textTransform: 'none', px: 2, py: 0.5, boxShadow: 'none' }}>
                    Focus Mode
                </Button>
                <Tooltip title="Profile & Advanced Settings">
                    <Avatar 
                        onClick={() => navigate('/preferences')}
                        sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                    >
                        {initials}
                    </Avatar>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default Navbar;

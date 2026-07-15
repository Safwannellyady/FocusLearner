import React from 'react';
import { Box, Typography, Button, Avatar, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { useFocusTimer } from '../../context/FocusContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { timeLeft, timerActive, isStudying } = useFocusTimer();

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
            px: { xs: 2, md: 4 },
            height: 72,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            transition: 'all 0.3s ease',
            flexShrink: 0
        }}>
            {/* Center Links with Micro-Hover Transitions */}
            <Box sx={{ display: 'flex', gap: 3.5, flexGrow: 1, justifyContent: 'center' }}>
                {[
                    { label: 'Home', path: '/dashboard', hasArrow: false },
                    { label: 'Programs', path: '/dashboard', hasArrow: true },
                    { label: 'Courses', path: '/courses', hasArrow: false },
                    { label: 'Applications', path: '/manage-focus', hasArrow: true }
                ].map((item) => (
                    <Box
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            py: 0.5,
                            '&:hover .nav-text': { color: '#2563eb' },
                            '&:hover .nav-line': { width: '100%' }
                        }}
                    >
                        <Typography
                            className="nav-text"
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: '#334155',
                                transition: 'color 0.25s ease',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {item.label}
                            {item.hasArrow && <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.3, transition: 'transform 0.25s ease', '.nav-text:hover &': { transform: 'rotate(180deg)' } }} />}
                        </Typography>
                        <Box
                            className="nav-line"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '0%',
                                height: 2,
                                bgcolor: '#2563eb',
                                borderRadius: 1,
                                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                    </Box>
                ))}
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title={`Current Active Session: ${isStudying ? 'Focus Time' : 'Break Time'}. Click to manage timers.`}>
                    <Box 
                        onClick={() => navigate('/manage-focus')}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.2, 
                            px: 2.2, 
                            py: 0.6, 
                            borderRadius: 20, 
                            bgcolor: isStudying ? '#eff6ff' : '#ecfdf5', 
                            border: '1.5px solid',
                            borderColor: isStudying ? '#3b82f6' : '#10b981',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: timerActive ? (isStudying ? 'pulse-focus 2s infinite' : 'pulse-break 2s infinite') : 'none',
                            '@keyframes pulse-focus': {
                                '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
                                '70%': { boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }
                            },
                            '@keyframes pulse-break': {
                                '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                                '70%': { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                            },
                            '&:hover': { transform: 'scale(1.03)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                        }}
                    >
                        <Box 
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: timerActive ? (isStudying ? '#2563eb' : '#10b981') : '#94a3b8',
                                animation: timerActive ? 'blink 1.2s infinite ease-in-out' : 'none',
                                '@keyframes blink': {
                                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                    '50%': { opacity: 0.4, transform: 'scale(0.8)' }
                                }
                            }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.85rem', color: isStudying ? '#1e40af' : '#065f46', letterSpacing: '0.02em' }}>
                            {isStudying ? `F=${formatCountdown(timeLeft)}` : `B=${formatCountdown(timeLeft)}`}
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

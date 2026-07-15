import React from 'react';
import { Box, Typography, Button, Avatar, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFocusTimer } from '../../context/FocusContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
            px: { xs: 3, md: 5 },
            height: 76,
            bgcolor: 'rgba(17, 24, 39, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            transition: 'all 0.3s ease',
            flexShrink: 0
        }}>
            {/* Brand / Logo Section */}
            <Box onClick={() => navigate('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                <Box sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}>
                    <AutoAwesomeIcon sx={{ color: '#ffffff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                    FocusLearner <span style={{ color: '#6366f1', fontWeight: 900 }}>Academic</span>
                </Typography>
            </Box>

            {/* Center Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5, alignItems: 'center' }}>
                {[
                    { label: 'Dashboard', path: '/dashboard', hasArrow: false },
                    { label: 'Curriculums', path: '/courses', hasArrow: false },
                    { label: 'Study Cockpit', path: '/manage-focus', hasArrow: true },
                    { label: 'Preferences', path: '/preferences', hasArrow: false }
                ].map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Box
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                py: 0.8,
                                px: 1.6,
                                borderRadius: '8px',
                                bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.12)',
                                }
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: isActive ? 700 : 500,
                                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    color: isActive ? '#f8fafc' : '#94a3b8',
                                    transition: 'color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {item.label}
                                {item.hasArrow && <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.4, transition: 'transform 0.25s ease', transform: isActive ? 'rotate(180deg)' : 'none' }} />}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Right Status Instrument & Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title={`Study Status: ${isStudying ? 'Focus Period Active' : 'Break Period Active'}. Click to manage.`}>
                    <Box 
                        onClick={() => navigate('/manage-focus')}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.2, 
                            px: 2, 
                            py: 0.7, 
                            borderRadius: '20px', 
                            bgcolor: isStudying ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)', 
                            border: '1px solid',
                            borderColor: isStudying ? '#6366f1' : '#10b981',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'translateY(-1px)', bgcolor: isStudying ? 'rgba(99, 102, 241, 0.18)' : 'rgba(16, 185, 129, 0.18)' }
                        }}
                    >
                        <Box className={isStudying ? "pulse-dot-cyan" : "pulse-dot-emerald"} sx={{ bgcolor: isStudying ? '#6366f1 !important' : '#10b981 !important' }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 700, 
                            fontFamily: 'JetBrains Mono, monospace', 
                            fontSize: '0.85rem', 
                            color: isStudying ? '#a5b4fc' : '#34d399', 
                            letterSpacing: '0.02em'
                        }}>
                            {isStudying ? `Focus ${formatCountdown(timeLeft)}` : `Break ${formatCountdown(timeLeft)}`}
                        </Typography>
                    </Box>
                </Tooltip>

                <Button 
                    onClick={() => navigate('/focus')} 
                    variant="contained"
                    sx={{
                        bgcolor: '#6366f1',
                        color: '#ffffff',
                        fontWeight: 600,
                        px: 2.5,
                        py: 0.8,
                        borderRadius: '10px',
                        '&:hover': { bgcolor: '#4f46e5' }
                    }}
                    size="small"
                >
                    Enter Focus Lock
                </Button>

                <Tooltip title="Profile & Settings">
                    <Avatar 
                        onClick={() => navigate('/preferences')}
                        sx={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            width: 38, 
                            height: 38, 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: '#6366f1' }
                        }}
                    >
                        {initials}
                    </Avatar>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default Navbar;

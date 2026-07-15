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
            bgcolor: 'rgba(8, 10, 24, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            flexShrink: 0
        }}>
            {/* Brand / Logo Section */}
            <Box onClick={() => navigate('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                <Box sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(0, 242, 254, 0.5)'
                }}>
                    <AutoAwesomeIcon sx={{ color: '#03040b', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #ffffff 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    FocusLearner<span style={{ color: '#00f2fe', WebkitTextFillColor: '#00f2fe' }}>.PRO</span>
                </Typography>
            </Box>

            {/* Center High-Tech Floating Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
                {[
                    { label: 'Command Center', path: '/dashboard', hasArrow: false },
                    { label: 'AI Curriculums', path: '/courses', hasArrow: false },
                    { label: 'Focus Cockpit', path: '/manage-focus', hasArrow: true },
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
                                px: 1.5,
                                borderRadius: '10px',
                                bgcolor: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                                border: isActive ? '1px solid rgba(0, 242, 254, 0.35)' : '1px solid transparent',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                                    borderColor: 'rgba(255, 255, 255, 0.18)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: isActive ? 800 : 600,
                                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    color: isActive ? '#00f2fe' : '#94a3b8',
                                    transition: 'color 0.25s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textShadow: isActive ? '0 0 12px rgba(0, 242, 254, 0.6)' : 'none'
                                }}
                            >
                                {item.label}
                                {item.hasArrow && <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.4, transition: 'transform 0.25s ease', transform: isActive ? 'rotate(180deg)' : 'none' }} />}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Right Telemetry Instrument & Actions */}
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                <Tooltip title={`Live HUD Telemetry: ${isStudying ? 'Focus Protocol Active' : 'Rest Sequence Running'}. Click to configure.`}>
                    <Box 
                        onClick={() => navigate('/manage-focus')}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            px: 2.4, 
                            py: 0.8, 
                            borderRadius: '24px', 
                            bgcolor: isStudying ? 'rgba(0, 242, 254, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                            border: '1.5px solid',
                            borderColor: isStudying ? '#00f2fe' : '#10b981',
                            cursor: 'pointer',
                            boxShadow: isStudying 
                                ? '0 0 20px rgba(0, 242, 254, 0.35), inset 0 0 10px rgba(0, 242, 254, 0.15)' 
                                : '0 0 20px rgba(16, 185, 129, 0.35), inset 0 0 10px rgba(16, 185, 129, 0.15)',
                            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            '&:hover': { transform: 'scale(1.04) translateY(-1px)', boxShadow: isStudying ? '0 0 30px rgba(0, 242, 254, 0.55)' : '0 0 30px rgba(16, 185, 129, 0.55)' }
                        }}
                    >
                        <Box className={isStudying ? "pulse-dot-cyan" : "pulse-dot-emerald"} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 800, 
                            fontFamily: 'JetBrains Mono, monospace', 
                            fontSize: '0.9rem', 
                            color: isStudying ? '#00f2fe' : '#34d399', 
                            letterSpacing: '0.04em',
                            textShadow: isStudying ? '0 0 10px rgba(0, 242, 254, 0.8)' : '0 0 10px rgba(16, 185, 129, 0.8)'
                        }}>
                            {isStudying ? `F=${formatCountdown(timeLeft)}` : `B=${formatCountdown(timeLeft)}`}
                        </Typography>
                    </Box>
                </Tooltip>

                <Button 
                    onClick={() => navigate('/focus')} 
                    className="epic-btn-primary"
                    size="small"
                >
                    🚀 Enter Focus Lock
                </Button>

                <Tooltip title="Operator Profile & System Settings">
                    <Avatar 
                        onClick={() => navigate('/preferences')}
                        sx={{ 
                            background: 'linear-gradient(135deg, #7b2cbf 0%, #3a0ca3 100%)', 
                            border: '2px solid rgba(157, 78, 221, 0.6)',
                            boxShadow: '0 0 15px rgba(157, 78, 221, 0.5)',
                            width: 40, 
                            height: 40, 
                            fontSize: '0.9rem', 
                            fontWeight: 800, 
                            cursor: 'pointer', 
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'scale(1.1) rotate(5deg)', borderColor: '#00f2fe', boxShadow: '0 0 25px rgba(0, 242, 254, 0.6)' }
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

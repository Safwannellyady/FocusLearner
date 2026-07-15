import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import ViewListIcon from '@mui/icons-material/ViewList';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Create a Focus Session', icon: <MenuBookIcon />, path: '/courses' },
    { text: 'My Focus Sessions', icon: <SchoolIcon />, path: '/my-courses' },
    { text: 'Manage Focus Period', icon: <AssignmentIcon />, path: '/manage-focus' },
    { text: 'Badges', icon: <WorkspacePremiumIcon />, path: '/badges' },
];

const Sidebar = ({ open, setOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <Box sx={{
            width: open ? 260 : 88,
            flexShrink: 0,
            bgcolor: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            transition: 'all 0.3s ease',
            overflowX: 'hidden',
            boxShadow: '10px 0 30px -15px rgba(0, 0, 0, 0.5)',
            zIndex: 1150
        }}>
            {/* Brand Logo Area */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', height: 76, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', gap: open ? 2 : 0, justifyContent: open ? 'flex-start' : 'center' }}>
                <Box sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}>
                    <AutoAwesomeIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                {open && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f8fafc', whiteSpace: 'nowrap', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                            FocusLearner <span style={{ color: '#6366f1', fontWeight: 900 }}>Academic</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>
                            STUDY & FOCUS STUDIO
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Menu Label & Toggle */}
            <Box sx={{ px: 3, pt: 3, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {open && <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em', fontSize: '0.75rem', textTransform: 'uppercase' }}>STUDY NAVIGATION</Typography>}
                <IconButton size="small" onClick={() => setOpen(!open)} sx={{ mx: open ? 0 : 'auto', color: '#94a3b8', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Navigation List */}
            <List sx={{ flexGrow: 1, px: 1.5 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: '12px',
                                mb: 0.8,
                                py: 1.2,
                                bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                color: isActive ? '#f8fafc' : '#94a3b8',
                                '&:hover': { 
                                    bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                                    color: '#f8fafc',
                                    transform: 'translateX(3px)'
                                },
                                transition: 'all 0.2s ease',
                                justifyContent: open ? 'flex-start' : 'center',
                                px: open ? 2 : 1,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: isActive ? '#6366f1' : 'inherit', justifyContent: 'center' }}>
                                {React.cloneElement(item.icon, { fontSize: isActive && open ? "medium" : "small" })}
                            </ListItemIcon>
                            {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: isActive ? 700 : 500 }} />}
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom Actions */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <List disablePadding>
                    <ListItem 
                        button 
                        onClick={() => navigate('/preferences')} 
                        sx={{ 
                            borderRadius: '12px', 
                            color: '#94a3b8', 
                            mb: 0.8, 
                            py: 1,
                            px: open ? 2 : 1, 
                            justifyContent: open ? 'flex-start' : 'center',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#f8fafc' },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: 'inherit', justifyContent: 'center' }}><SettingsIcon fontSize="small" /></ListItemIcon>
                        {open && <ListItemText primary="Profile Settings" primaryTypographyProps={{ fontSize: '0.88rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }} />}
                    </ListItem>

                    <ListItem 
                        button 
                        onClick={handleLogout} 
                        sx={{ 
                            borderRadius: '12px', 
                            color: '#ef4444', 
                            py: 1,
                            px: open ? 2 : 1, 
                            justifyContent: open ? 'flex-start' : 'center',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#f87171' },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: 'inherit', justifyContent: 'center' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                        {open && <ListItemText primary="Logout Session" primaryTypographyProps={{ fontSize: '0.88rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }} />}
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
};

export default Sidebar;

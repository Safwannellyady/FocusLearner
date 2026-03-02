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
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Browse Courses', icon: <MenuBookIcon />, path: '/courses' },
    { text: 'My Courses', icon: <SchoolIcon />, path: '/my-courses' },
    { text: 'My Enrollments', icon: <ViewListIcon />, path: '/enrollments' },
    { text: 'My Applications', icon: <AssignmentIcon />, path: '/applications' },
    { text: 'Certificates', icon: <WorkspacePremiumIcon />, path: '/certificates' },
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
            width: open ? 240 : 80,
            flexShrink: 0,
            bgcolor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            transition: 'width 0.2s',
            overflowX: 'hidden'
        }}>
            {/* Logo Area */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', height: 72, borderBottom: '1px solid #e2e8f0', gap: open ? 2 : 0, justifyContent: open ? 'flex-start' : 'center' }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#f1f5f9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/en/e/e0/Visvesvaraya_Technological_University_logo.png" alt="VTU Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </Box>
                {open && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            Centre for Online Education
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                            VTU - Belagavi <br /><span style={{ fontSize: '0.55rem' }}>Govt. of Karnataka</span>
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Menu Label */}
            <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {open && <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Menu</Typography>}
                <IconButton size="small" onClick={() => setOpen(!open)} sx={{ mx: open ? 0 : 'auto' }}>
                    <MenuIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Navigation List */}
            <List sx={{ flexGrow: 1, px: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                bgcolor: isActive ? '#f1f5f9' : 'transparent',
                                color: isActive ? '#0f172a' : '#64748b',
                                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
                                justifyContent: open ? 'flex-start' : 'center',
                                px: open ? 2 : 1,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: 'inherit', justifyContent: 'center' }}>
                                {React.cloneElement(item.icon, { fontSize: isActive && open ? "medium" : "small" })}
                            </ListItemIcon>
                            {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }} />}
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom Actions */}
            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                <List disablePadding>
                    <ListItem button onClick={handleLogout} sx={{ borderRadius: 2, color: '#64748b', mb: 1, px: open ? 2 : 1, justifyContent: open ? 'flex-start' : 'center' }}>
                        <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: 'inherit', justifyContent: 'center' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                        {open && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />}
                    </ListItem>
                    <ListItem button sx={{ borderRadius: 2, color: '#64748b', px: open ? 2 : 1, justifyContent: open ? 'flex-start' : 'center' }}>
                        <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: 'inherit', justifyContent: 'center' }}><SettingsIcon fontSize="small" /></ListItemIcon>
                        {open && <ListItemText primary="Profile Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />}
                    </ListItem>
                </List>
            </Box>
        </Box>
    );
};

export default Sidebar;

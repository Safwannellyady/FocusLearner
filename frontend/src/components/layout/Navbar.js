import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    let user = { name: "Focus Learner" }; // Fallback name
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) { }
    }
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'FL';

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
                <Button variant="contained" size="small" sx={{ borderRadius: 20, bgcolor: '#2563eb', color: '#ffffff', textTransform: 'none', px: 2, py: 0.5, boxShadow: 'none' }}>
                    Focus Mode
                </Button>
                <Avatar sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600 }}>
                    {initials}
                </Avatar>
            </Box>
        </Box>
    );
};

export default Navbar;

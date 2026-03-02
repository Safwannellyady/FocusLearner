import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Navbar = () => {
    const userStr = localStorage.getItem('user');
    let user = { name: "GA MAHAMMAD SAFWAN" }; // Mock default matching the screenshot
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) { }
    }
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'GS';

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
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Home</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Programs <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} /></Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}>Courses</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Applications <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} /></Typography>
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button variant="outlined" size="small" sx={{ borderRadius: 20, borderColor: '#cbd5e1', color: '#0f172a', textTransform: 'none', px: 2, py: 0.5 }}>
                    Go to old version
                </Button>
                <Avatar sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 600 }}>
                    {initials}
                </Avatar>
            </Box>
        </Box>
    );
};

export default Navbar;

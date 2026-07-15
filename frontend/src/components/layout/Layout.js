import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0b0f19', color: '#f8fafc', overflow: 'hidden' }}>
            <Sidebar open={open} setOpen={setOpen} />
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                <Navbar />
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;

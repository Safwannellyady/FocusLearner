import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette from '../common/CommandPalette';

const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            height: '100vh', 
            background: 'radial-gradient(circle at 15% 15%, #1e1b4b 0%, #0f172a 50%, #0b0f19 100%)', 
            color: '#f8fafc', 
            overflow: 'hidden' 
        }}>
            <Sidebar open={open} setOpen={setOpen} mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                <Navbar handleDrawerToggle={handleDrawerToggle} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {children}
                </Box>
            </Box>

            <CommandPalette 
                isOpen={commandOpen} 
                onClose={() => setCommandOpen(false)} 
                onNavigate={(path) => navigate(path)} 
            />
        </Box>
    );
};

export default Layout;

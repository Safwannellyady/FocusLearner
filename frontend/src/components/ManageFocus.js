import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import FocusTimer from './FocusTimer';

const ManageFocus = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Manage Focus Period
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Configure your study and break timers. Stay productive!
                </Typography>
            </Box>
            <FocusTimer />
        </Container>
    );
};

export default ManageFocus;

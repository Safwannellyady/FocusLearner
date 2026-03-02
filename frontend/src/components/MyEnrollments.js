import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const MyEnrollments = () => {
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    My Enrollments
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    View past and present courses you have enrolled in.
                </Typography>
            </Box>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="#94a3b8">Enrollments List Pending</Typography>
            </Paper>
        </Container>
    );
};

export default MyEnrollments;

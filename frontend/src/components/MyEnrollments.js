import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const MyEnrollments = () => {
    return (
        <Container maxWidth="xl" sx={{ mt: 5, mb: 8 }}>
            <Box mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', mb: 1 }}>
                    My Enrollments
                </Typography>
                <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '1.02rem' }}>
                    View past and present courses you have enrolled in across your academic journey.
                </Typography>
            </Box>
            <Paper sx={{ p: 6, borderRadius: '16px', bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5" sx={{ color: '#cbd5e1', fontWeight: 700, fontFamily: 'Outfit, sans-serif', mb: 1 }}>No Past Enrollments Found</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>When you complete or archive active focus curriculums, they will be archived here.</Typography>
            </Paper>
        </Container>
    );
};

export default MyEnrollments;

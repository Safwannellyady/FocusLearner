import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'radial-gradient(circle at 15% 50%, rgba(107, 33, 168, 0.15) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 25%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Abstract Background Design Elements */}
            <Box
                component={motion.div}
                animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={10} textAlign="center">

                        {/* Main Headline */}
                        <Typography
                            component={motion.h1}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            variant="h1"
                            sx={{
                                fontSize: { xs: '3rem', md: '5rem' },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                mb: 3,
                                background: 'linear-gradient(to right, #fff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Focus is not a habit.<br />
                            It's an <span style={{ color: '#8b5cf6', WebkitTextFillColor: '#a78bfa' }}>environment.</span>
                        </Typography>

                        {/* Sub-headline */}
                        <Typography
                            component={motion.p}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            variant="h5"
                            sx={{
                                color: 'text.secondary',
                                mb: 6,
                                maxWidth: '600px',
                                mx: 'auto',
                                fontWeight: 400,
                            }}
                        >
                            Master your subjects with a distraction-free learning environment designed for deep work and retention.
                        </Typography>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                startIcon={<PlayArrowIcon />}
                                sx={{
                                    py: 2,
                                    px: 6,
                                    fontSize: '1.25rem',
                                    borderRadius: '50px',
                                    background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                                    boxShadow: '0 0 20px rgba(107, 33, 168, 0.5)',
                                    textTransform: 'none',
                                    '&:hover': {
                                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)',
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            >
                                Start Focus Session
                            </Button>
                        </motion.div>

                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;

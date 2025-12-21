import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Alert,
    Card,
    CardContent,
    CircularProgress,
    Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { gameAPI, focusAPI } from '../../services/api';

const AIChallenge = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [subjectFocus, setSubjectFocus] = useState('General');

    useEffect(() => {
        loadChallenge();
    }, []);

    const loadChallenge = async () => {
        setLoading(true);
        setFeedback(null);
        setUserAnswer('');
        try {
            // Try to get current locked subject
            const focusRes = await focusAPI.getCurrent();
            const currentSubject = focusRes.data.session?.subject_focus || 'General Knowledge';
            setSubjectFocus(currentSubject);

            // Generate challenge based on subject
            const response = await gameAPI.generateChallenge(currentSubject, 1);
            setChallenge(response.data.challenge);
        } catch (error) {
            console.error('Error loading AI challenge:', error);
            setFeedback({ type: 'error', message: 'Failed to load challenge. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!challenge) return;

        // Simple validation (case-insensitive) - improvement: use AI to validate answer too
        const isCorrect = userAnswer.toLowerCase().trim() === String(challenge.answer).toLowerCase().trim();

        if (isCorrect) {
            setFeedback({
                type: 'success',
                message: 'Correct! Great job.',
            });
        } else {
            setFeedback({
                type: 'error',
                message: `Incorrect. The correct answer was: ${challenge.answer}`,
            });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={4}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/games')}
                    sx={{
                        mr: 2,
                        color: 'text.secondary',
                        '&:hover': { color: 'white', background: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: '#a78bfa' }} />
                    <span style={{ background: 'linear-gradient(45deg, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI Adaptive Challenge
                    </span>
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
                    <CircularProgress sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                        Consulting the neural network...
                    </Typography>
                </Box>
            ) : challenge ? (
                <Box sx={{
                    p: 4,
                    background: 'rgba(20, 20, 35, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                            label={subjectFocus}
                            sx={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                fontWeight: 600
                            }}
                        />
                        <Chip
                            label={`${challenge.points} XP`}
                            sx={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'black',
                                fontWeight: 700
                            }}
                        />
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        {challenge.question}
                    </Typography>

                    {challenge.context && (
                        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontStyle: 'italic', borderLeft: '3px solid #6b21a8', pl: 2, py: 1, background: 'rgba(0,0,0,0.2)' }}>
                            {challenge.context}
                        </Typography>
                    )}

                    <Box mt={4}>
                        <TextField
                            fullWidth
                            label="Your Answer"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            sx={{ mb: 3 }}
                            variant="filled"
                            InputProps={{
                                sx: {
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 2,
                                    color: 'white'
                                }
                            }}
                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                            disabled={!!feedback}
                        />

                        {feedback && (
                            <Alert
                                severity={feedback.type}
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: feedback.type === 'success' ? '#4ade80' : '#f87171',
                                    border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}
                                icon={false} // Custom icon structure if needed, or default
                            >
                                <Typography variant="subtitle1" fontWeight="600">
                                    {feedback.type === 'success' ? 'Correct!' : 'Incorrect'}
                                </Typography>
                                {feedback.message}
                            </Alert>
                        )}

                        {feedback ? (
                            <Button
                                variant="contained"
                                onClick={loadChallenge}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                Next Challenge
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!userAnswer}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    background: 'white',
                                    color: '#000',
                                    fontWeight: 700,
                                    '&:hover': { background: '#f1f5f9' },
                                    '&.Mui-disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                Submit Answer
                            </Button>
                        )}
                    </Box>

                    {challenge.hints && !feedback && (
                        <Box mt={3} pt={2} borderTop="1px solid rgba(255,255,255,0.1)">
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Hint: {challenge.hints[0]}
                            </Typography>
                        </Box>
                    )}
                </Box>
            ) : (
                <Alert severity="error">Could not load content.</Alert>
            )}
        </Container>
    );
};

export default AIChallenge;

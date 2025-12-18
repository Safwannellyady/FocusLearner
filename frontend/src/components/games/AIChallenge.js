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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/games')}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4" display="flex" alignItems="center" gap={1}>
                    <AutoAwesomeIcon color="secondary" /> AI Challenge
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : challenge ? (
                <Paper sx={{ p: 4 }}>
                    <Box mb={2}>
                        <Chip label={subjectFocus} color="primary" variant="outlined" />
                        <Chip label={`Points: ${challenge.points}`} sx={{ ml: 1 }} />
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        {challenge.question}
                    </Typography>

                    {challenge.context && (
                        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {challenge.context}
                        </Typography>
                    )}

                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="Your Answer"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            sx={{ mb: 2 }}
                            disabled={!!feedback}
                        />

                        {feedback && (
                            <Alert severity={feedback.type} sx={{ mb: 2 }}>
                                {feedback.message}
                            </Alert>
                        )}

                        {feedback ? (
                            <Button variant="contained" onClick={loadChallenge}>
                                Next Challenge
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleSubmit} disabled={!userAnswer}>
                                Submit Answer
                            </Button>
                        )}
                    </Box>

                    {challenge.hints && !feedback && (
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary">
                                Hint: {challenge.hints[0]}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            ) : (
                <Alert severity="error">Could not load content.</Alert>
            )}
        </Container>
    );
};

export default AIChallenge;

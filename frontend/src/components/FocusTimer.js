import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, Stack, Paper } from '@mui/material';
import { useFocusTimer } from '../context/FocusContext';

const FocusTimer = () => {
    const {
        studyDuration, breakDuration, timeLeft, timerActive, isStudying,
        startTimer, pauseTimer, resetTimer, updateDurations
    } = useFocusTimer();

    const [studyInput, setStudyInput] = useState(studyDuration / 60);
    const [breakInput, setBreakInput] = useState(breakDuration / 60);

    // Sync inputs if context changes externally
    useEffect(() => {
        setStudyInput(Math.floor(studyDuration / 60));
        setBreakInput(Math.floor(breakDuration / 60));
    }, [studyDuration, breakDuration]);

    const handleApply = () => {
        updateDurations(Number(studyInput), Number(breakInput));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const formatCountdown = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}.${s}`;
    };

    return (
        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1, color: isStudying ? '#2563eb' : '#10b981' }}>
                {isStudying ? "Focus Time" : "Break Time"}
            </Typography>
            <Typography variant="h1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                {formatTime(timeLeft)}
            </Typography>

            {/* Single Animated Countdown Status: F=00.00 or B=00.00 */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    mb: 4 
                }}
            >
                <Box 
                    sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        px: 3, 
                        py: 1, 
                        borderRadius: 30, 
                        bgcolor: isStudying ? '#eff6ff' : '#ecfdf5', 
                        border: '2px solid',
                        borderColor: isStudying ? '#3b82f6' : '#10b981',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: timerActive ? (isStudying ? 'pulse-focus-card 2s infinite' : 'pulse-break-card 2s infinite') : 'none',
                        '@keyframes pulse-focus-card': {
                            '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
                            '70%': { boxShadow: '0 0 0 12px rgba(59, 130, 246, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }
                        },
                        '@keyframes pulse-break-card': {
                            '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                            '70%': { boxShadow: '0 0 0 12px rgba(16, 185, 129, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                        }
                    }}
                >
                    <Box 
                        sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: timerActive ? (isStudying ? '#2563eb' : '#10b981') : '#94a3b8',
                            animation: timerActive ? 'blink-dot 1.2s infinite ease-in-out' : 'none',
                            '@keyframes blink-dot': {
                                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                '50%': { opacity: 0.3, transform: 'scale(0.75)' }
                            }
                        }} 
                    />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: isStudying ? '#1e40af' : '#065f46', letterSpacing: '0.03em' }}>
                        {isStudying ? `F=${formatCountdown(timeLeft)}` : `B=${formatCountdown(timeLeft)}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isStudying ? '#3b82f6' : '#10b981' }}>
                        {isStudying ? '(Active Focus Session)' : '(Active Break Session)'}
                    </Typography>
                </Box>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
                {!timerActive ? (
                    <Button variant="contained" color="primary" onClick={startTimer} size="large">Start</Button>
                ) : (
                    <Button variant="contained" color="warning" onClick={pauseTimer} size="large">Pause</Button>
                )}
                <Button variant="outlined" color="primary" onClick={resetTimer} size="large">Reset</Button>
            </Stack>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Configuration</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Study Duration (min)"
                            type="number"
                            fullWidth
                            value={studyInput}
                            onChange={(e) => setStudyInput(e.target.value)}
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Break Duration (min)"
                            type="number"
                            fullWidth
                            value={breakInput}
                            onChange={(e) => setBreakInput(e.target.value)}
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                </Grid>
                <Button variant="contained" color="secondary" onClick={handleApply} sx={{ mt: 2 }} fullWidth>
                    Apply Settings
                </Button>
            </Box>
        </Paper>
    );
};

export default FocusTimer;

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

            {/* Visual Countdown Breakdown for F=00.00 and B=00.00 */}
            <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 4, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isStudying && timerActive ? '#2563eb' : '#94a3b8' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: isStudying ? '#2563eb' : '#64748b' }}>
                        F={formatCountdown(isStudying ? timeLeft : studyDuration)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>(Focus)</Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#cbd5e1' }}>|</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: !isStudying && timerActive ? '#10b981' : '#94a3b8' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: !isStudying ? '#10b981' : '#64748b' }}>
                        B={formatCountdown(!isStudying ? timeLeft : breakDuration)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>(Break)</Typography>
                </Box>
            </Stack>

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

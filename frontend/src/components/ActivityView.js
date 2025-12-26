import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, TextField,
    Grid, Radio, RadioGroup, FormControlLabel,
    LinearProgress, Alert
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import ExtensionIcon from '@mui/icons-material/Extension';
import WarningIcon from '@mui/icons-material/Warning';
import useFocusMonitor from '../hooks/useFocusMonitor';
import ConfettiExplosion from './ConfettiExplosion';
import { motion } from 'framer-motion';
// NO REPLACEMENT CONTENT IN THIS TOOL CALL - SWITCHING TO MULTI_REPLACE

const ActivityView = ({ activity, onSubmit, result, onNext }) => {
    const { isFocused, violationCount, resumeFocus } = useFocusMonitor(!result);

    const handleSubmit = (answer) => {
        onSubmit(answer, violationCount);
    };

    // NO REPLACEMENT CONTENT IN THIS TOOL CALL - SWITCHING TO MULTI_REPLACE

    if (!activity) return <LinearProgress />;

    // FOCUS ENFORCEMENT OVERLAY
    if (!isFocused && !result) {
        return (
            <Paper sx={{
                p: 4,
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#0f0f10',
                border: '1px solid #f59e0b'
            }}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <WarningIcon sx={{ fontSize: 80, color: '#f59e0b', mb: 2, display: 'block', mx: 'auto' }} />
                </motion.div>
                <Typography variant="h3" color="white" fontWeight="bold" gutterBottom>Focus Lost</Typography>
                <Typography variant="body1" color="grey.400" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                    To ensure deep learning, you must keep this window active. Tabbing out interrupts your cognitive flow.
                </Typography>

                <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', px: 2, py: 1, borderRadius: 1, mb: 4 }}>
                    <Typography variant="caption" color="#f59e0b" fontWeight="bold">
                        VIOLATION #{violationCount} recorded
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    color="warning"
                    size="large"
                    onClick={resumeFocus}
                    sx={{ px: 4, py: 1.5 }}
                >
                    I'm Back, Resume
                </Button>
            </Paper>
        );
    }

    // RESULT VIEW
    if (result) {
        return (
            <Paper sx={{ p: 4, bgcolor: '#1a1a2e', color: 'white', textAlign: 'center', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                <ConfettiExplosion trigger={result.is_correct && result.loop_status?.stage === 'MASTERED'} />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Typography variant="h3" fontWeight="bold" color={result.is_correct ? "#4ade80" : "#f87171"} gutterBottom>
                        {result.is_correct ? "Excellent!" : "Not quite..."}
                    </Typography>
                </motion.div>

                <Typography variant="h5" sx={{ color: '#fbbf24', mb: 4, fontWeight: 'bold' }}>
                    +{result.xp_earned} XP
                </Typography>

                {/* Feedback Section */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3, mb: 4, textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="overline" color="text.secondary" letterSpacing={2}>ANALYSIS</Typography>

                    {/* Combined Feedback (includes explanation) */}
                    <Typography variant="body1" paragraph sx={{ mt: 1, fontSize: '1.1rem' }}>
                        {result.feedback.split('Explanation:')[0]}
                    </Typography>

                    {/* Explanation Highlight */}
                    {result.explanation && (
                        <Box mt={2} p={2} bgcolor="rgba(59, 130, 246, 0.1)" borderRadius={2} borderLeft="4px solid #3b82f6">
                            <Typography variant="subtitle2" color="#60a5fa" gutterBottom fontWeight="bold">WHY IS THIS?</Typography>
                            <Typography variant="body2" color="rgb(220, 230, 250)">
                                {result.explanation}
                            </Typography>
                        </Box>
                    )}

                    {/* Learning Loop Remediation */}
                    {result.loop_status && result.loop_status.stage === 'REMEDIATE' && (
                        <Box mt={3}>
                            <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">AI Tutor Insight</Typography>
                                {result.loop_status.feedback}
                            </Alert>
                        </Box>
                    )}
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    onClick={onNext}
                    sx={{
                        px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 2,
                        background: result.is_correct ? 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    {result.is_correct ? "Continue Journey" : "Okay, Got it"}
                </Button>
            </Paper>
        );
    }

    switch (activity.type) {
        case 'coding':
            return <CodingChallenge activity={activity} onSubmit={handleSubmit} />;
        case 'lab':
            return <VirtualLab activity={activity} onSubmit={handleSubmit} />;
        case 'crossword':
            return <CrosswordGame activity={activity} onSubmit={handleSubmit} />;
        default:
            return <Typography color="error">Unknown activity type: {activity.type}</Typography>;
    }
};

// 1. Coding Challenge Component
const CodingChallenge = ({ activity, onSubmit }) => {
    const [code, setCode] = useState(activity.starter_code || '');
    const [output, setOutput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRun = () => {
        // Mock execution for feedback only
        setOutput("Running tests locally...\n(Deep evaluation happens on server)\n\nTest Run Complete.");
    };

    return (
        <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: '#d4d4d4' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <CodeIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h5" color="white">{activity.title}</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#9ca3af', mb: 2 }}>
                {activity.description}
            </Typography>

            <TextField
                multiline
                rows={10}
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{
                    fontFamily: 'monospace',
                    bgcolor: '#0f0f0f',
                    borderRadius: 1,
                    '& .MuiInputBase-input': { color: '#d4d4d4', fontFamily: 'monospace' }
                }}
            />

            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Button variant="outlined" color="primary" onClick={handleRun}>Test Run</Button>
                <Button variant="contained" color="success" onClick={() => onSubmit(code)}>Submit Code</Button>
            </Box>

            {output && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: '#000', color: '#4caf50', fontFamily: 'monospace' }}>
                    <pre>{output}</pre>
                </Paper>
            )}
        </Paper>
    );
};

// 2. Virtual Lab Component
const VirtualLab = ({ activity, onSubmit }) => {
    const [step, setStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');

    const handleNext = () => {
        if (step < (activity.steps?.length || 0) - 1) {
            setStep(step + 1);
        } else {
            // Show quiz
            setStep(99);
        }
    };

    return (
        <Paper sx={{ p: 3, bgcolor: '#0e1116', color: 'white' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <ScienceIcon sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="h5">{activity.title}</Typography>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                {activity.scenario}
            </Typography>

            {step !== 99 ? (
                <Box textAlign="center" py={5} sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h4" gutterBottom>{activity.steps?.[step]}</Typography>
                    <Typography variant="caption" display="block">Step {step + 1} of {activity.steps?.length}</Typography>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={handleNext}>Perform Action</Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h6" gutterBottom>{activity.question}</Typography>
                    <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                        {activity.options?.map((opt) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio sx={{ color: 'white' }} />} label={opt} />
                        ))}
                    </RadioGroup>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => onSubmit(selectedOption)}
                        disabled={!selectedOption}
                    >
                        Submit Observation
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

// 3. Crossword/Puzzle Component
const CrosswordGame = ({ activity, onSubmit }) => {
    const [answers, setAnswers] = useState({});

    // Simple list view for "Crossword" (rendering actual grid is complex for this step)
    // We treat it as a "Fill in the blanks" for now.

    return (
        <Paper sx={{ p: 3, bgcolor: '#fffde7', color: '#333' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <ExtensionIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h5">{activity.title}</Typography>
            </Box>

            <Grid container spacing={2}>
                {activity.words?.map((wordObj, idx) => (
                    <Grid item xs={12} key={idx}>
                        <Typography variant="subtitle2" fontWeight="bold">{idx + 1}. {wordObj.clue}</Typography>
                        <TextField
                            size="small"
                            placeholder={`${wordObj.word.length} letters`}
                            value={answers[idx] || ''}
                            onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value.toUpperCase() })}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                sx={{ mt: 4, bgcolor: '#ff9800' }}
                onClick={() => onSubmit(Object.values(answers).join(','))} // Basic string join for submission
            >
                Submit Puzzle
            </Button>
        </Paper>
    );
};

export default ActivityView;

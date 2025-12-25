import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, TextField,
    Grid, Radio, RadioGroup, FormControlLabel,
    LinearProgress
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import ExtensionIcon from '@mui/icons-material/Extension';

const ActivityView = ({ activity, onComplete }) => {

    if (!activity) return <LinearProgress />;

    switch (activity.type) {
        case 'coding':
            return <CodingChallenge activity={activity} onComplete={onComplete} />;
        case 'lab':
            return <VirtualLab activity={activity} onComplete={onComplete} />;
        case 'crossword':
            return <CrosswordGame activity={activity} onComplete={onComplete} />;
        default:
            return <Typography color="error">Unknown activity type: {activity.type}</Typography>;
    }
};

// 1. Coding Challenge Component
const CodingChallenge = ({ activity, onComplete }) => {
    const [code, setCode] = useState(activity.starter_code || '');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState(null); // 'success', 'error'

    const handleRun = () => {
        // Mock execution
        setOutput("Running tests...\nTest Case 1: Passed\nTest Case 2: Passed\n\nAll tests passed!");
        setStatus('success');
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
                <Button variant="contained" color="success" onClick={handleRun}>Run Code</Button>
                {status === 'success' && (
                    <Button variant="contained" onClick={() => onComplete(activity.points)}>Submit & Claim {activity.points} XP</Button>
                )}
            </Box>

            {output && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: '#000', color: status === 'success' ? '#4caf50' : '#f44336', fontFamily: 'monospace' }}>
                    <pre>{output}</pre>
                </Paper>
            )}
        </Paper>
    );
};

// 2. Virtual Lab Component
const VirtualLab = ({ activity, onComplete }) => {
    const [step, setStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const handleNext = () => {
        if (step < (activity.steps?.length || 0) - 1) {
            setStep(step + 1);
        } else {
            // Show quiz
            setStep(99);
        }
    };

    const checkAnswer = () => {
        if (selectedOption === activity.correct_answer) {
            setIsComplete(true);
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

                    {!isComplete ? (
                        <Button variant="contained" onClick={checkAnswer} sx={{ mt: 2 }} disabled={!selectedOption}>Verify Conclusion</Button>
                    ) : (
                        <Box mt={2}>
                            <Typography color="success.main" fontWeight="bold">Correct! Analysis complete.</Typography>
                            <Button variant="contained" color="success" sx={{ mt: 1 }} onClick={() => onComplete(activity.points || 50)}>Finish Lab (+50 XP)</Button>
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
};

// 3. Crossword/Puzzle Component
const CrosswordGame = ({ activity, onComplete }) => {
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
                onClick={() => onComplete(activity.points || 30)}
            >
                Submit Puzzle
            </Button>
        </Paper>
    );
};

export default ActivityView;

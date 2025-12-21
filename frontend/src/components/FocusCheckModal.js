import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Typography,
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';

const FocusCheckModal = ({ open, duration, onResume }) => {
    const [countdown, setCountdown] = useState(3);
    const [canResume, setCanResume] = useState(false);

    useEffect(() => {
        if (open) {
            setCountdown(3);
            setCanResume(false);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanResume(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown={true}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    background: 'rgba(20, 20, 35, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 4,
                    textAlign: 'center',
                    p: 2
                }
            }}
        >
            <DialogContent>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Box mb={2} sx={{ color: '#ef4444' }}>
                        <VisibilityOffIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <Typography variant="h5" color="white" fontWeight="700" gutterBottom>
                        Focus Broken!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        You drifted away for <strong>{duration} seconds</strong>.
                    </Typography>

                    <Box mb={4} sx={{ position: 'relative', display: 'inline-flex' }}>
                        {!canResume ? (
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress variant="determinate" value={100} size={60} sx={{ color: 'rgba(255,255,255,0.1)' }} />
                                <Typography variant="h4" sx={{ position: 'absolute', color: 'white' }}>{countdown}</Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="#10b981">
                                Take a breath. Ready to re-engage?
                            </Typography>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<PlayArrowIcon />}
                        disabled={!canResume}
                        onClick={onResume}
                        sx={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                            color: 'white',
                        }}
                    >
                        Resume Learning
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default FocusCheckModal;

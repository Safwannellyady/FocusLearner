import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemText,
    Fab,
    CircularProgress,
    Avatar,
    Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Robot icon
import ChatIcon from '@mui/icons-material/Chat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../services/api';

const AIChatWidget = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && history.length === 0) {
            loadHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [history, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const response = await chatAPI.getHistory();
            setHistory(response.data.history || []);
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message;
        setMessage('');

        // Optimistic UI update
        setHistory(prev => [...prev, { role: 'user', parts: [userMsg] }]);
        setLoading(true);

        try {
            const response = await chatAPI.send(userMsg, context);
            // Replace history with backend version to ensure sync
            setHistory(response.data.history);
        } catch (error) {
            console.error("Error sending message:", error);
            // Fallback optimistic error
            setHistory(prev => [...prev, { role: 'model', parts: ["Error: Could not reach FocusBot."] }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        try {
            await chatAPI.clearHistory();
            setHistory([]);
        } catch (error) {
            console.error("Error clearing history", error);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1200 }}>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginBottom: 16 }}
                    >
                        <Paper sx={{
                            width: 380,
                            height: 500,
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(20, 20, 35, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                        }}>
                            {/* Header */}
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                        <SmartToyIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="700" color="white" lineHeight={1.2}>
                                            FocusBot
                                        </Typography>
                                        <Typography variant="caption" color="rgba(255,255,255,0.8)">
                                            AI Tutor
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <IconButton size="small" onClick={handleClear} sx={{ color: 'rgba(255,255,255,0.7)', mr: 1, '&:hover': { color: 'white' } }}>
                                        <DeleteSweepIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Messages Area */}
                            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {history.map((msg, index) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <Box key={index} sx={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                            <Paper sx={{
                                                p: 1.5,
                                                px: 2,
                                                borderRadius: 3,
                                                borderTopRightRadius: isUser ? 0 : 12,
                                                borderTopLeftRadius: isUser ? 12 : 0,
                                                background: isUser ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                                                color: 'white'
                                            }}>
                                                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                                                    {msg.parts[0]}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    );
                                })}
                                {/* Loading Indicator */}
                                {loading && (
                                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                        <Paper sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                                            <CircularProgress size={20} sx={{ color: '#aaa' }} />
                                        </Paper>
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </List>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                            {/* Input Area */}
                            <Box sx={{ p: 2, background: 'rgba(0,0,0,0.2)' }}>
                                <Box display="flex" gap={1}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Ask about the video..."
                                        variant="outlined"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                            }
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleSend}
                                        disabled={!message.trim() || loading}
                                        sx={{
                                            color: 'white',
                                            background: '#3b82f6',
                                            '&:hover': { background: '#2563eb' },
                                            '&.Mui-disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                                        }}>
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Fab
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)',
                        color: 'white',
                        width: 64,
                        height: 64,
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                        '&:hover': { background: 'linear-gradient(135deg, #7e22ce 0%, #2563eb 100%)' }
                    }}>
                    {isOpen ? <CloseIcon fontSize="large" /> : <ChatIcon fontSize="large" />}
                </Fab>
            </motion.div>
        </Box>
    );
};

export default AIChatWidget;

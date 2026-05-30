import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { lectureAPI } from '../services/api';

const CreateFocusSession = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const extractVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!title.trim() || !subject.trim() || !topic.trim()) {
            setError("Title, Subject, and Topic are required.");
            return;
        }

        let videoIds = [];
        if (youtubeUrl.trim()) {
            const extractedId = extractVideoId(youtubeUrl);
            if (!extractedId) {
                setError("Invalid YouTube URL. Please provide a valid link.");
                return;
            }
            videoIds.push(extractedId);
        }

        setLoading(true);
        try {
            const playload = {
                title,
                subject,
                topic,
                description,
                video_ids: videoIds
            };
            const response = await lectureAPI.create(playload);
            
            if (response.data && response.data.lecture) {
                 navigate(`/lecture/${response.data.lecture.id}`);
            } else {
                 setError("Error creating session.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred while creating the session.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Create a Native Focus Session
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Define your exact curriculum. Optionally link a direct YouTube video to bypass the AI video search.
                </Typography>
            </Box>
            
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', maxWidth: 800 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField 
                            label="Session Title" 
                            variant="outlined" 
                            fullWidth 
                            required 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Master React Hooks"
                        />
                        
                        <Box display="flex" gap={2}>
                            <TextField 
                                label="Subject Area" 
                                variant="outlined" 
                                fullWidth 
                                required 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="CS, Math, Science, Language, etc."
                            />
                            <TextField 
                                label="Specific Topic" 
                                variant="outlined" 
                                fullWidth 
                                required 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. useEffect Hooks"
                            />
                        </Box>

                        <TextField 
                            label="Brief Description (Optional)" 
                            variant="outlined" 
                            fullWidth 
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What do you hope to learn in this session?"
                        />

                        <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                             <Typography variant="subtitle2" color="#1e40af" mb={1} fontWeight="700">
                                Target Curriculum (Optional)
                             </Typography>
                             <Typography variant="body2" color="#3b82f6" mb={2}>
                                Provide a direct YouTube video link. If left blank, the system will automatically search for relevant educational lectures for your topic.
                             </Typography>
                             <TextField 
                                label="Custom YouTube Video URL" 
                                variant="outlined" 
                                fullWidth 
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                sx={{ bgcolor: 'white' }}
                            />
                        </Box>

                        <Box display="flex" justifyContent="flex-end" mt={1}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                disabled={loading}
                                sx={{ minWidth: 200, bgcolor: '#2563eb' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Deploy Session"}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateFocusSession;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Card, Button, Chip, IconButton, LinearProgress,
    Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { lectureAPI } from '../services/api';

const demoSessions = [
    {
        id: 1,
        title: "AI & Adaptive Learning Systems",
        subject: "Computer Science",
        progress: 45,
        status: "In Progress",
        starred: true
    },
    {
        id: 2,
        title: "Cognitive Neurobiology & Memory",
        subject: "Neuroscience",
        progress: 80,
        status: "Active Focus",
        starred: false
    },
    {
        id: 3,
        title: "Quantum Algorithms & Cryptography",
        subject: "Physics & CS",
        progress: 15,
        status: "In Progress",
        starred: false
    },
    {
        id: 4,
        title: "Organic Chemistry Molecular Dynamics",
        subject: "Chemistry",
        progress: 0,
        status: "Not Started",
        starred: true
    }
];

const MyCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [starredIds, setStarredIds] = useState([1, 4]);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const res = await lectureAPI.getAll();
            const loaded = res.data?.lectures || [];
            setCourses(loaded.length > 0 ? loaded : demoSessions);
        } catch (err) {
            console.error('Error loading sessions, fallback to demo:', err);
            setCourses(demoSessions);
        }
    };

    const handleMenuOpen = (e, course) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setSelectedCourse(course);
    };

    const handleMenuClose = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setAnchorEl(null);
        setSelectedCourse(null);
    };

    const handleAction = (e, actionType) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!selectedCourse) return;

        if (actionType === 'edit') {
            setNotification({ open: true, message: `Editing parameters for "${selectedCourse.title || selectedCourse.topic}"`, severity: 'info' });
        } else if (actionType === 'delete') {
            setCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
            setNotification({ open: true, message: `Session deleted successfully.`, severity: 'warning' });
        } else if (actionType === 'reset') {
            setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, progress: 0, status: 'Not Started' } : c));
            setNotification({ open: true, message: `Progress reset for "${selectedCourse.title || selectedCourse.topic}"`, severity: 'success' });
        }
        handleMenuClose(e);
    };

    const toggleStar = (e, id) => {
        e.stopPropagation();
        setStarredIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 5, mb: 8 }}>
            {/* Header */}
            <Box mb={5} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', mb: 0.8 }}>
                        My Focus Sessions
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '1.02rem' }}>
                        Track your progress and continue learning across your active study modules
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => navigate('/courses')}
                    sx={{
                        bgcolor: '#6366f1',
                        color: '#ffffff',
                        px: 3.5,
                        py: 1.4,
                        borderRadius: '12px',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#4f46e5' }
                    }}
                >
                    + Create Focus Session
                </Button>
            </Box>

            {/* Grid Container with Bounded Cards (max-width: 380px) */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 380px))',
                    gap: 3.5,
                    justifyContent: 'start'
                }}
            >
                {courses.map((course, idx) => {
                    const isStarred = starredIds.includes(course.id || idx);
                    const progressVal = course.progress ?? (idx % 3 === 0 ? 45 : idx % 3 === 1 ? 80 : 0);
                    const statusVal = course.status || (progressVal > 0 ? "In Progress" : "Not Started");

                    return (
                        <Card
                            key={course.id || idx}
                            onClick={() => navigate(course.id ? `/lecture/${course.id}` : '/lecture/1')}
                            sx={{
                                position: 'relative',
                                maxWidth: '380px',
                                width: '100%',
                                borderRadius: '12px',
                                background: '#111827',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 10px 25px -10px rgba(0, 0, 0, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease-in-out',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'scale(1.01)',
                                    background: '#1e293b',
                                    borderColor: 'rgba(99, 102, 241, 0.45)',
                                    boxShadow: '0 16px 32px -12px rgba(99, 102, 241, 0.3)'
                                }
                            }}
                        >
                            {/* Card Top Banner / Image Area */}
                            <Box sx={{
                                height: 140,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                p: 2
                            }}>
                                {/* Top Left Status Chip */}
                                <Chip
                                    label={statusVal}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 14,
                                        left: 14,
                                        bgcolor: statusVal === 'Active Focus' ? 'rgba(99, 102, 241, 0.25)' : statusVal === 'In Progress' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                        color: statusVal === 'Active Focus' ? '#a5b4fc' : statusVal === 'In Progress' ? '#6ee7b7' : '#cbd5e1',
                                        border: `1px solid ${statusVal === 'Active Focus' ? '#6366f1' : statusVal === 'In Progress' ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        borderRadius: '8px'
                                    }}
                                />

                                {/* Top Right Star Button (Isolated Click) */}
                                <IconButton
                                    size="small"
                                    onClick={(e) => toggleStar(e, course.id || idx)}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        color: isStarred ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)',
                                        '&:hover': { color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.15)' }
                                    }}
                                >
                                    {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>

                                {/* Center Icon */}
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '14px',
                                    bgcolor: 'rgba(15, 23, 42, 0.7)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                                }}>
                                    <MenuBookIcon sx={{ fontSize: 30, color: '#818cf8' }} />
                                </Box>
                            </Box>

                            {/* Card Body */}
                            <Box sx={{ p: 3, pb: 6, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        fontFamily: 'Outfit, sans-serif',
                                        color: '#ffffff',
                                        lineHeight: 1.35,
                                        mb: 0.8,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        height: '44px'
                                    }}
                                >
                                    {course.title || course.topic || "FocusLearner Study Module"}
                                </Typography>

                                <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 3 }}>
                                    {course.subject || "Academic Curriculum"}
                                </Typography>

                                {/* Progress Section */}
                                <Box sx={{ mt: 'auto', pt: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                            Study Completion
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            {progressVal}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressVal}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: progressVal > 70 ? '#10b981' : progressVal > 30 ? '#6366f1' : '#f59e0b',
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Bottom Left Action Shortcut */}
                                <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PlayArrowIcon sx={{ fontSize: 16 }} /> {progressVal > 0 ? 'Resume Session' : 'Start Session'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Three-Dots Menu Button placed absolutely at bottom: 12px; right: 12px; */}
                            <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, course)}
                                sx={{
                                    position: 'absolute',
                                    bottom: 12,
                                    right: 12,
                                    color: '#94a3b8',
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    '&:hover': {
                                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                                        color: '#ffffff',
                                        borderColor: 'rgba(99, 102, 241, 0.5)'
                                    }
                                }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Card>
                    );
                })}
            </Box>

            {/* Isolated Actions Dropdown Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        boxShadow: '0 15px 35px -10px rgba(0,0,0,0.6)',
                        minWidth: 180,
                        py: 0.5
                    }
                }}
            >
                <MenuItem onClick={(e) => handleAction(e, 'edit')} sx={{ py: 1.2, px: 2, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}>
                    <ListItemIcon sx={{ color: '#818cf8', minWidth: '32px !important' }}>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Edit Session" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={(e) => handleAction(e, 'reset')} sx={{ py: 1.2, px: 2, '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.15)' } }}>
                    <ListItemIcon sx={{ color: '#f59e0b', minWidth: '32px !important' }}>
                        <RestartAltIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Reset Progress" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={(e) => handleAction(e, 'delete')} sx={{ py: 1.2, px: 2, color: '#f87171', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}>
                    <ListItemIcon sx={{ color: '#f87171', minWidth: '32px !important' }}>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Delete Session" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </MenuItem>
            </Menu>

            {/* Notification Feedback */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{
                        bgcolor: '#1e293b',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        fontWeight: 600,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MyCourses;

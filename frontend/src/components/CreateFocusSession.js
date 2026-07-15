import React, { useState } from 'react';
import { 
    Box, Typography, Container, Paper, TextField, Button, CircularProgress, 
    Alert, Grid, Chip, InputAdornment, Card, CardActionArea, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import CalculateIcon from '@mui/icons-material/Calculate';
import BiotechIcon from '@mui/icons-material/Biotech';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { lectureAPI } from '../services/api';

// Curated Fields / Domains with icon & pre-mapped Subjects
const FIELDS_DATA = [
    {
        id: 'coding',
        name: 'Computer Science & Coding',
        icon: <CodeIcon sx={{ fontSize: 28, color: '#00f2fe' }} />,
        description: 'Algorithms, Web & Mobile Dev, System Architecture, Compilers',
        subjects: ['Python Programming', 'JavaScript & React Dev', 'C++ & Systems Architecture', 'Rust & Memory Safety', 'SQL & Database Design', 'Data Structures & Algorithms']
    },
    {
        id: 'cybersecurity',
        name: 'Cybersecurity & Network Defense',
        icon: <SecurityIcon sx={{ fontSize: 28, color: '#ff4b2b' }} />,
        description: 'Ethical Hacking, Linux CLI, Network Forensics, Cryptography',
        subjects: ['Penetration Testing & Kali Linux', 'Network Defense & Nmap/Wireshark', 'Web App Security (OWASP Top 10)', 'Applied Cryptography & SSL', 'Digital Forensics & Incident Response', 'Linux Kernel Exploitation']
    },
    {
        id: 'physics',
        name: 'Physics & Mechanical Simulation',
        icon: <ScienceIcon sx={{ fontSize: 28, color: '#a78bfa' }} />,
        description: 'Kinematics, Thermodynamics, Electromagnetism, Quantum Mechanics',
        subjects: ['Classical Mechanics & Kinematics', 'Electromagnetism & Circuit Boards', 'Quantum Computing Fundamentals', 'Thermodynamics & Statistical Physics', 'Astrophysics & Orbital Gravitation', 'Wave Mechanics & Optics']
    },
    {
        id: 'chemistry',
        name: 'Chemistry & Molecular Dynamics',
        icon: <BiotechIcon sx={{ fontSize: 28, color: '#34d399' }} />,
        description: 'Organic Reactions, Acid-Base Titration, Molarity & Bonds',
        subjects: ['Organic Chemistry Reactions', 'Acid-Base Titration & pH Dynamics', 'Inorganic & Coordination Chemistry', 'Biochemistry & Enzymes', 'Physical Chemistry & Enthalpy', 'Polymer Synthesis & Materials']
    },
    {
        id: 'mathematics',
        name: 'Mathematics & Data Science',
        icon: <CalculateIcon sx={{ fontSize: 28, color: '#38bdf8' }} />,
        description: 'Calculus, Linear Algebra, Machine Learning Math, Statistics',
        subjects: ['Linear Algebra & Matrices', 'Multivariable Calculus & Differential Eqs', 'Probability & Inferential Statistics', 'Deep Learning Neural Math', 'Discrete Mathematics & Graph Theory', 'Optimization & Game Theory']
    },
    {
        id: 'engineering',
        name: 'Engineering & Robotics',
        icon: <PrecisionManufacturingIcon sx={{ fontSize: 28, color: '#facc15' }} />,
        description: 'Mechatronics, Control Systems, Embedded C, Circuit Design',
        subjects: ['Mechatronics & Embedded Systems', 'Control Theory & PID Loops', 'Digital Logic & FPGA Design', 'Aerodynamics & Fluid Dynamics', 'Structural Mechanics & Finite Elements', 'Power Electronics & Inverters']
    },
    {
        id: 'biology',
        name: 'Biology & Genetics',
        icon: <BiotechIcon sx={{ fontSize: 28, color: '#f472b6' }} />,
        description: 'Cellular Biology, CRISPR Genetics, Neurobiology, Physiology',
        subjects: ['Molecular & Cellular Biology', 'Genetics & CRISPR Editing', 'Neurobiology & Synaptic Transmission', 'Human Anatomy & Physiology', 'Microbiology & Immunology', 'Evolutionary Genomics']
    },
    {
        id: 'humanities',
        name: 'General & Humanities',
        icon: <PublicIcon sx={{ fontSize: 28, color: '#fb923c' }} />,
        description: 'World History, Philosophy, Economics, Linguistics, Cognitive Psychology',
        subjects: ['Macro & Microeconomics', 'World History & Geopolitics', 'Cognitive Psychology & Memory', 'Philosophy of Mind & Logic', 'Linguistics & Natural Language', 'International Relations']
    }
];

// Curated Topics for specific subjects
const TOPICS_MAP = {
    'Python Programming': ['Asyncio & Concurrency', 'Object-Oriented Design Patterns', 'REST API with FastAPI/Django', 'Pandas & Data Manipulation'],
    'JavaScript & React Dev': ['React Hooks & State Management', 'Next.js SSR & Server Actions', 'TypeScript Advanced Generics', 'Performance Optimization & Memoization'],
    'Penetration Testing & Kali Linux': ['Privilege Escalation Techniques', 'Linux Terminal Navigation & Bash Scripting', 'Metasploit & Payload Execution', 'Active Directory Lateral Movement'],
    'Network Defense & Nmap/Wireshark': ['TCP/IP 3-Way Handshake & Packet Analysis', 'Nmap Stealth Port Scanning (`-sS -p-`)', 'Wireshark Filter Expressions for PCAP', 'Firewall Rule Configuration & IDS/IPS'],
    'Classical Mechanics & Kinematics': ['2D Projectile Motion & Trajectory Calculation', 'Newtonian Laws of Motion & Friction', 'Conservation of Momentum & Collisions', 'Rotational Inertia & Torque Dynamics'],
    'Electromagnetism & Circuit Boards': ['Ohm`s Law & Kirchhoff`s Circuit Rules', 'Capacitor RC Time Constants & Charging', 'Magnetic Fields & Faraday`s Induction', 'RLC AC Resonance & Impedance'],
    'Organic Chemistry Reactions': ['SN1 vs SN2 Nucleophilic Substitution', 'E1 vs E2 Elimination Mechanism', 'Aromatic Electrophilic Substitution', 'Stereochemistry & Optical Isomerism'],
    'Acid-Base Titration & pH Dynamics': ['Henderson-Hasselbalch Buffer Equation', 'Strong vs Weak Acid Titration Curves', 'Equivalence Point Calculation & Indicators', 'Chemical Equilibrium & Le Chatelier`s Principle'],
    'Linear Algebra & Matrices': ['Eigenvalues, Eigenvectors & Diagonalization', 'Singular Value Decomposition (SVD)', 'Gram-Schmidt Orthogonalization & QR', 'Vector Spaces & Linear Transformations']
};

const CreateFocusSession = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Multi-tier selection state
    const [fieldSearch, setFieldSearch] = useState('');
    const [selectedField, setSelectedField] = useState(FIELDS_DATA[0]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(FIELDS_DATA[0].subjects[0]);
    const [topicSearch, setTopicSearch] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(TOPICS_MAP['Python Programming']?.[0] || 'Core Module Architecture');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const extractVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Filter fields via search bar
    const filteredFields = FIELDS_DATA.filter(f => 
        f.name.toLowerCase().includes(fieldSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(fieldSearch.toLowerCase()) ||
        f.subjects.some(s => s.toLowerCase().includes(fieldSearch.toLowerCase()))
    );

    // Filter subjects inside chosen field
    const currentSubjects = selectedField ? selectedField.subjects : [];
    const filteredSubjects = currentSubjects.filter(s => 
        s.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    // Filter topics inside chosen subject
    const currentTopics = TOPICS_MAP[selectedSubject] || [
        `${selectedSubject} Fundamentals`,
        `Advanced ${selectedSubject} & Best Practices`,
        `Practical Simulation & Problem Solving in ${selectedSubject}`,
        `Real-World Case Studies & Debugging`
    ];
    const filteredTopics = currentTopics.filter(t => 
        t.toLowerCase().includes(topicSearch.toLowerCase())
    );

    const handleSelectField = (field) => {
        setSelectedField(field);
        const firstSubject = field.subjects[0];
        setSelectedSubject(firstSubject);
        const firstTopic = (TOPICS_MAP[firstSubject] || [`${firstSubject} Core Principles`])[0];
        setSelectedTopic(firstTopic);
        if (!title.trim() || title.includes('Master')) {
            setTitle(`Mastering ${firstSubject}: ${firstTopic}`);
        }
    };

    const handleSelectSubject = (subj) => {
        setSelectedSubject(subj);
        const firstTopic = (TOPICS_MAP[subj] || [`${subj} Core Principles`])[0];
        setSelectedTopic(firstTopic);
        setTitle(`Mastering ${subj}: ${firstTopic}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const finalSubject = selectedSubject || 'General Study';
        const finalTopic = selectedTopic || 'Core Module';
        const finalTitle = title.trim() || `${finalSubject}: ${finalTopic}`;

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
            const payload = {
                title: finalTitle,
                subject: finalSubject,
                topic: finalTopic,
                description: description || `Deep learning focus curriculum on ${finalSubject} (${finalTopic}) with AI Virtual Lab & synced vault.`,
                video_ids: videoIds
            };
            const response = await lectureAPI.create(payload);
            
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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Header */}
            <Box mb={4} className="epic-card" p={4} sx={{ borderRadius: '24px !important' }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <AutoAwesomeIcon sx={{ fontSize: 34, color: '#00f2fe' }} />
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>
                        Create Deep-Learned Focus Studio
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 880, lineHeight: 1.6 }}>
                    Select your exact domain field, study subject, and specialized topic. Our AI engine deep-learns your selection to instantly launch interactive virtual labs (Coding Compiler, Kali Linux Terminal, Physics Simulators, or Molecular Labs), gamified arenas, and synchronized study vault access.
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}
            
            <Grid container spacing={4}>
                {/* Left Column: Multi-Tier Field -> Subject -> Topic Selection */}
                <Grid item xs={12} lg={7}>
                    <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important', mb: 4 }}>
                        <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff" mb={2} display="flex" alignItems="center" gap={1}>
                            <span style={{ color: '#00f2fe' }}>1.</span> Select Study Domain / Field
                        </Typography>
                        
                        <TextField
                            placeholder="Filter domains (e.g., Coding, Cybersecurity, Physics, Chemistry, Math...)"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={fieldSearch}
                            onChange={(e) => setFieldSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#00f2fe' }} />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#ffffff', mb: 2.5 }
                            }}
                        />

                        <Grid container spacing={2}>
                            {filteredFields.map((field) => {
                                const isSelected = selectedField?.id === field.id;
                                return (
                                    <Grid item xs={12} sm={6} key={field.id}>
                                        <Card 
                                            onClick={() => handleSelectField(field)}
                                            sx={{
                                                bgcolor: isSelected ? 'rgba(0, 242, 254, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                                                border: isSelected ? '2px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '16px',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    borderColor: '#00f2fe',
                                                    bgcolor: 'rgba(0, 242, 254, 0.08)'
                                                }
                                            }}
                                        >
                                            <CardActionArea sx={{ p: 2.2 }}>
                                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                                    {field.icon}
                                                    <Typography variant="subtitle1" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff">
                                                        {field.name}
                                                    </Typography>
                                                    {isSelected && <CheckCircleIcon sx={{ ml: 'auto', color: '#00f2fe', fontSize: 20 }} />}
                                                </Box>
                                                <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', lineHeight: 1.4 }}>
                                                    {field.description}
                                                </Typography>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    {/* Step 2: Exact Subject Selection inside Field */}
                    {selectedField && (
                        <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important', mb: 4 }}>
                            <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff" mb={2} display="flex" alignItems="center" gap={1}>
                                <span style={{ color: '#00f2fe' }}>2.</span> Choose Exact Subject in {selectedField.name}
                            </Typography>

                            <TextField
                                placeholder={`Filter subjects or type custom subject...`}
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={subjectSearch}
                                onChange={(e) => {
                                    setSubjectSearch(e.target.value);
                                    if (e.target.value.trim()) setSelectedSubject(e.target.value);
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#34d399' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#ffffff', mb: 2.5 }
                                }}
                            />

                            <Box display="flex" flexWrap="wrap" gap={1.5}>
                                {filteredSubjects.map((subj) => {
                                    const isSubjSelected = selectedSubject === subj;
                                    return (
                                        <Chip
                                            key={subj}
                                            label={subj}
                                            onClick={() => handleSelectSubject(subj)}
                                            icon={isSubjSelected ? <CheckCircleIcon style={{ color: '#ffffff' }} /> : null}
                                            sx={{
                                                py: 2.2,
                                                px: 1.5,
                                                borderRadius: '14px',
                                                fontWeight: 700,
                                                fontFamily: 'Outfit, sans-serif',
                                                fontSize: '0.92rem',
                                                bgcolor: isSubjSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                                                color: '#ffffff',
                                                border: isSubjSelected ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.12)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: isSubjSelected ? '#1d4ed8' : 'rgba(255, 255, 255, 0.12)',
                                                    transform: 'scale(1.02)'
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Step 3: Specific Topic Filter */}
                    {selectedSubject && (
                        <Box className="epic-card" p={4} sx={{ borderRadius: '24px !important' }}>
                            <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff" mb={2} display="flex" alignItems="center" gap={1}>
                                <span style={{ color: '#00f2fe' }}>3.</span> Select or Filter Specific Topic
                            </Typography>

                            <TextField
                                placeholder={`Search topics inside ${selectedSubject}...`}
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={topicSearch}
                                onChange={(e) => {
                                    setTopicSearch(e.target.value);
                                    if (e.target.value.trim()) setSelectedTopic(e.target.value);
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#a78bfa' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#ffffff', mb: 2.5 }
                                }}
                            />

                            <Box display="flex" flexWrap="wrap" gap={1.5}>
                                {filteredTopics.map((topic) => {
                                    const isTopicSelected = selectedTopic === topic;
                                    return (
                                        <Chip
                                            key={topic}
                                            label={topic}
                                            onClick={() => {
                                                setSelectedTopic(topic);
                                                setTitle(`Mastering ${selectedSubject}: ${topic}`);
                                            }}
                                            sx={{
                                                py: 2.2,
                                                px: 1.5,
                                                borderRadius: '14px',
                                                fontWeight: 700,
                                                fontFamily: 'Outfit, sans-serif',
                                                fontSize: '0.9rem',
                                                bgcolor: isTopicSelected ? '#7c3aed' : 'rgba(255, 255, 255, 0.06)',
                                                color: '#ffffff',
                                                border: isTopicSelected ? '1px solid #c4b5fd' : '1px solid rgba(255, 255, 255, 0.12)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: isTopicSelected ? '#6d28d9' : 'rgba(255, 255, 255, 0.12)',
                                                    transform: 'scale(1.02)'
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </Grid>

                {/* Right Column: Deep-Learned Configuration & Launch */}
                <Grid item xs={12} lg={5}>
                    <Paper className="epic-card" sx={{ p: 4, borderRadius: '24px !important', position: 'sticky', top: 90 }}>
                        <Typography variant="h5" fontWeight="900" fontFamily="Outfit, sans-serif" color="#ffffff" mb={3} display="flex" alignItems="center" gap={1.2}>
                            <span className="pulse-dot-cyan" /> Studio Configuration & AI Lab Prep
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField 
                                    label="Session Studio Title" 
                                    variant="outlined" 
                                    fullWidth 
                                    required 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{
                                        sx: { bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#ffffff' }
                                    }}
                                    InputLabelProps={{ sx: { color: '#94a3b8' } }}
                                />

                                <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(0, 242, 254, 0.06)', border: '1px solid rgba(0, 242, 254, 0.25)' }}>
                                    <Typography variant="subtitle2" fontWeight="800" color="#00f2fe" mb={1.5} display="flex" alignItems="center" gap={1}>
                                        <ScienceIcon fontSize="small" /> AI Virtual Lab Configuration Preview
                                    </Typography>
                                    <Typography variant="body2" color="#e2e8f0" sx={{ mb: 1 }}>
                                        <strong>Domain:</strong> {selectedField?.name || 'General Study'}
                                    </Typography>
                                    <Typography variant="body2" color="#e2e8f0" sx={{ mb: 1 }}>
                                        <strong>Active Subject:</strong> {selectedSubject}
                                    </Typography>
                                    <Typography variant="body2" color="#00f2fe" fontWeight="700">
                                        <strong>Deep-Learned Topic:</strong> {selectedTopic}
                                    </Typography>
                                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                                    <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', lineHeight: 1.5 }}>
                                        ⚡ Launching this studio will prepare: <br />
                                        • Interactive Virtual Lab sandbox ({selectedField?.id === 'coding' ? 'Multi-language Compiler' : selectedField?.id === 'cybersecurity' ? 'Kali Linux CLI Simulator' : selectedField?.id === 'physics' ? 'Real-time Physics Canvas' : selectedField?.id === 'chemistry' ? 'pH Titration & Bond Simulator' : 'OS Simulator'}).<br />
                                        • Deep-learned AI Mentor Chat & Neural Quiz generator.<br />
                                        • Synced Workspace Vault with Wikipedia query processing.
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                     <Typography variant="subtitle2" color="#ffffff" mb={1} fontWeight="700" display="flex" alignItems="center" gap={1}>
                                        <YouTubeIcon sx={{ color: '#ff0000' }} /> Target Video URL (Optional)
                                     </Typography>
                                     <Typography variant="caption" color="#94a3b8" display="block" mb={2}>
                                        Provide a direct YouTube lecture URL. If blank, our deep learning engine auto-fetches top academic lectures for {selectedSubject}.
                                     </Typography>
                                     <TextField 
                                        placeholder="https://www.youtube.com/watch?v=..." 
                                        variant="outlined" 
                                        fullWidth 
                                        size="small"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        InputProps={{
                                            sx: { bgcolor: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', color: '#ffffff' }
                                        }}
                                    />
                                </Box>

                                <TextField 
                                    label="Custom Study Notes / Description (Optional)" 
                                    variant="outlined" 
                                    fullWidth 
                                    multiline
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={`Specific goals or lab challenges you want to accomplish in ${selectedSubject}...`}
                                    InputProps={{
                                        sx: { bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#ffffff' }
                                    }}
                                    InputLabelProps={{ sx: { color: '#94a3b8' } }}
                                />

                                <Button 
                                    type="submit" 
                                    className="epic-btn-primary" 
                                    size="large"
                                    disabled={loading}
                                    fullWidth
                                    sx={{ py: '18px !important', fontSize: '1.1rem !important', mt: 1 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        '⚡ Launch AI Focus Studio & Virtual Lab →'
                                    )}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CreateFocusSession;

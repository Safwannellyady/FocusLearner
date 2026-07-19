import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Button, Divider, Alert } from '@mui/material';
import { School, CheckCircle, RadioButtonUnchecked, Warning, Lock, ArrowForward, Refresh } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const KnowledgeGraph = ({ subject = 'Math/Linear Algebra', onSelectTopic }) => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [error, setError] = useState(null);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/taxonomy/graph`, {
        params: { subject },
        headers: { Authorization: `Bearer ${token}` }
      });
      setGraphData(res.data);
      if (res.data && res.data.nodes && res.data.nodes.length > 0) {
        setSelectedNode(res.data.nodes[0]);
      }
    } catch (err) {
      console.error('Error fetching knowledge graph:', err);
      setError('Could not load knowledge graph data. Showing local concept tree.');
      // Local fallback if offline
      setGraphData({
        subject,
        nodes: [
          { id: 101, label: 'Vector Spaces & Subspaces', status: 'Mastered', description: 'Foundational axioms and closed under linear combinations.', level: 1 },
          { id: 102, label: 'Linear Independence & Basis', status: 'Mastered', description: 'Spanning sets and minimal generators for vector spaces.', level: 2 },
          { id: 103, label: 'Matrix Transformations', status: 'In Progress', description: 'Linear mappings between spaces using matrix multiplication.', level: 3 },
          { id: 104, label: 'Eigenvalues & Eigenvectors', status: 'Weak Spot', description: 'Characteristic polynomial det(A - lambda*I) = 0 and diagonal form.', level: 4 },
          { id: 105, label: 'Singular Value Decomposition', status: 'Locked', description: 'Advanced factorization A = U * Sigma * V^T for data compression.', level: 5 }
        ],
        links: [
          { source: 101, target: 102 },
          { source: 102, target: 103 },
          { source: 103, target: 104 },
          { source: 104, target: 105 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [subject]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mastered': return '#10b981'; // Emerald
      case 'In Progress': return '#6366f1'; // Indigo
      case 'Weak Spot': return '#f59e0b'; // Amber
      case 'Locked': default: return '#64748b'; // Slate gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Mastered': return <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />;
      case 'In Progress': return <RadioButtonUnchecked sx={{ color: '#6366f1', fontSize: 18 }} />;
      case 'Weak Spot': return <Warning sx={{ color: '#f59e0b', fontSize: 18 }} />;
      case 'Locked': default: return <Lock sx={{ color: '#64748b', fontSize: 18 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={36} sx={{ color: '#6366f1', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Generating Adaptive Concept Map...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <School sx={{ color: '#6366f1' }} /> Visual Knowledge Graph ({graphData?.subject || subject})
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Prerequisite concept tree with real-time retention state tracking
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<Refresh />} 
          onClick={fetchGraph}
          sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', textTransform: 'none' }}
        >
          Refresh Tree
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2, background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d' }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' }, gap: 3 }}>
        {/* SVG Concept Map Visualization Area */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            minHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, my: 'auto', px: 2 }}>
            {graphData?.nodes?.map((node, index) => {
              const isSelected = selectedNode && selectedNode.id === node.id;
              const statusColor = getStatusColor(node.status);
              
              return (
                <Box key={node.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 32, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                    L{node.level || index + 1}
                  </Box>
                  
                  <Box
                    onClick={() => setSelectedNode(node)}
                    sx={{
                      flex: 1,
                      p: 2,
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)' 
                        : 'rgba(30, 41, 59, 0.7)',
                      border: `1.5px solid ${isSelected ? statusColor : 'rgba(255, 255, 255, 0.07)'}`,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? `0 0 16px ${statusColor}33` : 'none',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        borderColor: statusColor
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {getStatusIcon(node.status)}
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                          {node.label}
                        </Typography>
                        {node.description && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            {node.description.substring(0, 65)}...
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Chip 
                      label={node.status} 
                      size="small" 
                      sx={{ 
                        background: `${statusColor}22`, 
                        color: statusColor, 
                        fontWeight: 600, 
                        fontSize: '0.72rem',
                        border: `1px solid ${statusColor}44`
                      }} 
                    />
                  </Box>

                  {index < (graphData?.nodes?.length - 1) && (
                    <ArrowForward sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 18, transform: 'rotate(90deg)' }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Selected Node Details Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedNode ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {getStatusIcon(selectedNode.status)}
                <Chip 
                  label={`Level ${selectedNode.level || 1}: ${selectedNode.status}`} 
                  size="small"
                  sx={{ 
                    background: `${getStatusColor(selectedNode.status)}22`, 
                    color: getStatusColor(selectedNode.status), 
                    fontWeight: 700 
                  }} 
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1 }}>
                {selectedNode.label}
              </Typography>

              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3, lineHeight: 1.6 }}>
                {selectedNode.description || 'Core foundational concept within the subject syllabus. Master prerequisite nodes to unlock advanced problem sets.'}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />

              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 600 }}>
                Recommended Action & Remediation:
              </Typography>

              {selectedNode.status === 'Weak Spot' && (
                <Alert severity="warning" sx={{ mb: 2, background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  You missed recent quiz questions on this topic. Spaced repetition flashcards have been scheduled.
                </Alert>
              )}

              {selectedNode.status === 'Mastered' && (
                <Alert severity="success" sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  High retention verified. You can safely proceed to downstream prerequisite topics.
                </Alert>
              )}

              <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onSelectTopic && onSelectTopic(selectedNode.label)}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.2,
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Launch Practice Arena & Drills
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => onSelectTopic && onSelectTopic(`${selectedNode.label} flashcard review`)}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Review SRS Flashcards
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', my: 'auto', color: '#64748b' }}>
              <School sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography>Select a node from the concept map to inspect prerequisite details.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default KnowledgeGraph;

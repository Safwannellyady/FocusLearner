import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent, CardActions,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, LinearProgress, Alert, Tabs, Tab, Paper, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LanguageIcon from '@mui/icons-material/Language';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import FolderIcon from '@mui/icons-material/Folder';
import { materialAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, ''); // Remove trailing /api

const FocusVault = ({ subjectFocus }) => {
  const [activeTab, setActiveTab] = useState(0); // 0: Vault, 1: Wikipedia, 2: Google
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Results
  const [materials, setMaterials] = useState([]);
  const [wikiResults, setWikiResults] = useState([]);
  const [webResults, setWebResults] = useState([]);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'document', 'image', 'link'
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [feedMsg, setFeedMsg] = useState('');

  useEffect(() => {
    if (activeTab === 0) {
      fetchMaterials(searchQuery);
    }
  }, [subjectFocus, activeTab]);

  const showFeedback = (msg) => {
    setFeedMsg(msg);
    setTimeout(() => setFeedMsg(''), 3000);
  };

  const fetchMaterials = async (query = '') => {
    setLoading(true);
    try {
      const res = await materialAPI.getMaterials(subjectFocus, query);
      setMaterials(res.data.materials);
    } catch (err) {
      console.error("Error fetching materials", err);
    } finally {
      setLoading(false);
    }
  };

  // Extracts main subject/keywords from conversational queries for Wikipedia MediaWiki API handler
  const cleanWikipediaQuery = (raw) => {
    if (!raw) return '';
    let q = raw.trim();
    // Remove conversational question starters and stop verbs
    const conversationalPatterns = [
      /^(who|what|where|when|why|how)\s+(is|are|was|were|did|does|do|can|could|would|should|invented|discovered|created|wrote|made|built|defined|explain|about|to)\s+/i,
      /^(tell me about|explain|describe|give me info on|what is the meaning of|how does|who is|who was|what are)\s+/i,
      /\b(invented by|invented|discovered by|discovered|created by|created|works|work|used for|meaning of|definition of)\b/gi,
      /[?!.,;:]/g
    ];
    for (const pattern of conversationalPatterns) {
      q = q.replace(pattern, ' ');
    }
    // Clean up extra whitespace and common filler words
    q = q.replace(/\b(the|a|an|of|in|on|at|by|for|with|about)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    return q || raw.trim();
  };

  const fetchWikipedia = async (query) => {
    if (!query) {
      setWikiResults([]);
      return;
    }
    setLoading(true);
    try {
      const processedQuery = cleanWikipediaQuery(query);
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(processedQuery)}&utf8=&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      setWikiResults(data.query?.search || []);
    } catch (err) {
      console.error("Wikipedia search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogle = async (query) => {
    if (!query) {
      setWebResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await materialAPI.searchWeb(query);
      if (res.data.error) {
        setError(res.data.error);
        setWebResults([]);
      } else {
        setWebResults(res.data.results || []);
      }
    } catch (err) {
      console.error("Web search failed", err);
      setError('Failed to fetch web results.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setError('');
      if (activeTab === 0) fetchMaterials(searchQuery);
      if (activeTab === 1) fetchWikipedia(searchQuery);
      if (activeTab === 2) fetchGoogle(searchQuery);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  // Upload Logic
  const handleOpenModal = (type) => {
    setModalType(type);
    setTitle('');
    setUrl('');
    setFile(null);
    setError('');
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('material_type', modalType);
      if (subjectFocus) formData.append('subject_focus', subjectFocus);

      if (modalType === 'link') {
        if (!url) throw new Error("URL is required");
        formData.append('url', url);
      } else {
        if (!file) throw new Error("File is required");
        formData.append('file', file);
      }

      await materialAPI.addMaterial(formData);
      setOpenModal(false);
      showFeedback(`Successfully added ${title} to your Vault!`);
      if (activeTab === 0) fetchMaterials(searchQuery);
    } catch (err) {
      setError(err.message || 'Error uploading material');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickSaveLink = async (saveTitle, saveUrl) => {
    try {
      const formData = new FormData();
      formData.append('title', saveTitle);
      formData.append('material_type', 'link');
      if (subjectFocus) formData.append('subject_focus', subjectFocus);
      formData.append('url', saveUrl);
      
      await materialAPI.addMaterial(formData);
      showFeedback(`Saved to your Vault!`);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await materialAPI.deleteMaterial(id);
      fetchMaterials(searchQuery);
    } catch (err) {
      console.error("Error deleting material", err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'document': return <DescriptionIcon color="primary" fontSize="large" />;
      case 'image': return <ImageIcon color="secondary" fontSize="large" />;
      case 'link': return <LinkIcon color="success" fontSize="large" />;
      default: return <InsertDriveFileIcon fontSize="large" />;
    }
  };

  const handleView = (material) => {
    if (material.material_type === 'link') {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`${BACKEND_URL}${material.file_path}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {feedMsg && (
        <Alert severity="success" sx={{ mb: 2, position: 'fixed', top: 20, right: 20, zIndex: 9999, boxShadow: 3 }}>
          {feedMsg}
        </Alert>
      )}

      {/* Search Dock */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search Vault, Wikipedia, or entire Web... (Press Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          sx={{
            maxWidth: '800px',
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#e2e8f0' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab icon={<FolderIcon />} iconPosition="start" label="My Vault" />
          <Tab icon={<FormatQuoteIcon />} iconPosition="start" label="Wikipedia" />
          <Tab icon={<LanguageIcon />} iconPosition="start" label="Web & Academic Search" />
        </Tabs>
      </Box>

      {/* Action Buttons (Only in Vault) */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={() => handleOpenModal('document')} sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 600 }}>Add Document</Button>
          <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => handleOpenModal('image')} sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 600 }}>Add Image</Button>
          <Button variant="outlined" startIcon={<LinkIcon />} onClick={() => handleOpenModal('link')} sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 600 }}>Add Link</Button>
        </Box>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Results Rendering */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
        {/* VAULT TAB (List Type with Click to Open & Long Press / Context Menu to Delete) */}
        {activeTab === 0 && (
          <Box>
            {!loading && materials.length === 0 ? (
              <Box textAlign="center" py={5} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
                <Typography color="#94a3b8" fontWeight="600">Your workspace vault is empty.</Typography>
                <Typography variant="caption" color="#64748b" display="block" mt={0.5}>Add personal documents, PDFs, or code references above, or bookmark directly from Wikipedia.</Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={1.8}>
                {materials.map(mat => {
                  let touchTimer = null;
                  const handleTouchStart = () => {
                    touchTimer = setTimeout(() => {
                      if (window.confirm(`Delete "${mat.title}" from your vault?`)) {
                        handleDelete(mat.id);
                      }
                    }, 650);
                  };
                  const handleTouchEnd = () => {
                    if (touchTimer) clearTimeout(touchTimer);
                  };

                  return (
                    <Paper
                      key={mat.id}
                      onClick={() => handleView(mat)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (window.confirm(`Long-Press Action: Delete "${mat.title}"?`)) {
                          handleDelete(mat.id);
                        }
                      }}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '16px',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: 'rgba(0, 242, 254, 0.08)',
                          borderColor: '#00f2fe',
                          transform: 'translateX(6px)'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} sx={{ overflow: 'hidden' }}>
                        <Box sx={{ p: 1.6, borderRadius: '12px', bgcolor: mat.material_type === 'document' ? 'rgba(56, 189, 248, 0.15)' : mat.material_type === 'image' ? 'rgba(244, 114, 182, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: mat.material_type === 'document' ? '#38bdf8' : mat.material_type === 'image' ? '#f472b6' : '#34d399' }}>
                          {getIconForType(mat.material_type)}
                        </Box>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="subtitle1" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff" noWrap title={mat.title}>
                            {mat.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1.5} mt={0.3}>
                            <Chip label={mat.material_type.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }} />
                            <Typography variant="caption" color="#94a3b8">
                              Added {new Date(mat.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="#00f2fe" fontWeight="700">
                              (Click to Open • Long-Press to Delete)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          startIcon={<OpenInNewIcon />}
                          onClick={() => handleView(mat)}
                          sx={{ color: '#00f2fe', fontWeight: 700, borderRadius: '10px', px: 2, '&:hover': { bgcolor: 'rgba(0, 242, 254, 0.15)' } }}
                        >
                          Open
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm(`Delete "${mat.title}"?`)) {
                              handleDelete(mat.id);
                            }
                          }}
                          sx={{ color: '#ff4b2b', bgcolor: 'rgba(255, 75, 43, 0.1)', '&:hover': { bgcolor: 'rgba(255, 75, 43, 0.25)' } }}
                          title="Delete material"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* WIKIPEDIA TAB */}
        {activeTab === 1 && (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {!loading && wikiResults.length === 0 && searchQuery && !error ? (
              <Typography color="text.secondary" textAlign="center">No Wikipedia articles found.</Typography>
            ) : (
              wikiResults.map((item) => {
                const wikiUrl = `https://en.wikipedia.org/?curid=${item.pageid}`;
                return (
                  <Card key={item.pageid} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" fontWeight={700} color="#0f172a">{item.title}</Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<BookmarkAddIcon />} 
                          onClick={() => handleQuickSaveLink(`Wiki: ${item.title}`, wikiUrl)}
                          sx={{ textTransform: 'none', borderRadius: 8 }}
                        >
                          Save
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }} dangerouslySetInnerHTML={{ __html: item.snippet + '...' }} />
                      <Button size="small" href={wikiUrl} target="_blank" endIcon={<OpenInNewIcon />}>Read Full Article</Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        )}

        {/* WEB & ACADEMIC SEARCH TAB */}
        {activeTab === 2 && (
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {!loading && webResults.length === 0 && searchQuery && !error ? (
              <Typography color="text.secondary" textAlign="center">No web results found.</Typography>
            ) : (
              webResults.map((item, idx) => (
                <Card key={idx} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          {item.source && (
                            <Typography variant="caption" sx={{ px: 1.5, py: 0.3, borderRadius: 4, bgcolor: item.source.includes('Academic') ? '#eff6ff' : item.source === 'Wikipedia' ? '#f1f5f9' : '#f0fdf4', color: item.source.includes('Academic') ? '#1e40af' : item.source === 'Wikipedia' ? '#475569' : '#166534', fontWeight: 700 }}>
                              {item.source}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="#1a0dab" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.open(item.link, '_blank')}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<BookmarkAddIcon />} 
                        onClick={() => handleQuickSaveLink(item.title, item.link)}
                        sx={{ textTransform: 'none', borderRadius: 8, flexShrink: 0 }}
                      >
                        Save
                      </Button>
                    </Box>
                    <Typography variant="caption" color="success.main" display="block" mb={1}>{item.link}</Typography>
                    <Typography variant="body2" color="#4d5156">{item.snippet}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Add Material Modal */}
      <Dialog open={openModal} onClose={() => !uploading && setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add {modalType === 'link' ? 'Link' : modalType === 'image' ? 'Image' : 'Document'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Title" variant="outlined" margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
          {modalType === 'link' ? (
            <TextField fullWidth label="URL" variant="outlined" margin="normal" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          ) : (
            <Box sx={{ mt: 2, p: 3, border: '1px dashed #cbd5e1', borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
              <input accept={modalType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'} style={{ display: 'none' }} id="raised-button-file" type="file" onChange={(e) => setFile(e.target.files[0])} />
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" startIcon={<InsertDriveFileIcon />}>Choose File</Button>
              </label>
              {file && <Typography variant="body2" sx={{ mt: 1, color: '#0f172a', fontWeight: 500 }}>Selected: {file.name}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenModal(false)} disabled={uploading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading} startIcon={uploading ? <LinearProgress size={20} /> : <AddIcon />} sx={{ bgcolor: '#2563eb' }}>
            {uploading ? 'Adding...' : 'Add to Vault'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FocusVault;

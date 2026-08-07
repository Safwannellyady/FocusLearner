import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Chip, LinearProgress, CircularProgress, IconButton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { lectureAPI, focusAPI } from "../services/api";

// Icons
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import PlayArrowRoundedIcon     from "@mui/icons-material/PlayArrowRounded";
import BoltRoundedIcon          from "@mui/icons-material/BoltRounded";
import AccessTimeRoundedIcon    from "@mui/icons-material/AccessTimeRounded";
import EmojiEventsRoundedIcon   from "@mui/icons-material/EmojiEventsRounded";
import AutoAwesomeRoundedIcon   from "@mui/icons-material/AutoAwesomeRounded";
import MoreVertRoundedIcon     from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon         from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";


/* ── Fallback demo data ────────────────────────────────────────────────────── */
const DEMO = [
  { id: 1, title: "AI & Adaptive Learning Systems",     subject: "Computer Science", topic: "Machine Learning",   duration: 45, xp: 120, progress: 45, status: "in_progress", date: "2026-08-03" },
  { id: 2, title: "Cognitive Neurobiology & Memory",    subject: "Neurosciences",    topic: "Neuroplasticity",     duration: 60, xp: 180, progress: 80, status: "active",      date: "2026-08-04" },
  { id: 3, title: "Quantum Algorithms & Cryptography",  subject: "Physics",          topic: "Quantum Mechanics",   duration: 30, xp: 75,  progress: 15, status: "in_progress", date: "2026-08-02" },
  { id: 4, title: "Organic Reaction Mechanisms",        subject: "Chemistry",        topic: "Organic Chemistry",   duration: 90, xp: 240, progress: 0,  status: "not_started", date: "2026-08-01" },
  { id: 5, title: "DeFi Protocols & Smart Contracts",   subject: "Financial Tech",   topic: "Smart Contracts",     duration: 25, xp: 60,  progress: 100,status: "completed",   date: "2026-07-30" },
  { id: 6, title: "Reinforcement Learning Deep Dive",   subject: "Data Science & AI",topic: "Deep Learning",       duration: 50, xp: 140, progress: 62, status: "in_progress", date: "2026-08-03" },
];

const SUBJECT_COLORS = {
  "Computer Science": "#6366f1", "Neurosciences": "#a78bfa", "Physics": "#3b82f6",
  "Chemistry": "#10b981", "Financial Tech": "#f59e0b", "Data Science & AI": "#ec4899",
  "Biology": "#34d399", "Mathematics": "#fbbf24", "Management": "#fb923c",
};
const subjectColor = (s) => SUBJECT_COLORS[s] || "#6366f1";

const STATUS_META = {
  active:       { label: "Active Focus", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  in_progress:  { label: "In Progress",  color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  completed:    { label: "Completed",    color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
  not_started:  { label: "Not Started",  color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const SUBJECTS_FILTER = ["All", ...Object.keys(SUBJECT_COLORS), "Neurosciences", "Financial Tech", "Data Science & AI"];
const SORT_OPTIONS    = ["Recent", "Longest", "Most XP", "Progress"];

/* ── Session card ──────────────────────────────────────────────────────────── */
const SessionCard = ({ session, index, onResume, onModify, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTopic, setEditTopic] = useState(session.topic || session.title || "");
  const [editSubject, setEditSubject] = useState(session.subject || "");
  const [editDuration, setEditDuration] = useState(session.duration || 30);
  const [isDeleting, setIsDeleting] = useState(false);

  const color  = subjectColor(session.subject);
  const status = STATUS_META[session.status] || STATUS_META.in_progress;
  const xp     = session.xp || Math.round((session.duration || 30) * 2.5);

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    try {
      if (session.db_id) {
        await focusAPI.updateSession(session.db_id, {
          topic: editTopic,
          subject_focus: editSubject,
          duration_minutes: editDuration
        });
      }
      onModify && onModify(session.id, { topic: editTopic, subject: editSubject, duration: editDuration, title: editTopic });
    } catch (err) {
      console.error("Modify error:", err);
    } finally {
      setEditOpen(false);
      setAnchorEl(null);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      if (session.db_id) {
        await focusAPI.deleteSession(session.db_id);
      }
      onDelete && onDelete(session.id);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setAnchorEl(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.065, duration: 0.38, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{ cursor: "pointer" }}
    >
      <Box
        sx={{
          position: "relative", overflow: "hidden",
          bgcolor: "var(--bg-card)", border: `1px solid ${hovered ? `${color}44` : "var(--border)"}`,
          borderRadius: "var(--r-lg)",
          boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}22` : "0 2px 12px rgba(0,0,0,0.2)",
          transition: "all 0.25s ease",
        }}
      >
        {/* Shimmer sweep on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%)",
                pointerEvents: "none", zIndex: 1,
              }}
            />
          )}
        </AnimatePresence>

        {/* Coloured left border */}
        <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, bgcolor: color, borderRadius: "4px 0 0 4px", opacity: hovered ? 1 : 0.4, transition: "opacity 0.25s" }} />

        <Box sx={{ p: 2, pl: 2.5 }}>
          {/* Row 1: subject + status + date + 3-dots options */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color, letterSpacing: "0.04em" }}>
                {session.subject}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ px: 0.9, py: 0.2, borderRadius: "100px", bgcolor: status.bg, border: `1px solid ${status.color}33` }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: status.color }}>{status.label}</Typography>
              </Box>

              {/* 3-Dots Options Menu Trigger */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(e.currentTarget);
                }}
                sx={{
                  color: "var(--text-dim)", p: 0.4,
                  "&:hover": { color: "#f1f5f9", bgcolor: "rgba(255,255,255,0.08)" }
                }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={(e) => { e && e.stopPropagation(); setAnchorEl(null); }}
            PaperProps={{
              sx: { bgcolor: "#0f172a", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }
            }}
          >
            <MenuItem
              onClick={(e) => { e.stopPropagation(); setEditOpen(true); setAnchorEl(null); }}
              sx={{ gap: 1.25, py: 0.8, px: 2, fontSize: "0.8rem", color: "#f1f5f9" }}
            >
              <EditRoundedIcon sx={{ fontSize: 16, color: "var(--indigo-lt)" }} />
              Modify Session
            </MenuItem>
            <MenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              sx={{ gap: 1.25, py: 0.8, px: 2, fontSize: "0.8rem", color: "var(--rose)" }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 16, color: "var(--rose)" }} />
              {isDeleting ? "Deleting..." : "Delete Session"}
            </MenuItem>
          </Menu>

          {/* Edit / Modify Session Dialog */}
          <Dialog
            open={editOpen}
            onClose={(e) => { e && e.stopPropagation(); setEditOpen(false); }}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
              sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 1, minWidth: 320 }
            }}
          >
            <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", pb: 1 }}>
              Modify Focus Session
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField
                label="Topic / Title"
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                size="small" fullWidth
              />
              <TextField
                label="Subject Focus"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                size="small" fullWidth
              />
              <TextField
                label="Duration (Minutes)"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                size="small" fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button size="small" onClick={() => setEditOpen(false)} sx={{ color: "var(--text-mid)" }}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveEdit}
                sx={{ background: "var(--grad-primary)", fontWeight: 700 }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>



          {/* Row 2: title */}
          <Typography sx={{
            fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem",
            color: "#f1f5f9", lineHeight: 1.25, mb: 0.6,
            transition: "color 0.2s",
          }}>
            {session.title}
          </Typography>

          {/* Row 3: topic chip */}
          {session.topic && (
            <Chip
              label={session.topic} size="small"
              sx={{
                mb: 1.25, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600,
                fontSize: "0.68rem", height: 20,
                bgcolor: `${color}18`, color, border: `1px solid ${color}33`,
              }}
            />
          )}

          {/* Row 4: stats */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "var(--text-dim)" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>
                {session.duration || 30} min
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <BoltRoundedIcon sx={{ fontSize: 13, color: "#fbbf24" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 700 }}>
                +{xp} XP
              </Typography>
            </Box>
          </Box>

          {/* Row 5: progress bar */}
          <Box sx={{ mb: 1.75 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
              <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)", fontWeight: 600 }}>Progress</Typography>
              <Typography sx={{ fontSize: "0.68rem", color, fontWeight: 700 }}>{session.progress || 0}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={session.progress || 0}
              sx={{
                height: 4, borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.06)",
                "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
              }}
            />
          </Box>

          {/* Row 6: Resume button */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Box
              onClick={() => onResume(session)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 0.9, borderRadius: "var(--r-md)", cursor: "pointer",
                bgcolor: hovered ? color : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered ? color : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.25s",
                position: "relative", overflow: "hidden",
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: 16, color: hovered ? "#fff" : "var(--text-mid)" }} />
              <Typography sx={{
                fontSize: "0.82rem", fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                color: hovered ? "#fff" : "var(--text-mid)",
              }}>
                {session.status === "completed" ? "Review" : "Resume"} →
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

/* ── Empty state ───────────────────────────────────────────────────────────── */
const EmptyState = ({ onNew }) => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <AutoAwesomeRoundedIcon sx={{ fontSize: 52, color: "rgba(99,102,241,0.25)", mb: 2 }} />
    </motion.div>
    <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#f1f5f9", mb: 0.75 }}>
      No sessions yet
    </Typography>
    <Typography sx={{ color: "var(--text-dim)", fontSize: "0.87rem", mb: 3 }}>
      Start your first focus session and build your streak.
    </Typography>
    <Box
      onClick={onNew}
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75, px: 2.5, py: 1.1,
        borderRadius: "var(--r-md)", background: "var(--grad-primary)", cursor: "pointer",
        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
        "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
        transition: "all 0.2s",
      }}
    >
      <BoltRoundedIcon sx={{ fontSize: 17, color: "#fff" }} />
      <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        Start First Session
      </Typography>
    </Box>
  </Box>
);

/* ══ MyCourses ════════════════════════════════════════════════════════════════ */
const MyCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") === "completed" ? "completed" : "active";

  const [activeTab,   setActiveTab]   = useState(initialTab);
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterSubj,  setFilterSubj]  = useState("All");
  const [sortBy,      setSortBy]      = useState("Recent");
  const [filterOpen,  setFilterOpen]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [focusRes, lecRes] = await Promise.allSettled([
          focusAPI.getSessions(),
          lectureAPI.getAll ? lectureAPI.getAll() : lectureAPI.getLectures(),
        ]);

        let combined = [];

        if (focusRes.status === "fulfilled") {
          const rawFocus = focusRes.value?.data?.sessions || [];
          rawFocus.forEach((fs) => {
            combined.push({
              id: `focus-${fs.id}`,
              db_id: fs.id,
              title: fs.topic || fs.subject_focus || "Focus Session",
              subject: fs.subject_focus || "General Study",
              topic: fs.topic || fs.subject_focus,
              selected_lab: fs.selected_lab,
              duration: fs.duration_minutes || 30,
              xp: Math.round((fs.elapsed_seconds || 0) / 60 * 5),
              progress: fs.status === "completed" ? 100 : Math.min(100, Math.round(((fs.elapsed_seconds || 0) / ((fs.duration_minutes || 30) * 60)) * 100)),
              status: fs.status || (fs.is_locked ? "active" : "in_progress"),
              date: fs.started_at ? new Date(fs.started_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              youtube_id: fs.current_video_id,
            });
          });
        }

        if (lecRes.status === "fulfilled") {
          const rawLec = lecRes.value?.data?.lectures || lecRes.value?.data || [];
          if (Array.isArray(rawLec)) {
            rawLec.forEach((l) => {
              combined.push({
                ...l,
                id: `lec-${l.id}`,
                db_id: l.id,
                subject: l.subject || "General Study",
                duration: l.duration || 30,
              });
            });
          }
        }

        if (combined.length > 0) {
          setSessions(combined);
        } else {
          setSessions(DEMO);
        }
      } catch (err) {
        setSessions(DEMO);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  const handleResume = (session) => {
    let videoId = session.youtube_id || session.youtubeId;
    if (!videoId && Array.isArray(session.video_ids) && session.video_ids.length > 0) {
      videoId = session.video_ids[0];
    }
    if (!videoId && typeof session.video_ids === 'string') {
      try {
        const parsed = JSON.parse(session.video_ids);
        if (Array.isArray(parsed) && parsed.length > 0) videoId = parsed[0];
      } catch {}
    }
    localStorage.setItem("activeSession", JSON.stringify({
      subject_focus: session.subject,
      subjectName: session.subject,
      topic: session.topic || session.title,
      youtube_url: session.youtube_url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""),
      youtubeId: videoId || "",
      youtube_id: videoId || "",
      lectureId: session.id,
      focus_minutes: 25,
      break_minutes: 5,
    }));
    navigate("/focus");
  };

  const handleModifySession = (sessionId, updatedData) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updatedData, topic: updatedData.topic, subject: updatedData.subject, duration: updatedData.duration } : s));
  };

  const handleDeleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };


  // Filter + sort
  const visible = sessions
    .filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.title?.toLowerCase().includes(q) || s.subject?.toLowerCase().includes(q) || s.topic?.toLowerCase().includes(q);
      const matchSubj   = filterSubj === "All" || s.subject === filterSubj;
      const isComp      = Boolean(s.is_completed || s.status === "completed");
      const matchTab    = activeTab === "completed" ? isComp : !isComp;
      return matchSearch && matchSubj && matchTab;
    })
    .sort((a, b) => {
      if (sortBy === "Recent")   return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
      if (sortBy === "Longest")  return (b.duration || b.study_minutes_logged || 0) - (a.duration || a.study_minutes_logged || 0);
      if (sortBy === "Most XP")  return (b.xp || 0) - (a.xp || 0);
      if (sortBy === "Progress") return (b.progress || 0) - (a.progress || 0);
      return 0;
    });

  // Unique subjects in current data
  const uniqueSubjects = ["All", ...new Set(sessions.map(s => s.subject).filter(Boolean))];
  const activeCount = sessions.filter(s => !(s.is_completed || s.status === "completed")).length;
  const completedCount = sessions.filter(s => Boolean(s.is_completed || s.status === "completed")).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          My Sessions
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          {sessions.length} total session{sessions.length !== 1 ? "s" : ""} · {completedCount} completed
        </Typography>
      </Box>

      {/* Active vs Completed Tab Bar */}
      <Box sx={{ display: "flex", borderBottom: "1px solid var(--border)", mb: 2.5, gap: 1 }}>
        {[
          { id: "active", label: `In-Progress (${activeCount})` },
          { id: "completed", label: `Completed (${completedCount})` }
        ].map(t => (
          <Box
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            sx={{
              px: 2, py: 1, cursor: "pointer",
              fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.9rem",
              borderBottom: `2px solid ${activeTab === t.id ? "var(--indigo)" : "transparent"}`,
              color: activeTab === t.id ? "var(--indigo-lt)" : "var(--text-dim)",
              transition: "all 0.15s",
              "&:hover": { color: "#f1f5f9" }
            }}
          >
            {t.label}
          </Box>
        ))}
      </Box>

      {/* Search + filter bar */}
      <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {/* Search */}
        <Box sx={{ position: "relative", flex: 1, minWidth: 200 }}>
          <SearchRoundedIcon sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: "var(--text-dim)" }} />
          <Box
            component="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sessions, subjects, topics…"
            sx={{
              width: "100%", pl: "38px", pr: 2, py: 1,
              bgcolor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", color: "#f1f5f9",
              fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" }, transition: "all 0.15s",
            }}
          />
        </Box>

        {/* Sort */}
        <Box sx={{ position: "relative" }}>
          <Box
            component="select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            sx={{
              px: 1.5, py: 1, bgcolor: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", color: "var(--text-mid)",
              fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              outline: "none", cursor: "pointer",
              "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o} value={o} style={{ background: "#0f1623" }}>{o}</option>)}
          </Box>
        </Box>

        {/* New session button */}
        <Box
          onClick={() => navigate("/courses")}
          sx={{
            display: "flex", alignItems: "center", gap: 0.6, px: 1.5, py: 1,
            borderRadius: "var(--r-md)", background: "var(--grad-primary)", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            "&:hover": { boxShadow: "0 6px 20px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
            transition: "all 0.18s",
          }}
        >
          <BoltRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>New Session</Typography>
        </Box>
      </Box>

      {/* Subject filter chips */}
      <Box sx={{ display: "flex", gap: 0.75, mb: 3, flexWrap: "wrap" }}>
        {uniqueSubjects.map(s => (
          <Chip
            key={s} label={s} size="small"
            onClick={() => setFilterSubj(s)}
            sx={{
              fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.75rem",
              cursor: "pointer",
              bgcolor: filterSubj === s ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${filterSubj === s ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: filterSubj === s ? "#a5b4fc" : "var(--text-dim)",
              "&:hover": { bgcolor: "rgba(99,102,241,0.1)" },
            }}
          />
        ))}
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: "var(--indigo)" }} />
          <Typography sx={{ mt: 2, color: "var(--text-dim)", fontSize: "0.85rem" }}>Loading sessions…</Typography>
        </Box>
      ) : visible.length === 0 ? (
        search || filterSubj !== "All"
          ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                No sessions match your filters.
              </Typography>
            </Box>
          )
          : <EmptyState onNew={() => navigate("/courses")} />
      ) : (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 2,
        }}>
          <AnimatePresence>
            {visible.map((session, i) => (
              <SessionCard
                key={session.id || i}
                session={session}
                index={i}
                onResume={handleResume}
                onModify={handleModifySession}
                onDelete={handleDeleteSession}
              />
            ))}
          </AnimatePresence>
        </Box>
      )}

    </Box>
  );
};

export default MyCourses;


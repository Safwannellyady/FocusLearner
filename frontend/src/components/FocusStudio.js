import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import YouTube from "react-youtube";

// Icons — dock tabs
import ScienceRoundedIcon       from "@mui/icons-material/ScienceRounded";
import NoteAltRoundedIcon       from "@mui/icons-material/NoteAltRounded";
import ManageSearchRoundedIcon  from "@mui/icons-material/ManageSearchRounded";
import SmartToyRoundedIcon      from "@mui/icons-material/SmartToyRounded";
import SummarizeRoundedIcon     from "@mui/icons-material/SummarizeRounded";
import FolderRoundedIcon        from "@mui/icons-material/FolderRounded";
// Icons — controls
import PlayArrowRoundedIcon     from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon         from "@mui/icons-material/PauseRounded";
import StopRoundedIcon          from "@mui/icons-material/StopRounded";
import SkipNextRoundedIcon      from "@mui/icons-material/SkipNextRounded";
import TimerRoundedIcon         from "@mui/icons-material/TimerRounded";
import SendRoundedIcon          from "@mui/icons-material/SendRounded";
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import ArticleRoundedIcon       from "@mui/icons-material/ArticleRounded";
import AttachFileRoundedIcon    from "@mui/icons-material/AttachFileRounded";
import RefreshRoundedIcon       from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon     from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon   from "@mui/icons-material/CheckCircleRounded";
import ViewSidebarRoundedIcon   from "@mui/icons-material/ViewSidebarRounded";
import FullscreenRoundedIcon    from "@mui/icons-material/FullscreenRounded";
import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import BoltRoundedIcon         from "@mui/icons-material/BoltRounded";
import MoreVertRoundedIcon     from "@mui/icons-material/MoreVertRounded";

import CloudDoneRoundedIcon    from "@mui/icons-material/CloudDoneRounded";
import CloudSyncRoundedIcon    from "@mui/icons-material/CloudSyncRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { focusAPI, lectureAPI } from "../services/api";
import SubjectLabs from "./labs/SubjectLabs";


const extractYouTubeId = (url) => {
  if (!url) return "";
  const str = String(url).trim();
  const m = str.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(str)) return str;
  return "";
};

/* ── Timer helpers ─────────────────────────────────────────────────────────── */
const fmtTime = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* ── Tab definitions ────────────────────────────────────────────────────────── */
const TABS = [
  { id: "lab",       icon: ScienceRoundedIcon,      label: "Lab"        },
  { id: "notes",     icon: NoteAltRoundedIcon,       label: "Notes"      },
  { id: "search",    icon: ManageSearchRoundedIcon,  label: "Search"     },
  { id: "chat",      icon: SmartToyRoundedIcon,      label: "Chat"       },
  { id: "summarize", icon: SummarizeRoundedIcon,     label: "Summarize"  },
  { id: "materials", icon: FolderRoundedIcon,        label: "Materials"  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TAB PANELS
═══════════════════════════════════════════════════════════════════════════ */

/* ── 🧪 Lab Panel ───────────────────────────────────────────────────────────── */
const LAB_PROMPTS = {
  default: [
    "Explain the concept in your session in one sentence without jargon.",
    "List 3 real-world applications of what you're studying right now.",
    "If you had to teach this topic to a 10-year-old, where would you start?",
    "What is the single most counterintuitive thing about this subject?",
    "Connect this topic to something you already know well.",
  ],
};
const LabPanel = ({ session }) => {
  const [prompt, setPrompt] = useState(null);
  const [answer, setAnswer] = useState("");
  const [saved,  setSaved]  = useState(false);
  const pool = LAB_PROMPTS.default;

  const roll = useCallback(() => {
    setPrompt(pool[Math.floor(Math.random() * pool.length)]);
    setAnswer(""); setSaved(false);
  }, [pool]);

  useEffect(() => { roll(); }, []);

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2, height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
          🧪 Lab Challenge
        </Typography>
        <Tooltip title="New prompt">
          <IconButton size="small" onClick={roll} sx={{ color: "var(--text-dim)" }}>
            <RefreshRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {prompt && (
        <Box sx={{ p: 1.75, borderRadius: "var(--r-md)", bgcolor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: 1.65, fontWeight: 500 }}>
            {prompt}
          </Typography>
        </Box>
      )}

      <Box
        component="textarea"
        placeholder="Type your answer here…"
        value={answer}
        onChange={e => { setAnswer(e.target.value); setSaved(false); }}
        sx={{
          flex: 1, resize: "none", p: 1.5, borderRadius: "var(--r-md)",
          bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
          color: "#f1f5f9", fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif",
          outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
          minHeight: 80,
        }}
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={() => { if (answer.trim()) setSaved(true); }}
          sx={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
            py: 0.9, borderRadius: "var(--r-md)",
            bgcolor: saved ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.12)",
            border: `1px solid ${saved ? "rgba(16,185,129,0.35)" : "rgba(99,102,241,0.25)"}`,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {saved
            ? <><CheckCircleRoundedIcon sx={{ fontSize: 16, color: "var(--emerald)" }} /><Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--emerald)" }}>Saved</Typography></>
            : <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--indigo-lt)" }}>Save Answer</Typography>
          }
        </Box>
        <Box
          onClick={roll}
          sx={{
            px: 1.5, py: 0.9, borderRadius: "var(--r-md)",
            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-mid)" }}>🎲 New</Typography>
        </Box>
      </Box>
    </Box>
  );
};

/* ── 📝 Notes Panel ─────────────────────────────────────────────────────────── */
const NotesPanel = ({ session }) => {
  const key  = `fl_notes_${session?.subjectName || "default"}`;
  const [text, setText] = useState(() => localStorage.getItem(key) || "");
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  const handleChange = (val) => {
    setText(val); setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { localStorage.setItem(key, val); setSaved(true); }, 800);
  };

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
          📝 Notes
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", color: saved ? "var(--emerald)" : "var(--text-dim)", fontWeight: 600 }}>
          {saved ? "✓ Auto-saved" : "Editing…"}
        </Typography>
      </Box>
      <Box
        component="textarea"
        placeholder={`Your notes for ${session?.topic || "this session"}…\n\nMarkdown supported.`}
        value={text}
        onChange={e => handleChange(e.target.value)}
        sx={{
          flex: 1, resize: "none", p: 1.5, borderRadius: "var(--r-md)",
          bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
          color: "#e2e8f0", fontSize: "0.88rem", fontFamily: "JetBrains Mono, monospace",
          lineHeight: 1.7, outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.4)" },
        }}
      />
    </Box>
  );
};

/* ── 🔍 Search Panel (Wiki + Google) ────────────────────────────────────────── */
const SearchPanel = ({ session }) => {
  const [query,   setQuery]   = useState(session?.topic || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.trim())}`
      );
      if (wikiRes.ok) {
        const wiki = await wikiRes.json();
        setResults({ wiki });
      } else {
        setError("No Wikipedia article found. Try a different term.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (session?.topic) search(); }, []);

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, height: "100%", overflow: "hidden" }}>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
        🔍 Search
      </Typography>

      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Box sx={{ position: "relative", flex: 1 }}>
          <SearchRoundedIcon sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text-dim)" }} />
          <Box
            component="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Search Wikipedia + Google…"
            sx={{
              width: "100%", pl: "34px", pr: 2, py: 1,
              bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", color: "#f1f5f9",
              fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
            }}
          />
        </Box>
        <Box
          onClick={search}
          sx={{
            px: 1.5, py: 1, borderRadius: "var(--r-md)",
            bgcolor: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center",
            "&:hover": { bgcolor: "rgba(99,102,241,0.25)" },
          }}
        >
          {loading ? <CircularProgress size={14} sx={{ color: "var(--indigo-lt)" }} /> : <SearchRoundedIcon sx={{ fontSize: 16, color: "var(--indigo-lt)" }} />}
        </Box>
      </Box>

      {error && <Typography sx={{ fontSize: "0.78rem", color: "var(--rose)" }}>{error}</Typography>}

      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {results?.wiki && (
          <Box sx={{ p: 1.75, borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <ArticleRoundedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Wikipedia</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#f1f5f9", mb: 0.75 }}>{results.wiki.title}</Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-mid)", lineHeight: 1.65 }}>
              {results.wiki.extract?.slice(0, 400)}{results.wiki.extract?.length > 400 ? "…" : ""}
            </Typography>
            {results.wiki.content_urls?.desktop?.page && (
              <Box
                component="a"
                href={results.wiki.content_urls.desktop.page}
                target="_blank"
                rel="noopener"
                sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, color: "var(--indigo-lt)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", "&:hover": { color: "#f1f5f9" } }}
              >
                <OpenInNewRoundedIcon sx={{ fontSize: 13 }} /> Read full article
              </Box>
            )}
          </Box>
        )}

        {/* Google search link */}
        <Box
          component="a"
          href={googleUrl}
          target="_blank"
          rel="noopener"
          sx={{
            display: "flex", alignItems: "center", gap: 1, p: "10px 14px",
            borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)", textDecoration: "none",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)", borderColor: "var(--border-active)" },
          }}
        >
          <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#fff" }}>G</Box>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-mid)" }}>Open Google Search →</Typography>
          <OpenInNewRoundedIcon sx={{ fontSize: 13, color: "var(--text-dim)", ml: "auto" }} />
        </Box>
      </Box>
    </Box>
  );
};

/* ── 🤖 Chat Panel ───────────────────────────────────────────────────────────── */
const ChatPanel = ({ session }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi! I'm your AI tutor for **${session?.topic || "this session"}**. Ask me anything about what you're studying.` },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ message: text, context: session?.subjectName, topic: session?.topic }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", text: data.response || data.message || "I'm not sure — try rephrasing." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Connection error. Please check the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, borderBottom: "1px solid var(--border)" }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
          🤖 AI Tutor Chat
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Context: {session?.subjectName} — {session?.topic}</Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <Box sx={{
              maxWidth: "82%", px: 1.5, py: 1, borderRadius: "var(--r-md)",
              bgcolor: m.role === "user" ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${m.role === "user" ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}>
              <Typography sx={{ fontSize: "0.83rem", color: m.role === "user" ? "#c7d2fe" : "#e2e8f0", lineHeight: 1.6 }}>
                {m.text}
              </Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: "flex", gap: 0.5, px: 1.5, py: 1 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "var(--indigo-lt)" }} />
              </motion.div>
            ))}
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ p: 1.5, borderTop: "1px solid var(--border)", display: "flex", gap: 0.75 }}>
        <Box
          component="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about your topic…"
          sx={{
            flex: 1, px: 1.5, py: 1, bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)", borderRadius: "var(--r-md)",
            color: "#f1f5f9", fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif",
            outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
          }}
        />
        <Box
          onClick={send}
          sx={{
            px: 1.25, py: 0.75, borderRadius: "var(--r-md)",
            bgcolor: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center",
            "&:hover": { bgcolor: "rgba(99,102,241,0.25)" },
          }}
        >
          <SendRoundedIcon sx={{ fontSize: 16, color: "var(--indigo-lt)" }} />
        </Box>
      </Box>
    </Box>
  );
};

/* ── 📄 Summarize Panel ─────────────────────────────────────────────────────── */
const SummarizePanel = ({ session }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setSummary("");
    try {
      const res = await fetch("/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ subject: session?.subjectName, topic: session?.topic }),
      });
      const data = await res.json();
      setSummary(data.summary || data.response || "Summary generated.");
    } catch {
      setSummary("⚠️ Could not connect to AI service. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
          📄 AI Summarizer
        </Typography>
        <Box
          onClick={generate}
          sx={{
            display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.6,
            borderRadius: "var(--r-md)", bgcolor: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)", cursor: "pointer",
            "&:hover": { bgcolor: "rgba(99,102,241,0.22)" },
          }}
        >
          {loading ? <CircularProgress size={12} sx={{ color: "var(--indigo-lt)" }} /> : <RefreshRoundedIcon sx={{ fontSize: 14, color: "var(--indigo-lt)" }} />}
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--indigo-lt)" }}>
            {summary ? "Regenerate" : "Generate"}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
        AI-generated summary for <strong style={{ color: "var(--indigo-lt)" }}>{session?.topic || "your topic"}</strong>
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {!summary && !loading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <SummarizeRoundedIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.1)", mb: 1 }} />
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
              Click Generate to get an AI summary of your topic
            </Typography>
          </Box>
        )}
        {summary && (
          <Box sx={{ p: 1.75, borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {summary}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ── 📋 Materials Panel ──────────────────────────────────────────────────────── */
const MaterialsPanel = ({ session }) => {
  const files = session?.files || [];
  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9" }}>
        📋 Materials
      </Typography>
      {files.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <FolderRoundedIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.1)", mb: 1 }} />
          <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>No files attached to this session.</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)", mt: 0.5 }}>Upload materials in New Session → Step 2</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {files.map((f, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
              <AttachFileRoundedIcon sx={{ fontSize: 16, color: "var(--indigo-lt)" }} />
              <Typography sx={{ fontSize: "0.82rem", color: "var(--text-mid)", flex: 1 }} noWrap>{f.name || f}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FOCUS STUDIO (main)
═══════════════════════════════════════════════════════════════════════════ */
const FocusStudio = () => {
  const navigate = useNavigate();
  const session  = (() => {
    try { return JSON.parse(localStorage.getItem("activeSession")) || {}; }
    catch { return {}; }
  })();

  const initialVid = extractYouTubeId(session.youtubeId) || extractYouTubeId(session.youtube_id) || extractYouTubeId(session.youtube_url);
  const [videoId, setVideoId]       = useState(initialVid || "");
  const [videoList, setVideoList]   = useState([]);
  const [theaterMode, setTheaterMode] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionModal, setCompletionModal] = useState({ open: false, xp: 0, label: "", minutes: 0 });
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [isSearchingSidebar, setIsSearchingSidebar] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videosLoaded, setVideosLoaded] = useState(false);

  const subjectFocus = session.subject_focus || session.subjectName || "";

  useEffect(() => {
    const query = session.topic || session.title || subjectFocus;
    focusAPI.getContent(query, subjectFocus)
      .then(res => {
        const results = res?.data?.results || res?.data?.videos || [];
        setVideoList(results);
        setVideosLoaded(true);
        if (results.length > 0) {
          const currentClean = extractYouTubeId(videoId);
          // Never replace a video supplied by the learner.  Only choose the
          // best verified result when no video is selected yet.
          if (!currentClean) {
            const rawVid = results[0].video_id || results[0].id || results[0].url || "";
            const vid = extractYouTubeId(rawVid);
            if (vid) setVideoId(vid);
          }
        }
      })
      .catch(err => {
        console.error("Video search error:", err);
        setVideoList([]);
        setVideosLoaded(true);
      });
  }, [session.topic, session.title, subjectFocus]);

  const handleSidebarSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = sidebarSearch.trim() || session.topic || subjectFocus;
    setIsSearchingSidebar(true);
    focusAPI.getContent(q, subjectFocus)
      .then(res => {
        const results = res?.data?.results || res?.data?.videos || [];
        setVideoList(results);
        setVideosLoaded(true);
      })
      .catch(err => console.error("Sidebar search error:", err))
      .finally(() => setIsSearchingSidebar(false));
  };

  const selectVideo = (candidate) => {
    const nextVideoId = extractYouTubeId(candidate);
    if (nextVideoId) {
      setVideoId(nextVideoId);
      setVideoError("");
    }
  };

  const renderVideo = () => {
    const selectedVideoId = extractYouTubeId(videoId);
    if (!selectedVideoId) {
      return <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
        <TimerRoundedIcon sx={{ fontSize: 36, color: accent }} />
        <Typography sx={{ fontSize: "0.88rem", color: "var(--text-mid)" }}>Select a verified video from the sidebar</Typography>
      </Box>;
    }
    if (videoError) {
      return <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, px: 3, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700, color: "#fda4af" }}>This video cannot play in the Focus Studio.</Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{videoError} Select another verified recommendation.</Typography>
      </Box>;
    }
    return <YouTube
      videoId={selectedVideoId}
      opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1, rel: 0 } }}
      style={{ width: "100%", height: "100%" }}
      iframeClassName="focus-studio-player"
      onError={(event) => setVideoError(event.data === 101 || event.data === 150 ? "The video owner has disabled embedded playback." : "YouTube could not load this video.")}
    />;
  };

  /* Timer state */
  const [phase,     setPhase]    = useState("focus");   // focus | break
  const [remaining, setRemaining] = useState((session.focus_minutes || 25) * 60);
  const [running,   setRunning]  = useState(true);
  const [sessionCount, setSessionCount] = useState(1);
  const intervalRef = useRef(null);
  const focusMin = session.focus_minutes || 25;
  const breakMin = session.break_minutes || 5;

  /* Dock state */
  const [activeTab, setActiveTab] = useState("lab");
  const [topPct, setTopPct] = useState(60);     // video panel % height
  const dragRef = useRef(null);
  const isDragging = useRef(false);

  /* Timer tick & elapsed study seconds tracking */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsedSec(sec => sec + 1);
        setRemaining(r => {
          if (r <= 1) {
            const next = phase === "focus" ? "break" : "focus";
            setPhase(next);
            if (next === "focus") setSessionCount(c => c + 1);
            return (next === "focus" ? focusMin : breakMin) * 60;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase, focusMin, breakMin]);

  const elapsedMin = Math.floor(elapsedSec / 60);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"

  /* Incremental Autosave (Every 30 seconds) */
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (elapsedSec > 0) {
        setSaveStatus("saving");
        focusAPI.autosave({
          session_id: session.id,
          elapsed_seconds: elapsedSec,
          selected_lab: session.selected_lab,
          video_id: videoId
        })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
      }
    }, 30000);
    return () => clearInterval(autosaveInterval);
  }, [elapsedSec, session.id, session.selected_lab, videoId]);


  const getScaledXP = (mins) => {
    if (mins >= 90) return { xp: 650, label: "Elite Focus!" };
    if (mins >= 60) return { xp: 400, label: "Brilliant!" };
    if (mins >= 45) return { xp: 250, label: "Deep Focus!" };
    if (mins >= 30) return { xp: 150, label: "Solid Session!" };
    return { xp: 0, label: "Below 30m" };
  };

  const handleCompleteSession = async () => {
    if (elapsedMin < 30) return;
    setIsCompleting(true);
    try {
      const lectureId = session.lectureId;
      if (lectureId) {
        const res = await lectureAPI.complete(lectureId, { elapsed_minutes: elapsedMin });
        const data = res?.data || {};
        setCompletionModal({
          open: true,
          xp: data.xp_earned || getScaledXP(elapsedMin).xp,
          label: data.label || getScaledXP(elapsedMin).label,
          minutes: elapsedMin
        });
      } else {
        const { xp, label } = getScaledXP(elapsedMin);
        setCompletionModal({ open: true, xp, label, minutes: elapsedMin });
      }
    } catch (err) {
      console.error("Completion error:", err);
      const { xp, label } = getScaledXP(elapsedMin);
      setCompletionModal({ open: true, xp, label, minutes: elapsedMin });
    } finally {
      setIsCompleting(false);
    }
  };

  /* Divider drag */
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const container = dragRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pct  = ((e.clientY - rect.top) / rect.height) * 100;
    setTopPct(Math.min(80, Math.max(25, pct)));
  }, []);
  const onMouseUp = useCallback(() => { isDragging.current = false; document.body.style.cursor = ""; }, []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const accent = phase === "focus" ? "#6366f1" : "#10b981";
  const total  = (phase === "focus" ? focusMin : breakMin) * 60;
  const pct    = ((total - remaining) / total) * 100;

  const handleEndSession = () => {
    clearInterval(intervalRef.current);
    localStorage.removeItem("activeSession");
    navigate("/my-courses");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "lab":       return <SubjectLabs subjectFocus={session.subject_focus} topic={session.topic} initialLabId={session.selected_lab} />;

      case "notes":     return <NotesPanel session={session} />;
      case "search":    return <SearchPanel session={session} />;
      case "chat":      return <ChatPanel session={session} />;
      case "summarize": return <SummarizePanel session={session} />;
      case "materials": return <MaterialsPanel session={session} />;
      default:          return null;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden", bgcolor: "var(--bg)", position: "relative" }}>

      {/* ── Phase accent strip ── */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg,${accent} 0%,transparent ${pct}%)`, transition: "background 0.5s" }} />

      {/* ── Top bar ── */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1,
        bgcolor: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        {/* Subject + topic */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ px: 1, py: 0.25, bgcolor: "rgba(99,102,241,0.15)", borderRadius: "100px", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--indigo-lt)" }}>
                {session.subject_focus || "Session"}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }} noWrap>
              / {session.topic || "Focus Studio"}
            </Typography>
          </Box>
        </Box>

        {/* Live timer */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            px: 1.5, py: 0.5, borderRadius: "100px",
            bgcolor: phase === "focus" ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)",
            border: `1px solid ${phase === "focus" ? "rgba(99,102,241,0.35)" : "rgba(16,185,129,0.35)"}`,
            display: "flex", alignItems: "center", gap: 0.75,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent, boxShadow: `0 0 6px ${accent}`, animation: running ? "pulse-ring 1.5s infinite" : "none" }} />
            <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", fontWeight: 800, color: accent }}>
              {fmtTime(remaining)}
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {phase}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace" }}>
            #{sessionCount}
          </Typography>

          {/* Autosave Status Badge */}
          <Tooltip title={saveStatus === "saved" ? "Session synced with PostgreSQL cloud" : saveStatus === "saving" ? "Autosaving session..." : "Autosave failed — retrying"}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "100px", bgcolor: saveStatus === "saved" ? "rgba(16,185,129,0.1)" : saveStatus === "saving" ? "rgba(99,102,241,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${saveStatus === "saved" ? "rgba(16,185,129,0.25)" : saveStatus === "saving" ? "rgba(99,102,241,0.25)" : "rgba(239,68,68,0.25)"}` }}>
              {saveStatus === "saved" && <CloudDoneRoundedIcon sx={{ fontSize: 13, color: "var(--emerald)" }} />}
              {saveStatus === "saving" && <CloudSyncRoundedIcon sx={{ fontSize: 13, color: "var(--indigo-lt)" }} />}
              {saveStatus === "error" && <ErrorOutlineRoundedIcon sx={{ fontSize: 13, color: "var(--rose)" }} />}
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: saveStatus === "saved" ? "var(--emerald)" : saveStatus === "saving" ? "var(--indigo-lt)" : "var(--rose)" }}>
                {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Save Failed"}
              </Typography>
            </Box>
          </Tooltip>
        </Box>


        {/* Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {/* Milestone indicator */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.75, px: 1.25, py: 0.4, borderRadius: "var(--r-md)", bgcolor: elapsedMin >= 30 ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${elapsedMin >= 30 ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}` }}>
            <BoltRoundedIcon sx={{ fontSize: 15, color: elapsedMin >= 30 ? "var(--emerald)" : "var(--amber)" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: elapsedMin >= 30 ? "var(--emerald)" : "var(--text-mid)" }}>
              {elapsedMin < 30 ? `${elapsedMin}m / 30m min` : `${elapsedMin}m (${getScaledXP(elapsedMin).xp} XP • ${getScaledXP(elapsedMin).label})`}
            </Typography>
          </Box>

          <Tooltip title={theaterMode ? "Split View (Sidebar)" : "Theater View (Full Video)"}>
            <IconButton size="small" onClick={() => setTheaterMode(t => !t)} sx={{ color: "var(--indigo-lt)", bgcolor: "rgba(99,102,241,0.1)", width: 30, height: 30, borderRadius: "var(--r-sm)" }}>
              {theaterMode ? <ViewSidebarRoundedIcon sx={{ fontSize: 16 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={running ? "Pause Timer" : "Resume Timer"}>
            <IconButton size="small" onClick={() => setRunning(r => !r)} sx={{ color: "var(--indigo-lt)", bgcolor: "rgba(99,102,241,0.1)", width: 30, height: 30, borderRadius: "var(--r-sm)" }}>
              {running ? <PauseRoundedIcon sx={{ fontSize: 15 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </Tooltip>

          {/* Complete / Done button */}
          {elapsedMin < 30 ? (
            <Tooltip title={`Study at least 30 minutes to complete session & claim XP (Studied ${elapsedMin}m / 30m)`}>
              <Box sx={{ display: "inline-block" }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                  Complete ({30 - elapsedMin}m left)
                </Box>
              </Box>
            </Tooltip>
          ) : (
            <Box
              onClick={handleCompleteSession}
              sx={{
                px: 1.5, py: 0.5, borderRadius: "var(--r-md)",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "#fff", fontSize: "0.75rem", fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5,
                boxShadow: "0 2px 10px rgba(16,185,129,0.35)", transition: "all 0.15s",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(16,185,129,0.5)" },
              }}
            >
              {isCompleting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <EmojiEventsRoundedIcon sx={{ fontSize: 15 }} />}
              Complete & Claim {getScaledXP(elapsedMin).xp} XP 🏆
            </Box>
          )}

          <Box
            onClick={handleEndSession}
            sx={{
              display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.5,
              borderRadius: "var(--r-md)", bgcolor: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.25)", cursor: "pointer",
              "&:hover": { bgcolor: "rgba(244,63,94,0.18)" }, ml: 0.5,
            }}
          >
            <StopRoundedIcon sx={{ fontSize: 14, color: "var(--rose)" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--rose)" }}>End</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Main split area ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

        {/* TOP — Video & YouTube Sidebar Panel */}
        <Box sx={{ height: `${topPct}%`, flexShrink: 0, bgcolor: "#000", position: "relative", overflow: "hidden" }}>
          {theaterMode ? (
            /* Theater Mode: 100% width video */
            extractYouTubeId(videoId) ? renderVideo() : (
              <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${accent}44,transparent)`, border: `2px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TimerRoundedIcon sx={{ fontSize: 36, color: accent }} />
                  </Box>
                </motion.div>
                <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#f1f5f9" }}>
                  {phase === "focus" ? "Focus Phase — Stay locked in" : "Break Phase — Rest your mind"}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "var(--text-dim)", textAlign: "center", maxWidth: 320 }}>
                  {session.topic ? `Studying: ${session.topic}` : "No video attached."}
                </Typography>
              </Box>
            )
          ) : (
            /* Split View: Video Player + YouTube Sidebar */
            <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
              {/* Left Video Player */}
              <Box sx={{ flex: "1 1 70%", height: "100%", bgcolor: "#000" }}>
                {extractYouTubeId(videoId) ? renderVideo() : (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                    <TimerRoundedIcon sx={{ fontSize: 36, color: accent }} />
                    <Typography sx={{ fontSize: "0.88rem", color: "var(--text-mid)" }}>Select a video from the sidebar list</Typography>
                  </Box>
                )}
              </Box>

              {/* Right YouTube-style Sidebar */}
              <Box sx={{ width: { xs: "240px", sm: "310px", md: "340px" }, flexShrink: 0, height: "100%", bgcolor: "#0b1320", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                <Box sx={{ p: 1.25, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#f1f5f9" }}>
                      Related Videos ({videoList.length})
                    </Typography>
                    <Tooltip title="Theater Mode (Full Screen Video)">
                      <IconButton size="small" onClick={() => setTheaterMode(true)} sx={{ color: "var(--text-dim)" }}>
                        <FullscreenRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Interactive Search Bar in Sidebar */}
                  <Box
                    component="form"
                    onSubmit={handleSidebarSearchSubmit}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.5,
                      bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)", px: 1, py: 0.4, transition: "all 0.15s",
                      "&:focus-within": { borderColor: "rgba(99,102,241,0.5)", bgcolor: "rgba(99,102,241,0.05)" }
                    }}
                  >
                    <SearchRoundedIcon sx={{ fontSize: 14, color: "var(--text-dim)" }} />
                    <Box
                      component="input"
                      value={sidebarSearch}
                      onChange={e => setSidebarSearch(e.target.value)}
                      placeholder="Search YouTube topics..."
                      sx={{
                        width: "100%", border: "none", outline: "none",
                        bgcolor: "transparent", color: "#f1f5f9", fontSize: "0.75rem",
                        fontFamily: "Plus Jakarta Sans, sans-serif"
                      }}
                    />
                    {isSearchingSidebar ? (
                      <CircularProgress size={12} sx={{ color: "var(--indigo)" }} />
                    ) : (
                      <IconButton size="small" type="submit" sx={{ p: 0.2, color: "var(--text-dim)" }}>
                        <SendRoundedIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: "auto", p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  {videoList.length > 0 ? (
                    videoList.map((v) => {
                      const vId = extractYouTubeId(v.video_id || v.id || v.url);
                      const isSel = vId && vId === extractYouTubeId(videoId);
                      const thumbUrl = v.thumbnail || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
                      return (
                        <Box
                          key={vId || v.title}
                          onClick={() => selectVideo(vId)}
                          sx={{
                            display: "flex", gap: 1, p: 0.75, borderRadius: "var(--r-md)",
                            cursor: "pointer", transition: "all 0.15s",
                            bgcolor: isSel ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${isSel ? "rgba(99,102,241,0.45)" : "transparent"}`,
                            "&:hover": { bgcolor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.2)" },
                          }}
                        >
                          <Box sx={{ width: 104, height: 58, borderRadius: "6px", overflow: "hidden", position: "relative", bgcolor: "#0f172a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img
                              src={thumbUrl}
                              alt={v.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
                              }}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {isSel && (
                              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ fontSize: "0.6rem", fontWeight: 900, color: "#fff", bgcolor: "var(--indigo)", px: 0.75, py: 0.2, borderRadius: 1 }}>PLAYING</Typography>
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.74rem", color: isSel ? "#a5b4fc" : "#f1f5f9", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {v.title}
                            </Typography>
                            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)", mt: 0.4 }} noWrap>
                              {v.channel || "Educational Video"}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : videosLoaded ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No verified videos matched these keywords. Refine the topic or try another search.</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <CircularProgress size={20} sx={{ color: "var(--indigo)", mb: 1 }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Fetching related videos…</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Drag divider */}
        <Box
          ref={dragRef}
          onMouseDown={() => { isDragging.current = true; document.body.style.cursor = "ns-resize"; }}
          sx={{
            height: 6, flexShrink: 0, cursor: "ns-resize",
            bgcolor: "var(--border)", position: "relative",
            "&:hover": { bgcolor: "rgba(99,102,241,0.4)" }, transition: "background 0.15s",
            "&::after": { content: '""', position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 32, height: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)" },
          }}
        />

        {/* BOTTOM — Tool dock */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "var(--bg-card)" }}>
          {/* Tab bar */}
          <Box sx={{ display: "flex", borderBottom: "1px solid var(--border)", px: 1, gap: 0.25, flexShrink: 0, overflowX: "auto" }}>
            {TABS.map(({ id, icon: Icon, label }) => (
              <Box
                key={id}
                onClick={() => setActiveTab(id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  px: 1.25, py: 0.85, cursor: "pointer",
                  borderBottom: `2px solid ${activeTab === id ? accent : "transparent"}`,
                  color: activeTab === id ? accent : "var(--text-dim)",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                  "&:hover": { color: "#f1f5f9" },
                }}
              >
                <Icon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Tab content */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ height: "100%", overflow: "hidden" }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      {/* Celebration XP Completion Modal */}
      <AnimatePresence>
        {completionModal.open && (
          <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, bgcolor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Box sx={{ bgcolor: "#0f172a", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 4, maxWidth: 420, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "rgba(16,185,129,0.15)", border: "2px solid var(--emerald)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <EmojiEventsRoundedIcon sx={{ fontSize: 40, color: "var(--emerald)" }} />
                </Box>
                <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#f1f5f9", mb: 0.5 }}>
                  Session Completed! 🎉
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "var(--emerald)", fontWeight: 700, mb: 1 }}>
                  {completionModal.label}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)", mb: 3 }}>
                  You spent {completionModal.minutes} minutes studying {session.topic || session.subject_focus || "your topic"}.
                </Typography>
                <Box sx={{ bgcolor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "var(--r-md)", p: 2, mb: 3 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>Reward Claimed</Typography>
                  <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#fbbf24", mt: 0.25 }}>
                    +{completionModal.xp} XP
                  </Typography>
                </Box>
                <Box
                  onClick={() => { setCompletionModal({ open: false, xp: 0, label: "", minutes: 0 }); navigate("/my-courses?tab=completed"); }}
                  sx={{ width: "100%", py: 1.25, borderRadius: "var(--r-md)", background: "var(--grad-primary)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
                >
                  View Completed Sessions
                </Box>
              </Box>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default FocusStudio;

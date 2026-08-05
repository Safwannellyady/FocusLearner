import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, Button, CircularProgress,
  Slider, Switch, FormControlLabel, Alert, LinearProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { TAXONOMY } from "../data/taxonomy";
import { focusAPI, lectureAPI } from "../services/api";

// Icons
import ArrowForwardRoundedIcon  from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon     from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import LinkRoundedIcon          from "@mui/icons-material/LinkRounded";
import UploadFileRoundedIcon    from "@mui/icons-material/UploadFileRounded";
import CheckCircleRoundedIcon   from "@mui/icons-material/CheckCircleRounded";
import PlayArrowRoundedIcon     from "@mui/icons-material/PlayArrowRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import SmartToyRoundedIcon      from "@mui/icons-material/SmartToyRounded";
import NoteAltRoundedIcon       from "@mui/icons-material/NoteAltRounded";
import ManageSearchRoundedIcon  from "@mui/icons-material/ManageSearchRounded";
import SummarizeRoundedIcon     from "@mui/icons-material/SummarizeRounded";
import LockRoundedIcon          from "@mui/icons-material/LockRounded";
import BoltRoundedIcon          from "@mui/icons-material/BoltRounded";
import CloseRoundedIcon         from "@mui/icons-material/CloseRounded";
import AttachFileRoundedIcon    from "@mui/icons-material/AttachFileRounded";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const extractYouTubeId = (url) => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

/* ── Step indicator ───────────────────────────────────────────────────────── */
const StepDot = ({ n, label, active, done }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: done ? "var(--emerald)" : active ? "var(--indigo)" : "rgba(255,255,255,0.06)",
      border: `2px solid ${done ? "var(--emerald)" : active ? "var(--indigo)" : "rgba(255,255,255,0.1)"}`,
      transition: "all 0.3s", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.8rem",
      color: done || active ? "#fff" : "var(--text-dim)",
    }}>
      {done ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : n}
    </Box>
    <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: active ? "#f1f5f9" : "var(--text-dim)", letterSpacing: "0.04em" }}>
      {label}
    </Typography>
  </Box>
);

const StepBar = ({ step }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, mb: 4 }}>
    {[["1","Subject"],["2","Resources"],["3","Configure"]].map(([n, label], i) => (
      <React.Fragment key={n}>
        <StepDot n={n} label={label} active={step === i} done={step > i} />
        {i < 2 && (
          <Box sx={{ width: { xs: 40, sm: 80 }, height: 2, bgcolor: step > i ? "var(--emerald)" : "rgba(255,255,255,0.08)", transition: "background 0.4s", mx: 1, borderRadius: 2 }} />
        )}
      </React.Fragment>
    ))}
  </Box>
);

/* ── Toggle feature row ───────────────────────────────────────────────────── */
const FeatureToggle = ({ icon: Icon, label, desc, checked, onChange, accent = "var(--indigo)" }) => (
  <Box onClick={onChange} sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    p: "12px 16px", borderRadius: "var(--r-md)", cursor: "pointer",
    bgcolor: checked ? `${accent}11` : "rgba(255,255,255,0.03)",
    border: `1px solid ${checked ? `${accent}44` : "rgba(255,255,255,0.07)"}`,
    transition: "all 0.18s", userSelect: "none",
    "&:hover": { bgcolor: checked ? `${accent}1a` : "rgba(255,255,255,0.05)" },
  }}>
    <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-sm)", bgcolor: checked ? `${accent}22` : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 18, color: checked ? accent : "var(--text-dim)" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: checked ? "#f1f5f9" : "var(--text-mid)" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{desc}</Typography>
    </Box>
    <Box sx={{
      width: 36, height: 20, borderRadius: "100px", position: "relative", flexShrink: 0,
      bgcolor: checked ? accent : "rgba(255,255,255,0.1)", transition: "background 0.2s",
    }}>
      <Box sx={{
        position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        borderRadius: "50%", bgcolor: "#fff", transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </Box>
  </Box>
);

/* ══ STEP 1 — Subject & Topic ════════════════════════════════════════════════ */
const Step1 = ({ data, setData }) => {
  const [search, setSearch] = useState("");
  const [openSector, setOpenSector] = useState(null);

  const filtered = TAXONOMY.map(sec => ({
    ...sec,
    subjects: sec.subjects.filter(sub =>
      !search || sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(sec => sec.subjects.length > 0);

  const selectedSubject = TAXONOMY.flatMap(s => s.subjects).find(s => s.id === data.subjectId);

  return (
    <Box>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#f1f5f9", mb: 0.5 }}>
        What are you studying?
      </Typography>
      <Typography sx={{ color: "var(--text-dim)", fontSize: "0.84rem", mb: 2.5 }}>
        Select a sector, subject, and specific micro-topic.
      </Typography>

      {/* Search */}
      <Box sx={{ position: "relative", mb: 2.5 }}>
        <SearchRoundedIcon sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-dim)" }} />
        <Box
          component="input"
          placeholder="Search subjects or topics…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            width: "100%", pl: "40px", pr: 2, py: 1.25,
            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", color: "#f1f5f9",
            fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
            outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 0 0 3px rgba(99,102,241,0.1)" },
            transition: "all 0.15s",
          }}
        />
      </Box>

      {/* Sector → Subject accordion */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 340, overflowY: "auto", pr: 0.5 }}>
        {filtered.map(sec => (
          <Box key={sec.id}>
            <Box
              onClick={() => setOpenSector(openSector === sec.id ? null : sec.id)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 1.5, py: 1, borderRadius: "var(--r-md)", cursor: "pointer",
                bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-mid)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {sec.sector}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                {openSector === sec.id ? "▲" : "▼"}
              </Typography>
            </Box>

            <AnimatePresence>
              {(openSector === sec.id || search) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <Box sx={{ pt: 0.75, pl: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {sec.subjects.map(sub => (
                      <Box
                        key={sub.id}
                        onClick={() => setData(d => ({ ...d, subjectId: sub.id, subjectName: sub.name, topic: "" }))}
                        sx={{
                          px: 1.5, py: 1, borderRadius: "var(--r-md)", cursor: "pointer",
                          bgcolor: data.subjectId === sub.id ? "rgba(99,102,241,0.13)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${data.subjectId === sub.id ? "rgba(99,102,241,0.35)" : "transparent"}`,
                          transition: "all 0.15s", "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: data.subjectId === sub.id ? "#a5b4fc" : "#f1f5f9" }}>
                          {sub.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        ))}
      </Box>

      {/* Micro-topic chips */}
      {selectedSubject && (
        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1 }}>
            {selectedSubject.name} — Select Micro-Topic
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {selectedSubject.topics.map(t => (
              <Chip
                key={t} label={t} size="small"
                onClick={() => setData(d => ({ ...d, topic: t }))}
                sx={{
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.75rem",
                  cursor: "pointer",
                  bgcolor: data.topic === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${data.topic === t ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                  color: data.topic === t ? "#a5b4fc" : "var(--text-mid)",
                  "&:hover": { bgcolor: "rgba(99,102,241,0.12)" },
                }}
              />
            ))}
          </Box>

          {/* Custom topic input */}
          <Box
            component="input"
            placeholder="Or type a custom topic…"
            value={selectedSubject.topics.includes(data.topic) ? "" : data.topic}
            onChange={e => setData(d => ({ ...d, topic: e.target.value }))}
            sx={{
              mt: 1.5, width: "100%", px: 2, py: 1,
              bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", color: "#f1f5f9",
              fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" }, transition: "all 0.15s",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

/* ══ STEP 2 — Resources ══════════════════════════════════════════════════════ */
const Step2 = ({ data, setData }) => {
  const [ytError,   setYtError]   = useState("");
  const fileRef = useRef(null);

  const handleYtUrl = (val) => {
    setData(d => ({ ...d, youtubeUrl: val, youtubeId: extractYouTubeId(val) || "" }));
    setYtError(val && !extractYouTubeId(val) ? "Paste a valid YouTube URL (e.g. youtube.com/watch?v=…)" : "");
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = [...(e.dataTransfer?.files || e.target?.files || [])];
    setData(d => ({ ...d, files: [...(d.files || []), ...files] }));
  };

  const removeFile = (name) => setData(d => ({ ...d, files: (d.files || []).filter(f => f.name !== name) }));

  return (
    <Box>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#f1f5f9", mb: 0.5 }}>
        Add your resources
      </Typography>
      <Typography sx={{ color: "var(--text-dim)", fontSize: "0.84rem", mb: 2.5 }}>
        Attach a video, upload notes, or enable web search.
      </Typography>

      {/* YouTube URL */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.75 }}>
          YouTube Video
        </Typography>
        <Box sx={{ position: "relative" }}>
          <LinkRoundedIcon sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-dim)" }} />
          <Box
            component="input"
            placeholder="Paste YouTube URL…"
            value={data.youtubeUrl || ""}
            onChange={e => handleYtUrl(e.target.value)}
            sx={{
              width: "100%", pl: "40px", pr: 2, py: 1.25,
              bgcolor: "rgba(255,255,255,0.04)", border: `1px solid ${ytError ? "rgba(244,63,94,0.5)" : "var(--border)"}`,
              borderRadius: "var(--r-md)", color: "#f1f5f9",
              fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" }, transition: "all 0.15s",
            }}
          />
        </Box>
        {ytError && <Typography sx={{ fontSize: "0.7rem", color: "var(--rose)", mt: 0.5, ml: 0.5 }}>{ytError}</Typography>}
      </Box>

      {/* YouTube preview */}
      {data.youtubeId && (
        <Box sx={{ mb: 2.5, borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16/9", bgcolor: "#000" }}>
          <iframe
            src={`https://www.youtube.com/embed/${data.youtubeId}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; encrypted-media"
            title="Preview"
          />
        </Box>
      )}

      {/* File upload drop zone */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.75 }}>
          Study Materials
        </Typography>
        <Box
          onDrop={handleFileDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          sx={{
            border: "2px dashed rgba(99,102,241,0.25)", borderRadius: "var(--r-lg)",
            p: 3, textAlign: "center", cursor: "pointer", transition: "all 0.18s",
            bgcolor: "rgba(99,102,241,0.04)",
            "&:hover": { borderColor: "rgba(99,102,241,0.5)", bgcolor: "rgba(99,102,241,0.08)" },
          }}
        >
          <UploadFileRoundedIcon sx={{ fontSize: 28, color: "var(--indigo-lt)", mb: 0.75 }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-mid)" }}>
            Drop PDF or notes here
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mt: 0.25 }}>
            or click to browse
          </Typography>
          <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.docx,.md" hidden onChange={handleFileDrop} />
        </Box>

        {/* Attached files list */}
        {(data.files || []).length > 0 && (
          <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.6 }}>
            {(data.files || []).map(f => (
              <Box key={f.name} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, bgcolor: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                <AttachFileRoundedIcon sx={{ fontSize: 15, color: "var(--indigo-lt)" }} />
                <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)", flex: 1 }} noWrap>{f.name}</Typography>
                <Box onClick={() => removeFile(f.name)} sx={{ cursor: "pointer", color: "var(--text-dim)", "&:hover": { color: "var(--rose)" }, display: "flex" }}>
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Web search toggle */}
      <Box
        onClick={() => setData(d => ({ ...d, webSearch: !d.webSearch }))}
        sx={{
          display: "flex", alignItems: "center", gap: 1.5, p: "12px 16px",
          borderRadius: "var(--r-md)", cursor: "pointer",
          bgcolor: data.webSearch ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${data.webSearch ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
          transition: "all 0.18s",
        }}
      >
        <ManageSearchRoundedIcon sx={{ fontSize: 20, color: data.webSearch ? "var(--indigo-lt)" : "var(--text-dim)" }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: data.webSearch ? "#f1f5f9" : "var(--text-mid)" }}>Enable Web Search</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Fetch Wikipedia + Google summaries when session starts</Typography>
        </Box>
        <Box sx={{ width: 36, height: 20, borderRadius: "100px", bgcolor: data.webSearch ? "var(--indigo)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background 0.2s" }}>
          <Box sx={{ position: "absolute", top: 2, left: data.webSearch ? 18 : 2, width: 16, height: 16, borderRadius: "50%", bgcolor: "#fff", transition: "left 0.2s ease" }} />
        </Box>
      </Box>
    </Box>
  );
};

/* ══ STEP 3 — Session Config ══════════════════════════════════════════════════ */
const FEATURES_CONFIG = [
  { key: "gaming",     icon: SportsEsportsRoundedIcon, label: "Gaming Arena",  desc: "Brain-refresh games during break time",    accent: "#10b981" },
  { key: "chatbot",    icon: SmartToyRoundedIcon,      label: "AI Chatbot",   desc: "Ask questions related to your topic",      accent: "#6366f1" },
  { key: "notes",      icon: NoteAltRoundedIcon,       label: "Notes Pad",    desc: "Quick-capture notes during session",       accent: "#f59e0b" },
  { key: "webSearch",  icon: ManageSearchRoundedIcon,  label: "Web Search",   desc: "Wikipedia + Google inline search",         accent: "#3b82f6" },
  { key: "summarizer", icon: SummarizeRoundedIcon,     label: "Summarizer",   desc: "AI summary of materials & transcript",     accent: "#a78bfa" },
  { key: "focusLock",  icon: LockRoundedIcon,          label: "Focus Lock",   desc: "Block tab-switching during focus phase",   accent: "#f43f5e" },
];

const Step3 = ({ data, setData }) => (
  <Box>
    <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#f1f5f9", mb: 0.5 }}>
      Configure your session
    </Typography>
    <Typography sx={{ color: "var(--text-dim)", fontSize: "0.84rem", mb: 3 }}>
      Set durations, focus mode, and which tools to enable.
    </Typography>

    {/* Study duration */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Study Duration</Typography>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--indigo-lt)" }}>{data.totalMin} min</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        {[25, 45, 60, 90].map(m => (
          <Box
            key={m}
            onClick={() => setData(d => ({ ...d, totalMin: m }))}
            sx={{
              flex: 1, py: 0.75, borderRadius: "var(--r-md)", textAlign: "center",
              cursor: "pointer", fontWeight: 700, fontSize: "0.82rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              bgcolor: data.totalMin === m ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${data.totalMin === m ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: data.totalMin === m ? "#a5b4fc" : "var(--text-mid)",
              transition: "all 0.15s", "&:hover": { bgcolor: "rgba(99,102,241,0.1)" },
            }}
          >
            {m}m
          </Box>
        ))}
      </Box>
      <Slider size="small" min={10} max={180} step={5} value={data.totalMin}
        onChange={(_, v) => setData(d => ({ ...d, totalMin: v }))}
        sx={{ color: "var(--indigo)", "& .MuiSlider-thumb": { width: 14, height: 14 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
      />
    </Box>

    {/* Focus / Break intervals */}
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Focus Block</Typography>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--indigo-lt)" }}>{data.focusMin} min</Typography>
        </Box>
        <Slider size="small" min={5} max={60} step={5} value={data.focusMin}
          onChange={(_, v) => setData(d => ({ ...d, focusMin: v }))}
          sx={{ color: "var(--indigo)", "& .MuiSlider-thumb": { width: 12, height: 12 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Break</Typography>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--emerald)" }}>{data.breakMin} min</Typography>
        </Box>
        <Slider size="small" min={1} max={20} step={1} value={data.breakMin}
          onChange={(_, v) => setData(d => ({ ...d, breakMin: v }))}
          sx={{ color: "var(--emerald)", "& .MuiSlider-thumb": { width: 12, height: 12 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
        />
      </Box>
    </Box>

    {/* Focus mode */}
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>Focus Mode</Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {[
          { key: "standard", label: "Standard",    desc: "Regular Pomodoro cycles" },
          { key: "deep",     label: "Deep Focus",  desc: "No breaks until done"    },
        ].map(m => (
          <Box key={m.key} onClick={() => setData(d => ({ ...d, focusMode: m.key }))}
            sx={{
              flex: 1, p: "12px 16px", borderRadius: "var(--r-md)", cursor: "pointer",
              bgcolor: data.focusMode === m.key ? "rgba(99,102,241,0.13)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${data.focusMode === m.key ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.18s",
            }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: data.focusMode === m.key ? "#a5b4fc" : "var(--text-mid)" }}>{m.label}</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mt: 0.25 }}>{m.desc}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Session features */}
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
      Session Features
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {FEATURES_CONFIG.map(f => (
        <FeatureToggle key={f.key} {...f}
          checked={!!data.features?.[f.key]}
          onChange={() => setData(d => ({ ...d, features: { ...d.features, [f.key]: !d.features?.[f.key] } }))}
        />
      ))}
    </Box>
  </Box>
);

/* ══ Main CreateFocusSession ══════════════════════════════════════════════════ */
const CreateFocusSession = () => {
  const navigate = useNavigate();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [data, setData] = useState({
    subjectId: "", subjectName: "", topic: "",
    youtubeUrl: "", youtubeId: "", files: [], webSearch: false,
    totalMin: 45, focusMin: 25, breakMin: 5,
    focusMode: "standard",
    features: { gaming: true, chatbot: true, notes: true, webSearch: true, summarizer: true, focusLock: false },
  });

  const canNext = () => {
    if (step === 0) return !!data.subjectId && !!data.topic;
    if (step === 1) return true; // resources optional
    return true;
  };

  const handleStart = async () => {
    setError(""); setLoading(true);
    try {
      const ytId = data.youtubeId || (data.youtubeUrl ? extractYouTubeId(data.youtubeUrl) : null);
      
      // Save session/lecture to backend database
      let createdLecture = null;
      try {
        const lecturePayload = {
          title: `${data.subjectName}: ${data.topic}`,
          subject: data.subjectName,
          topic: data.topic,
          description: `Focus session on ${data.topic}`,
          video_ids: ytId ? [ytId] : [],
        };
        const lecRes = await lectureAPI.create(lecturePayload);
        createdLecture = lecRes?.data?.lecture;
      } catch (lecErr) {
        console.error("Failed to persist lecture to DB:", lecErr);
      }

      let finalVideoId = ytId;
      if (!finalVideoId && createdLecture?.video_ids) {
        let vIds = createdLecture.video_ids;
        if (typeof vIds === 'string') {
          try { vIds = JSON.parse(vIds); } catch {}
        }
        if (Array.isArray(vIds) && vIds.length > 0) {
          finalVideoId = vIds[0];
        }
      }

      const payload = {
        subject_focus: data.subjectName,
        subjectName: data.subjectName,
        topic: data.topic,
        youtube_url: data.youtubeUrl || (finalVideoId ? `https://www.youtube.com/watch?v=${finalVideoId}` : null),
        youtubeId: finalVideoId || "",
        youtube_id: finalVideoId || "",
        study_minutes: data.totalMin,
        focus_minutes: data.focusMin,
        break_minutes: data.breakMin,
        focus_mode: data.focusMode,
        features: data.features,
        lectureId: createdLecture?.id,
        files: data.files || []
      };

      const res = await focusAPI.lock(data.subjectName);
      localStorage.setItem("activeSession", JSON.stringify({ ...payload, sessionId: res?.data?.session_id }));
      navigate("/focus");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 680, mx: "auto", width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          New Focus Session
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          Lock in. Learn deep.
        </Typography>
      </Box>

      <StepBar step={step} />

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "var(--r-md)" }}>{error}</Alert>}

      {/* Step content */}
      <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: { xs: 2.5, md: 3 }, mb: 3, minHeight: 400 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && <Step1 data={data} setData={setData} />}
            {step === 1 && <Step2 data={data} setData={setData} />}
            {step === 2 && <Step3 data={data} setData={setData} />}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          sx={{
            borderColor: "var(--border)", color: "var(--text-mid)",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600,
            borderRadius: "var(--r-md)", px: 2.5,
            "&:hover": { borderColor: "var(--border-active)", color: "#f1f5f9" },
            "&.Mui-disabled": { opacity: 0.3 },
          }}
        >
          Back
        </Button>

        {step < 2 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            sx={{
              background: "var(--grad-primary)", fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700, borderRadius: "var(--r-md)", px: 3,
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
              "&.Mui-disabled": { opacity: 0.4 },
            }}
          >
            {step === 1 && !data.youtubeUrl && !data.files?.length ? "Skip & Continue" : "Continue"}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={loading ? null : <PlayArrowRoundedIcon />}
            onClick={handleStart}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700,
              borderRadius: "var(--r-md)", px: 3,
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
              "&:hover": { boxShadow: "0 8px 24px rgba(16,185,129,0.45)", transform: "translateY(-1px)" },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Start Session ⚡"}
          </Button>
        )}
      </Box>

      {/* Progress indicator */}
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={((step + 1) / 3) * 100}
          sx={{
            height: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.06)",
            "& .MuiLinearProgress-bar": { background: "var(--grad-primary)", transition: "all 0.4s ease" },
          }}
        />
      </Box>
    </Box>
  );
};

export default CreateFocusSession;

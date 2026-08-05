import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Slider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import PlayArrowRoundedIcon  from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon      from "@mui/icons-material/PauseRounded";
import StopRoundedIcon       from "@mui/icons-material/StopRounded";
import RefreshRoundedIcon    from "@mui/icons-material/RefreshRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import TimerRoundedIcon      from "@mui/icons-material/TimerRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon       from "@mui/icons-material/BoltRounded";

/* ── Format helpers ────────────────────────────────────────────────────────── */
const fmtTime = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* ── SVG circular progress ring ───────────────────────────────────────────── */
const CircleTimer = ({ pct, size = 220, strokeWidth = 10, color, children }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  return (
    <Box sx={{ position: "relative", width: size, height: size, mx: "auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease", filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      {/* Center content */}
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </Box>
    </Box>
  );
};

/* ── Control button ────────────────────────────────────────────────────────── */
const CtrlBtn = ({ icon: Icon, label, onClick, accent = "var(--indigo)", size = "md" }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
      cursor: "pointer",
    }}
  >
    <Box
      sx={{
        width: size === "lg" ? 56 : 44, height: size === "lg" ? 56 : 44,
        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: `${accent}18`, border: `2px solid ${accent}44`,
        transition: "all 0.18s",
        "&:hover": { bgcolor: `${accent}30`, borderColor: accent, transform: "scale(1.06)", boxShadow: `0 0 16px ${accent}44` },
      }}
    >
      <Icon sx={{ fontSize: size === "lg" ? 26 : 20, color: accent }} />
    </Box>
    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
      {label}
    </Typography>
  </Box>
);

/* ── Stats card ────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <Box sx={{
    flex: 1, px: 1.5, py: 1.25,
    bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: "var(--r-md)", textAlign: "center",
  }}>
    <Icon sx={{ fontSize: 18, color, mb: 0.5 }} />
    <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9" }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </Typography>
  </Box>
);

/* ══ ManageFocus (Focus Timer) ════════════════════════════════════════════════ */
const ManageFocus = () => {
  const [phase,      setPhase]      = useState("idle");   // idle | focus | break
  const [studyMin,   setStudyMin]   = useState(25);
  const [breakMin,   setBreakMin]   = useState(5);
  const [remaining,  setRemaining]  = useState(25 * 60);
  const [sessionCnt, setSessionCnt] = useState(0);
  const [totalFocusSec, setTotalFocusSec] = useState(0);
  const intervalRef = useRef(null);
  const focusTickRef = useRef(null);

  const isRunning = phase !== "idle";
  const accent    = phase === "break" ? "#10b981" : "#6366f1";
  const total     = (phase === "break" ? breakMin : studyMin) * 60;
  const pct       = phase === "idle" ? 0 : Math.min(100, ((total - remaining) / total) * 100);

  const startTimer = () => {
    if (phase === "idle") {
      setPhase("focus");
      setRemaining(studyMin * 60);
    }
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setPhase(p => {
            const next = p === "focus" ? "break" : "focus";
            if (next === "focus") setSessionCnt(c => c + 1);
            setRemaining((next === "focus" ? studyMin : breakMin) * 60);
            return next;
          });
          return 0;
        }
        if (phase === "focus") setTotalFocusSec(t => t + 1);
        return r - 1;
      });
    }, 1000);
  };

  const pause = () => clearInterval(intervalRef.current);

  const stop = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setRemaining(studyMin * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setRemaining(studyMin * 60);
    setSessionCnt(0);
    setTotalFocusSec(0);
  };

  // Update remaining when sliders change in idle
  useEffect(() => {
    if (phase === "idle") setRemaining(studyMin * 60);
  }, [studyMin, phase]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const phaseLabel = phase === "idle" ? "Ready" : phase === "focus" ? "FOCUS" : "BREAK";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 520, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
          Focus Timer
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          Pomodoro-style deep work sessions
        </Typography>
      </Box>

      {/* Main timer card */}
      <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", p: 3.5, mb: 2.5, textAlign: "center" }}>

        {/* Phase badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.25, py: 0.4, borderRadius: "100px", bgcolor: `${accent}18`, border: `1px solid ${accent}44`, mb: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent, ...(isRunning && { animation: "pulse-ring 1.5s infinite" }) }} />
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {phaseLabel}
              </Typography>
              {sessionCnt > 0 && (
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace" }}>
                  #{sessionCnt + 1}
                </Typography>
              )}
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Circular ring */}
        <CircleTimer pct={pct} color={accent}>
          <Typography sx={{
            fontFamily: "JetBrains Mono, monospace", fontWeight: 900,
            fontSize: "2.8rem", color: "#f1f5f9", lineHeight: 1,
            letterSpacing: "-0.03em",
          }}>
            {fmtTime(phase === "idle" ? studyMin * 60 : remaining)}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", mt: 0.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {phase === "break" ? `${breakMin} min break` : `${studyMin} min study`}
          </Typography>
        </CircleTimer>

        {/* Controls */}
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, mt: 3 }}>
          <CtrlBtn icon={StopRoundedIcon}  label="Stop"  onClick={stop}  accent="#f43f5e" />
          {!isRunning
            ? <CtrlBtn icon={PlayArrowRoundedIcon} label="Start"  onClick={startTimer} accent={accent} size="lg" />
            : <CtrlBtn icon={PauseRoundedIcon}     label="Pause"  onClick={pause}      accent={accent} size="lg" />
          }
          {isRunning
            ? <CtrlBtn icon={PlayArrowRoundedIcon} label="Resume" onClick={startTimer} accent="var(--emerald)" />
            : <CtrlBtn icon={RefreshRoundedIcon}   label="Reset"  onClick={reset}      accent="var(--text-dim)" />
          }
        </Box>
      </Box>

      {/* Duration config */}
      <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 2.5, mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
          Session Lengths
        </Typography>

        {/* Study duration */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-mid)" }}>Study Duration</Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--indigo-lt)" }}>{studyMin} min</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.75, mb: 1 }}>
            {[15, 25, 45, 60].map(m => (
              <Box
                key={m}
                onClick={() => { if (phase === "idle") setStudyMin(m); }}
                sx={{
                  flex: 1, py: 0.6, textAlign: "center", borderRadius: "var(--r-sm)",
                  cursor: phase === "idle" ? "pointer" : "not-allowed", fontWeight: 700,
                  fontSize: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                  bgcolor: studyMin === m ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${studyMin === m ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                  color: studyMin === m ? "#a5b4fc" : "var(--text-dim)",
                  opacity: phase !== "idle" ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {m}m
              </Box>
            ))}
          </Box>
          <Slider
            size="small" min={5} max={90} step={5}
            value={studyMin}
            onChange={(_, v) => { if (phase === "idle") setStudyMin(v); }}
            disabled={phase !== "idle"}
            sx={{ color: "var(--indigo)", "& .MuiSlider-thumb": { width: 13, height: 13 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
          />
        </Box>

        {/* Break duration */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-mid)" }}>Break Duration</Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--emerald)" }}>{breakMin} min</Typography>
          </Box>
          <Slider
            size="small" min={1} max={30} step={1}
            value={breakMin}
            onChange={(_, v) => setBreakMin(v)}
            sx={{ color: "var(--emerald)", "& .MuiSlider-thumb": { width: 13, height: 13 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
          />
        </Box>
      </Box>

      {/* Today's stats */}
      <Box sx={{ display: "flex", gap: 1.25 }}>
        <StatCard icon={TimerRoundedIcon}       label="Focus Time"  value={`${Math.floor(totalFocusSec / 60)}m`} color="var(--indigo-lt)" />
        <StatCard icon={CheckCircleRoundedIcon} label="Sessions"    value={sessionCnt}                           color="var(--emerald)"  />
        <StatCard icon={LocalFireDepartmentRoundedIcon} label="Streak"  value="🔥 —"                            color="var(--amber)"    />
        <StatCard icon={BoltRoundedIcon}        label="XP Today"    value={sessionCnt * 30}                      color="var(--amber)"    />
      </Box>
    </Box>
  );
};

export default ManageFocus;

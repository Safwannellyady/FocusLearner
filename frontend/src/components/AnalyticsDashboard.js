import React, { useState, useEffect } from "react";
import { Box, Typography, LinearProgress, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { analyticsAPI } from "../services/api";

import BoltRoundedIcon         from "@mui/icons-material/BoltRounded";
import AccessTimeRoundedIcon   from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon   from "@mui/icons-material/TrendingUpRounded";
import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";

/* ── Demo fallback data ─────────────────────────────────────────────────────── */
const DEMO_STATS = {
  total_sessions: 23,
  total_minutes:  840,
  xp:             1430,
  streak:         5,
  completed:      18,
  avg_per_day:    42,
};

const DEMO_WEEKLY = [
  { day: "Mon", min: 45 },
  { day: "Tue", min: 30 },
  { day: "Wed", min: 60 },
  { day: "Thu", min: 25 },
  { day: "Fri", min: 90 },
  { day: "Sat", min: 55 },
  { day: "Sun", min: 20 },
];

const DEMO_SUBJECTS = [
  { name: "Computer Science", min: 320, color: "#6366f1" },
  { name: "Data Science & AI",min: 240, color: "#ec4899" },
  { name: "Neurosciences",    min: 150, color: "#a78bfa" },
  { name: "Chemistry",        min: 90,  color: "#10b981" },
  { name: "Physics",          min: 40,  color: "#3b82f6" },
];

/* ── Stat card ──────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
    <Box sx={{
      p: 2, bgcolor: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--r-lg)", display: "flex", flexDirection: "column", gap: 1.25,
      transition: "all 0.2s", "&:hover": { borderColor: `${color}44`, boxShadow: `0 6px 24px ${color}18` },
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-sm)", bgcolor: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
      <Box>
        <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 900, fontSize: "1.5rem", color: "#f1f5f9", lineHeight: 1 }}>
          {value}
        </Typography>
        {sub && <Typography sx={{ fontSize: "0.7rem", color: "var(--text-dim)", mt: 0.25 }}>{sub}</Typography>}
      </Box>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

/* ── Weekly bar chart ───────────────────────────────────────────────────────── */
const WeeklyChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.min), 1);
  const today = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

  return (
    <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>
            This Week
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Daily study minutes</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.1, py: 0.4, bgcolor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "100px" }}>
          <TrendingUpRoundedIcon sx={{ fontSize: 13, color: "var(--indigo-lt)" }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--indigo-lt)" }}>
            {data.reduce((a, b) => a + b.min, 0)} min total
          </Typography>
        </Box>
      </Box>

      {/* Bars */}
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 130 }}>
        {data.map((d, i) => {
          const h = Math.round((d.min / max) * 100);
          const isToday = d.day === today;
          return (
            <Box key={d.day} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, height: "100%", justifyContent: "flex-end" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: isToday ? "var(--indigo-lt)" : "var(--text-dim)" }}>
                {d.min > 0 ? `${d.min}m` : ""}
              </Typography>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: "easeOut" }}
                style={{ width: "100%", borderRadius: "6px 6px 4px 4px", minHeight: 4 }}
              >
                <Box sx={{
                  width: "100%", height: "100%", minHeight: 4,
                  borderRadius: "6px 6px 4px 4px",
                  background: isToday ? "var(--grad-primary)" : "rgba(99,102,241,0.25)",
                  boxShadow: isToday ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                  transition: "background 0.2s",
                }} />
              </motion.div>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: isToday ? 800 : 600, color: isToday ? "#f1f5f9" : "var(--text-dim)" }}>
                {d.day}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/* ── Subject breakdown ──────────────────────────────────────────────────────── */
const SubjectBreakdown = ({ data }) => {
  const total = data.reduce((a, b) => a + b.min, 0);

  return (
    <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 2.5 }}>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9", mb: 0.25 }}>
        Subject Breakdown
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mb: 2.5 }}>All-time study distribution</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
        {data.map((s, i) => {
          const pct = Math.round((s.min / total) * 100);
          return (
            <Box key={s.name}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-mid)" }}>{s.name}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{s.min} min</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: s.color }}>{pct}%</Typography>
                </Box>
              </Box>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6, borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.05)",
                    "& .MuiLinearProgress-bar": { bgcolor: s.color, borderRadius: 4 },
                  }}
                />
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/* ── Heatmap (last 30 days) ─────────────────────────────────────────────────── */
const Heatmap = () => {
  // Generate 30 fake day values for demo
  const days = Array.from({ length: 30 }, (_, i) => {
    const v = Math.random();
    return v < 0.2 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3;
  });
  const intensities = ["rgba(255,255,255,0.04)", "rgba(99,102,241,0.25)", "rgba(99,102,241,0.55)", "var(--indigo)"];

  return (
    <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 2.5 }}>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9", mb: 0.25 }}>
        Activity Heat Map
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mb: 2 }}>Last 30 days</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 0.6 }}>
        {days.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
          >
            <Box
              title={`Day ${i + 1}: Level ${v}`}
              sx={{
                width: "100%", aspectRatio: "1", borderRadius: "4px",
                bgcolor: intensities[v],
                boxShadow: v === 3 ? "0 0 6px rgba(99,102,241,0.5)" : "none",
                transition: "all 0.15s",
                "&:hover": { transform: "scale(1.2)", cursor: "default" },
              }}
            />
          </motion.div>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, justifyContent: "flex-end" }}>
        <Typography sx={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Less</Typography>
        {intensities.map((c, i) => (
          <Box key={i} sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: c, border: "1px solid rgba(255,255,255,0.06)" }} />
        ))}
        <Typography sx={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>More</Typography>
      </Box>
    </Box>
  );
};

/* ══ AnalyticsDashboard (main) ════════════════════════════════════════════════ */
const AnalyticsDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [weekly,  setWeekly]  = useState(DEMO_WEEKLY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsAPI.getStats();
        setStats(res?.data || DEMO_STATS);
      } catch {
        setStats(DEMO_STATS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <CircularProgress size={36} sx={{ color: "var(--indigo)" }} />
    </Box>
  );

  const s = stats || DEMO_STATS;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
          Analytics
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          Your study performance at a glance.
        </Typography>
      </Box>

      {/* Stats grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(6,1fr)" }, gap: 1.5, mb: 2.5 }}>
        <StatCard icon={AccessTimeRoundedIcon}              label="Total Focus"  value={`${Math.floor(s.total_minutes / 60)}h ${s.total_minutes % 60}m`} sub="all-time"            color="#6366f1" delay={0}    />
        <StatCard icon={CalendarMonthRoundedIcon}            label="Sessions"     value={s.total_sessions}                                                 sub="completed"          color="#a78bfa" delay={0.05} />
        <StatCard icon={BoltRoundedIcon}                     label="Total XP"     value={s.xp}                                                             sub="points earned"      color="#fbbf24" delay={0.1}  />
        <StatCard icon={LocalFireDepartmentRoundedIcon}      label="Streak"       value={`${s.streak}d`}                                                   sub="current streak"     color="#f43f5e" delay={0.15} />
        <StatCard icon={TrendingUpRoundedIcon}               label="Daily Avg"    value={`${s.avg_per_day}m`}                                              sub="minutes/day"        color="#10b981" delay={0.2}  />
        <StatCard icon={EmojiEventsRoundedIcon}              label="Completed"    value={s.completed}                                                      sub="sessions done"      color="#f59e0b" delay={0.25} />
      </Box>

      {/* Charts row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
        <WeeklyChart data={weekly} />
        <SubjectBreakdown data={DEMO_SUBJECTS} />
      </Box>

      {/* Heatmap full width */}
      <Heatmap />
    </Box>
  );
};

export default AnalyticsDashboard;

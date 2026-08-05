import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Chip, CircularProgress, Alert,
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import AutoStoriesIcon         from "@mui/icons-material/AutoStories";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon    from "@mui/icons-material/ShowChartRounded";
import TimerRoundedIcon        from "@mui/icons-material/TimerRounded";
import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import FlashOnRoundedIcon      from "@mui/icons-material/FlashOnRounded";
import SchoolRoundedIcon       from "@mui/icons-material/SchoolRounded";
import TrendingUpIcon          from "@mui/icons-material/TrendingUp";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import BoltIcon                from "@mui/icons-material/Bolt";

import { focusAPI, analyticsAPI } from "../services/api";

/* ── Animation variants ───────────────────────────────────────────────────── */
const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
  },
};

/* ── Stat Card ────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent = "var(--indigo)", sub }) => (
  <Box
    className="stat-card anim-fade-up"
    sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, minHeight: 110 }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box
        className="icon-box icon-box-sm"
        sx={{ bgcolor: `${accent}22`, color: accent }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      {sub && (
        <Typography sx={{ fontSize: "0.68rem", color: "var(--emerald)", fontWeight: 700 }}>
          {sub}
        </Typography>
      )}
    </Box>
    <Typography sx={{ fontSize: "1.65rem", fontWeight: 800, fontFamily: "Outfit, sans-serif", lineHeight: 1, color: "#f1f5f9" }}>
      {value ?? "—"}
    </Typography>
    <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>
      {label}
    </Typography>
  </Box>
);

/* ── Quick Action Card ────────────────────────────────────────────────────── */
const ActionCard = ({ icon: Icon, label, description, accent, onClick, badge }) => (
  <motion.div variants={stagger.item} style={{ height: "100%" }}>
    <Box
      className="action-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${label} - ${description}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      sx={{ height: "100%", minWidth: 0, minHeight: 130 }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box
          className="icon-box icon-box-md"
          sx={{ bgcolor: `${accent}22`, color: accent, borderRadius: "var(--r-md)" }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{ height: 20, fontSize: "0.6rem", fontWeight: 700,
              bgcolor: "rgba(245,158,11,0.15)", color: "#fbbf24",
              border: "1px solid rgba(245,158,11,0.3)" }}
          />
        )}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#f1f5f9", mb: 0.4 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.77rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [session,  setSession]  = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const userStr = localStorage.getItem("user");
  let user = { username: "Learner", full_name: "" };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const firstName = (user?.full_name || user?.username || "Learner").split(" ")[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessRes, statsRes] = await Promise.allSettled([
        focusAPI.getCurrent(),
        analyticsAPI.getSummary(),
      ]);
      if (sessRes.status === "fulfilled")  setSession(sessRes.value?.data?.session || null);
      if (statsRes.status === "fulfilled") setStats(statsRes.value?.data || null);
    } catch (e) {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const quickActions = [
    {
      icon:        AutoStoriesIcon,
      label:       "New Focus Session",
      description: "Lock in on a subject and start a distraction-free study block.",
      accent:      "var(--indigo)",
      onClick:     () => navigate("/courses"),
    },
    {
      icon:        SportsEsportsRoundedIcon,
      label:       "Game Lab",
      description: "Reinforce concepts through interactive engineering challenges.",
      accent:      "var(--emerald)",
      onClick:     () => navigate("/games"),
      badge:       "XP",
    },
    {
      icon:        ShowChartRoundedIcon,
      label:       "Analytics",
      description: "Track streaks, study time, and mastery across all subjects.",
      accent:      "var(--blue)",
      onClick:     () => navigate("/analytics"),
    },
    {
      icon:        FlashOnRoundedIcon,
      label:       "Focus Studio",
      description: "Instantly activate a Pomodoro-style focus lock session.",
      accent:      "var(--amber)",
      onClick:     () => navigate("/focus"),
    },
    {
      icon:        EmojiEventsRoundedIcon,
      label:       "Badges",
      description: "View earned achievements and milestones in your journey.",
      accent:      "#a78bfa",
      onClick:     () => navigate("/badges"),
    },
    {
      icon:        SchoolRoundedIcon,
      label:       "My Sessions",
      description: "Resume or review all your previous focus sessions.",
      accent:      "#34d399",
      onClick:     () => navigate("/my-courses"),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto", width: "100%" }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }} className="anim-fade-up">
        <Typography
          sx={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize:   { xs: "1.5rem", md: "1.8rem" },
            letterSpacing: "-0.03em",
            color: "#f1f5f9",
            lineHeight: 1.1,
          }}
        >
          {getGreeting()}, {firstName} 👋
        </Typography>
        <Typography sx={{ color: "var(--text-mid)", fontSize: "0.85rem", mt: 0.5, fontWeight: 500 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Typography>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: "var(--r-md)" }}>{error}</Alert>}

      {/* ── Active session banner ── */}
      {session && (
        <Box
          className="anim-fade-up"
          onClick={() => navigate("/manage-focus")}
          sx={{
            mb: 3,
            p: "1rem 1.5rem",
            borderRadius: "var(--r-lg)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.1) 100%)",
            border: "1px solid rgba(99,102,241,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            transition: "all 0.18s",
            "&:hover": { borderColor: "rgba(99,102,241,0.6)", transform: "translateY(-1px)" },
          }}
        >
          <Box className="pulse-dot pulse-dot-indigo" />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#a5b4fc" }}>
              Active Focus Session
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
              {session.subject || "Study session in progress"} · Click to manage
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Chip
              label="LIVE"
              size="small"
              sx={{ bgcolor: "rgba(99,102,241,0.2)", color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.4)", fontWeight: 800, fontSize: "0.62rem" }}
            />
          </Box>
        </Box>
      )}

      {/* ── Stats row ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} sx={{ color: "var(--indigo)" }} />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: LocalFireDepartmentIcon, label: "Day Streak",    value: stats?.streak_days ?? user?.streak_days ?? 0, accent: "var(--amber)",   sub: "🔥" },
            { icon: TimerRoundedIcon,        label: "Hours Studied",  value: stats?.total_hours != null ? `${stats.total_hours}h` : "0h", accent: "var(--indigo)" },
            { icon: TrendingUpIcon,          label: "Sessions Done",  value: stats?.total_sessions ?? 0,                accent: "var(--emerald)" },
            { icon: BoltIcon,               label: "XP Earned",      value: stats?.total_xp ?? 0,                      accent: "var(--amber)",   sub: stats?.today_xp > 0 ? `+${stats.today_xp} today` : undefined },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Quick actions ── */}
      <Box sx={{ mb: 2 }}>
        <Typography className="section-label" sx={{ mb: 1.5 }}>
          Quick Actions
        </Typography>
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          <Grid container spacing={2}>
            {quickActions.map((a) => (
              <Grid item xs={12} sm={6} md={4} key={a.label}>
                <ActionCard {...a} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

    </Box>
  );
};

export default Dashboard;

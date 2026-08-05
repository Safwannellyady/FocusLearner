import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, Tooltip, IconButton, Slider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useFocusTimer } from "../../context/FocusContext";
import { motion, AnimatePresence } from "framer-motion";

import MenuRoundedIcon          from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import FlashOnRoundedIcon       from "@mui/icons-material/FlashOnRounded";
import KeyboardArrowDownIcon    from "@mui/icons-material/KeyboardArrowDown";
import TimerRoundedIcon         from "@mui/icons-material/TimerRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon     from "@mui/icons-material/ShowChartRounded";
import EmojiEventsRoundedIcon   from "@mui/icons-material/EmojiEventsRounded";
import TrendingUpRoundedIcon    from "@mui/icons-material/TrendingUpRounded";
import SettingsRoundedIcon      from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon        from "@mui/icons-material/LogoutRounded";
import HubRoundedIcon           from "@mui/icons-material/HubRounded";
import PlayArrowRoundedIcon     from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon         from "@mui/icons-material/PauseRounded";
import StopRoundedIcon          from "@mui/icons-material/StopRounded";
import AutoStoriesIcon          from "@mui/icons-material/AutoStories";

/* ── Route → page title ─────────────────────────────────────────────────── */
const PAGE_TITLES = {
  "/dashboard": "Dashboard", "/courses": "New Session", "/my-courses": "My Sessions",
  "/manage-focus": "Focus Timer", "/games": "Game Lab", "/analytics": "Analytics",
  "/badges": "Badges", "/preferences": "Settings", "/focus": "Focus Studio",
  "/arena": "Focus Arena", "/progress": "Progress", "/knowledge-graph": "Knowledge Graph",
};

/* ── Primary nav links (always visible in center) ───────────────────────── */
const PRIMARY_LINKS = [
  { label: "Dashboard",   path: "/dashboard" },
  { label: "My Sessions", path: "/my-courses" },
];

/* ── "More" dropdown items ──────────────────────────────────────────────── */
const MORE_ITEMS = [
  { label: "Focus Timer",   icon: TimerRoundedIcon,          path: "/manage-focus" },
  { label: "Game Lab",      icon: SportsEsportsRoundedIcon,  path: "/games"        },
  { label: "Analytics",     icon: ShowChartRoundedIcon,      path: "/analytics"    },
  { label: "My Progress",   icon: TrendingUpRoundedIcon,     path: "/progress"     },
  { label: "Badges",        icon: EmojiEventsRoundedIcon,    path: "/badges"       },
  { label: "Knowledge Map", icon: HubRoundedIcon,            path: "/knowledge-graph" },
];

/* ── Profile dropdown items ─────────────────────────────────────────────── */
const PROFILE_ITEMS = [
  { label: "Profile & Settings", icon: SettingsRoundedIcon, path: "/preferences" },
];

const fmt = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* ── Generic floating dropdown panel ───────────────────────────────────── */
const DropdownPanel = ({ children, onClose, right = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <Box ref={ref} sx={{
      position: "absolute", top: "calc(100% + 8px)",
      ...(right ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
      minWidth: 190,
      bgcolor: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--r-lg)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
      py: 0.75, zIndex: 1300, backdropFilter: "blur(20px)", overflow: "hidden",
    }}>
      {children}
    </Box>
  );
};

/* ── Quick Focus inline panel ───────────────────────────────────────────── */
const QuickFocusPanel = ({ onClose }) => {

  const ref = useRef(null);
  const [phase,     setPhase]    = useState("idle");   // idle | focus | break
  const [studyMin,  setStudyMin] = useState(25);
  const [breakMin,  setBreakMin] = useState(5);
  const [remaining, setRemaining]= useState(25 * 60);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const start = () => {
    setPhase("focus");
    setRemaining(studyMin * 60);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          // switch phase
          setPhase(p => {
            const next = p === "focus" ? "break" : "focus";
            setRemaining(next === "focus" ? studyMin * 60 : breakMin * 60);
            return next;
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const pause  = () => clearInterval(intervalRef.current);
  const stop   = () => { clearInterval(intervalRef.current); setPhase("idle"); setRemaining(studyMin * 60); };
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const total   = phase === "break" ? breakMin * 60 : studyMin * 60;
  const pct     = phase === "idle"  ? 0 : ((total - remaining) / total) * 100;
  const accent  = phase === "break" ? "#10b981" : "#6366f1";

  return (
    <Box ref={ref} sx={{
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      width: 280, bgcolor: "var(--bg-card)",
      border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.6)", zIndex: 1300,
      backdropFilter: "blur(24px)", overflow: "hidden",
    }}>
      {/* Accent top bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg,${accent},transparent)`, transition: "background 0.4s" }} />

      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", mb: 0.4 }}>
          ⚡ Quick Focus
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mb: 2.5 }}>
          {phase === "idle" ? "Configure and start your session" : phase === "focus" ? "Focus phase — stay locked in" : "Break phase — rest your mind"}
        </Typography>

        {/* Big timer */}
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: "3rem", fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em", transition: "color 0.4s" }}>
            {fmt(phase === "idle" ? studyMin * 60 : remaining)}
          </Typography>
          {phase !== "idle" && (
            <Box sx={{ mt: 1.5, height: 4, bgcolor: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: accent, borderRadius: 4, transition: "width 1s linear, background 0.4s" }} />
            </Box>
          )}
          {phase !== "idle" && (
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: accent, mt: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {phase === "focus" ? "FOCUS" : "BREAK"}
            </Typography>
          )}
        </Box>

        {/* Duration sliders (only in idle) */}
        {phase === "idle" && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Study</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--indigo-lt)", fontWeight: 700 }}>{studyMin} min</Typography>
            </Box>
            <Slider size="small" min={5} max={90} step={5} value={studyMin} onChange={(_, v) => { setStudyMin(v); setRemaining(v * 60); }}
              sx={{ color: "var(--indigo)", "& .MuiSlider-thumb": { width: 12, height: 12 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Break</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--emerald)", fontWeight: 700 }}>{breakMin} min</Typography>
            </Box>
            <Slider size="small" min={1} max={30} step={1} value={breakMin} onChange={(_, v) => setBreakMin(v)}
              sx={{ color: "var(--emerald)", "& .MuiSlider-thumb": { width: 12, height: 12 }, "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.08)" } }}
            />
          </Box>
        )}

        {/* Controls */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {phase === "idle" ? (
            <Box onClick={start} sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, py: 1, borderRadius: "var(--r-md)", background: "var(--grad-primary)", cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", "&:hover": { boxShadow: "0 6px 20px rgba(99,102,241,0.5)", transform: "translateY(-1px)" }, transition: "all 0.15s" }}>
              <PlayArrowRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Start Session</Typography>
            </Box>
          ) : (
            <>
              <Box onClick={pause} sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 0.85, borderRadius: "var(--r-md)", bgcolor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", cursor: "pointer", "&:hover": { bgcolor: "rgba(99,102,241,0.2)" }, transition: "all 0.15s" }}>
                <PauseRoundedIcon sx={{ fontSize: 17, color: "var(--indigo-lt)" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--indigo-lt)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Pause</Typography>
              </Box>
              <Box onClick={start} sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 0.85, borderRadius: "var(--r-md)", bgcolor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer", "&:hover": { bgcolor: "rgba(16,185,129,0.2)" }, transition: "all 0.15s" }}>
                <PlayArrowRoundedIcon sx={{ fontSize: 17, color: "var(--emerald)" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--emerald)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Resume</Typography>
              </Box>
              <Box onClick={stop} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, borderRadius: "var(--r-md)", bgcolor: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", cursor: "pointer", "&:hover": { bgcolor: "rgba(244,63,94,0.18)" }, transition: "all 0.15s" }}>
                <StopRoundedIcon sx={{ fontSize: 17, color: "var(--rose)" }} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};


/* ── Dropdown menu item ─────────────────────────────────────────────────── */
const DropItem = ({ icon: Icon, label, active, onClick, danger }) => (
  <Box
    onClick={onClick}
    sx={{
      display:    "flex",
      alignItems: "center",
      gap:        1.25,
      px:         1.5,
      py:         0.75,
      cursor:     "pointer",
      color:      danger ? "rgba(244,63,94,0.8)" : active ? "#a5b4fc" : "var(--text-mid)",
      bgcolor:    active ? "rgba(99,102,241,0.1)" : "transparent",
      transition: "all 0.12s",
      "&:hover":  { bgcolor: danger ? "rgba(244,63,94,0.08)" : "rgba(255,255,255,0.06)", color: danger ? "#fb7185" : "#f1f5f9" },
    }}
  >
    {Icon && <Icon sx={{ fontSize: 16, flexShrink: 0 }} />}
    <Typography sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500, fontSize: "0.84rem", whiteSpace: "nowrap" }}>
      {label}
    </Typography>
    {active && <Box sx={{ ml: "auto", width: 5, height: 5, borderRadius: "50%", bgcolor: "var(--indigo)" }} />}
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const Navbar = ({ onMenuClick, onCmdClick }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { timeLeft, isStudying, timerActive } = useFocusTimer();

  const [moreOpen,       setMoreOpen]       = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [quickFocusOpen, setQuickFocusOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || "FocusLearner";

  const userStr = localStorage.getItem("user");
  let user = { username: "User", full_name: "" };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const initials    = (user?.full_name || user?.username || "FL").substring(0, 2).toUpperCase();
  const displayName = user?.full_name || user?.username || "User";

  // Is any "More" item the current active route?
  const moreHasActive = MORE_ITEMS.some(i => location.pathname.startsWith(i.path));

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const goTo = (path) => { navigate(path); setMoreOpen(false); setProfileOpen(false); };

  return (
    <Box
      component="header"
      sx={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        height:         60,
        px:             { xs: 2, md: 3 },
        flexShrink:     0,
        bgcolor:        "rgba(15,22,35,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom:   "1px solid var(--border)",
        position:       "sticky",
        top:            0,
        zIndex:         1100,
        gap:            2,
        minWidth:       0,
      }}
    >
      {/* ── Left: hamburger + page title ───────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <IconButton
          size="small" onClick={onMenuClick}
          sx={{ display: { md: "none" }, color: "var(--text-mid)", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
        >
          <MenuRoundedIcon fontSize="small" />
        </IconButton>
        <Typography sx={{
          fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.98rem",
          color: "#f1f5f9", letterSpacing: "-0.01em", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {pageTitle}
        </Typography>
      </Box>

      {/* ── Center: primary links + More dropdown ──────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
        {PRIMARY_LINKS.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <Box
              key={path}
              onClick={() => goTo(path)}
              sx={{
                px: 1.4, py: 0.6,
                borderRadius: "var(--r-md)",
                cursor:       "pointer",
                bgcolor:      active ? "rgba(99,102,241,0.13)" : "transparent",
                border:       `1px solid ${active ? "rgba(99,102,241,0.32)" : "transparent"}`,
                color:        active ? "#a5b4fc" : "var(--text-mid)",
                transition:   "all 0.15s",
                "&:hover":    { bgcolor: "rgba(255,255,255,0.05)", color: "#f1f5f9" },
              }}
            >
              <Typography sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: active ? 700 : 500, fontSize: "0.845rem", color: "inherit" }}>
                {label}
              </Typography>
            </Box>
          );
        })}

        {/* More dropdown trigger */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() => { setMoreOpen(p => !p); setProfileOpen(false); }}
            sx={{
              display:    "flex",
              alignItems: "center",
              gap:        0.4,
              px:         1.4, py: 0.6,
              borderRadius: "var(--r-md)",
              cursor:     "pointer",
              bgcolor:    moreOpen || moreHasActive ? "rgba(99,102,241,0.13)" : "transparent",
              border:     `1px solid ${moreOpen || moreHasActive ? "rgba(99,102,241,0.32)" : "transparent"}`,
              color:      moreOpen || moreHasActive ? "#a5b4fc" : "var(--text-mid)",
              transition: "all 0.15s",
              "&:hover":  { bgcolor: "rgba(255,255,255,0.05)", color: "#f1f5f9" },
            }}
          >
            <Typography sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500, fontSize: "0.845rem", color: "inherit" }}>
              More
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 15, transition: "transform 0.2s", transform: moreOpen ? "rotate(180deg)" : "none" }} />
          </Box>

          {moreOpen && (
            <DropdownPanel onClose={() => setMoreOpen(false)}>
              {MORE_ITEMS.map(item => (
                <DropItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname.startsWith(item.path)}
                  onClick={() => goTo(item.path)}
                />
              ))}
            </DropdownPanel>
          )}
        </Box>
      </Box>

      {/* ── Right: search, focus launch, avatar dropdown ────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        {/* Focus timer pill */}
        {timerActive && (
          <Tooltip title="Manage focus timer">
            <Box
              onClick={() => goTo("/manage-focus")}
              sx={{
                display:    "flex", alignItems: "center", gap: 0.75,
                px: 1.25, py: 0.5, borderRadius: "100px", cursor: "pointer",
                bgcolor:    isStudying ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)",
                border:     `1px solid ${isStudying ? "rgba(99,102,241,0.4)" : "rgba(16,185,129,0.4)"}`,
                transition: "all 0.15s",
                "&:hover":  { transform: "translateY(-1px)" },
              }}
            >
              <Box className={`pulse-dot ${isStudying ? "pulse-dot-indigo" : "pulse-dot-emerald"}`} />
              <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem", fontWeight: 700, color: isStudying ? "#a5b4fc" : "#34d399", letterSpacing: "0.04em" }}>
                {isStudying ? "Focus" : "Break"} {fmt(timeLeft)}
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Search / Command palette */}
        <Tooltip title="Command palette (Ctrl+K)">
          <Box
            onClick={onCmdClick}
            sx={{
              display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.75,
              px: 1.1, py: 0.5, borderRadius: "var(--r-md)",
              bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-dim)", fontSize: "0.78rem",
              fontFamily: "Plus Jakarta Sans, sans-serif", transition: "all 0.15s",
              "&:hover": { borderColor: "var(--border-active)", color: "var(--indigo-lt)" },
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 14 }} />
            <Box sx={{ px: 0.5, py: 0.1, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.07)", fontSize: "0.62rem", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--text-mid)" }}>
              ⌘K
            </Box>
          </Box>
        </Tooltip>

        {/* Focus quick-launch — inline panel */}
        <Box sx={{ position: "relative" }}>
          <Tooltip title="Quick focus session">
            <IconButton
              size="small"
              onClick={() => { setQuickFocusOpen(p => !p); setMoreOpen(false); setProfileOpen(false); }}
              sx={{
                color: quickFocusOpen ? "#fff" : "var(--indigo-lt)",
                bgcolor: quickFocusOpen ? "var(--indigo)" : "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                width: 32, height: 32, borderRadius: "var(--r-sm)",
                transition: "all 0.15s",
                "&:hover": { bgcolor: "rgba(99,102,241,0.22)", borderColor: "rgba(99,102,241,0.5)" },
              }}
            >
              <FlashOnRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {quickFocusOpen && <QuickFocusPanel onClose={() => setQuickFocusOpen(false)} />}
        </Box>

        {/* Avatar + profile dropdown */}
        <Box sx={{ position: "relative" }}>
          <Tooltip title="Account">
            <Avatar
              onClick={() => { setProfileOpen(p => !p); setMoreOpen(false); }}
              sx={{
                width: 32, height: 32, fontSize: "0.7rem", fontWeight: 700,
                background: "var(--grad-primary)", cursor: "pointer",
                border: `2px solid ${profileOpen ? "var(--indigo)" : "rgba(255,255,255,0.1)"}`,
                transition: "all 0.15s",
                "&:hover": { borderColor: "var(--indigo)", boxShadow: "0 0 10px rgba(99,102,241,0.35)" },
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>

          {profileOpen && (
            <DropdownPanel onClose={() => setProfileOpen(false)}>
              {/* User info header */}
              <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid var(--border)", mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.84rem", color: "#f1f5f9" }} noWrap>
                  {displayName}
                </Typography>
                {user?.email && (
                  <Typography sx={{ fontSize: "0.7rem", color: "var(--text-dim)" }} noWrap>
                    {user.email}
                  </Typography>
                )}
              </Box>
              <DropItem icon={SettingsRoundedIcon} label="Profile & Settings" onClick={() => goTo("/preferences")} active={location.pathname === "/preferences"} />
              <Box sx={{ height: "1px", bgcolor: "var(--border)", mx: 1.5, my: 0.5 }} />
              <DropItem icon={LogoutRoundedIcon} label="Logout" onClick={handleLogout} danger />
            </DropdownPanel>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;

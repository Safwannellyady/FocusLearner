import React, { useState, useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import LockRoundedIcon         from "@mui/icons-material/LockRounded";
import AutoAwesomeRoundedIcon  from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon        from "@mui/icons-material/CloseRounded";
import BoltRoundedIcon         from "@mui/icons-material/BoltRounded";
import StarRoundedIcon         from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";

/* ── Badge definitions ──────────────────────────────────────────────────────── */
const BADGES = [
  // Earned (demo)
  { id: "first-session",  emoji: "🚀", name: "Launchpad",        desc: "Completed your very first focus session",  earned: true,  date: "2026-07-28", xp: 50,  freebie: { type: "xp",     label: "+100 Bonus XP",              detail: "Added to your XP total immediately" } },
  { id: "streak-3",       emoji: "🔥", name: "Heat Seeker",      desc: "Maintained a 3-day study streak",           earned: true,  date: "2026-07-31", xp: 75,  freebie: { type: "theme",  label: "Cyber Theme Unlocked",        detail: "Now available in Settings → Appearance" } },
  { id: "hour-club",      emoji: "⏱️", name: "Hour Club",        desc: "Accumulated 1 full hour of focused study", earned: true,  date: "2026-08-02", xp: 100, freebie: { type: "xp",     label: "+200 Bonus XP",              detail: "Added to your XP total" } },
  { id: "five-sessions",  emoji: "⚡", name: "Spark Five",       desc: "Completed 5 focus sessions",                earned: true,  date: "2026-08-03", xp: 120, freebie: { type: "break",  label: "+2 min Break Time",          detail: "Session break time extended by 2 min" } },
  { id: "deep-diver",     emoji: "🌊", name: "Deep Diver",       desc: "Finished a 60-minute deep focus session",  earned: true,  date: "2026-08-04", xp: 150, freebie: { type: "avatar", label: "Ocean Avatar Border",        detail: "Unlocked in your profile settings" } },
  // Locked
  { id: "streak-7",       emoji: "🏅", name: "Week Warrior",     desc: "Maintain a 7-day streak",                  earned: false, xp: 200, freebie: { type: "theme",  label: "Matrix Theme Unlocked",      detail: "Available in Settings → Appearance" } },
  { id: "subject-master", emoji: "📚", name: "Subject Master",   desc: "Study 5 different subjects",               earned: false, xp: 175, freebie: { type: "xp",     label: "+300 Bonus XP",              detail: "" } },
  { id: "night-owl",      emoji: "🦉", name: "Night Owl",        desc: "Complete a session after 10 PM",           earned: false, xp: 80,  freebie: { type: "game",   label: "Exclusive Prompt Pack",      detail: "New prompts unlocked in Game Lab" } },
  { id: "speed-run",      emoji: "💨", name: "Speed Runner",     desc: "Complete 3 sessions in one day",           earned: false, xp: 150, freebie: { type: "break",  label: "+3 min Break Time",          detail: "Your breaks just got longer" } },
  { id: "century",        emoji: "💯", name: "The Century",      desc: "Reach 100 total study sessions",           earned: false, xp: 500, freebie: { type: "avatar", label: "Gold Avatar Border",         detail: "Exclusive elite status indicator" } },
  { id: "scholar-gold",   emoji: "🏆", name: "Scholar Gold",     desc: "Earn 5,000 total XP",                      earned: false, xp: 300, freebie: { type: "theme",  label: "Scholar Gold Theme",         detail: "Available in Settings → Appearance" } },
  { id: "consistent",     emoji: "📅", name: "Steady Rhythm",    desc: "Study every day for 30 days",              earned: false, xp: 600, freebie: { type: "xp",     label: "+1000 Bonus XP",             detail: "Massive XP reward" } },
];

const FREEBIE_COLORS = {
  xp:     { color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  icon: BoltRoundedIcon   },
  theme:  { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", icon: AutoAwesomeRoundedIcon },
  break:  { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  icon: CheckCircleRoundedIcon },
  avatar: { color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.3)",  icon: StarRoundedIcon   },
  game:   { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.3)",   icon: AutoAwesomeRoundedIcon },
};

/* ── Freebie modal ──────────────────────────────────────────────────────────── */
const FreebieModal = ({ badge, onClose }) => {
  const meta = FREEBIE_COLORS[badge?.freebie?.type] || FREEBIE_COLORS.xp;
  const Icon = meta.icon;

  return (
    <AnimatePresence>
      {badge && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", zIndex: 1400 }}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1500, width: "90%", maxWidth: 380 }}
          >
            <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", p: 3.5, textAlign: "center", position: "relative", overflow: "hidden" }}>
              {/* Shimmer */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.05) 50%,transparent 70%)", pointerEvents: "none" }}
              />

              <Box onClick={onClose} sx={{ position: "absolute", top: 12, right: 12, cursor: "pointer", color: "var(--text-dim)", "&:hover": { color: "#f1f5f9" } }}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </Box>

              {/* Badge icon — big + glowing */}
              <Box sx={{ mb: 2 }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-block" }}
                >
                  <Typography sx={{ fontSize: "3.5rem", lineHeight: 1, filter: "drop-shadow(0 0 20px rgba(255,200,50,0.6))" }}>
                    {badge.emoji}
                  </Typography>
                </motion.div>
              </Box>

              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--amber)", letterSpacing: "0.12em", textTransform: "uppercase", mb: 0.5 }}>
                🎉 Badge Unlocked!
              </Typography>
              <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#f1f5f9", mb: 0.5 }}>
                {badge.name}
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", mb: 2.5, lineHeight: 1.5 }}>
                {badge.desc}
              </Typography>

              {/* XP earned */}
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.4, bgcolor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "100px", mb: 2.5 }}>
                <BoltRoundedIcon sx={{ fontSize: 14, color: "var(--amber)" }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--amber)" }}>+{badge.xp} XP Earned</Typography>
              </Box>

              {/* Freebie reward */}
              <Box sx={{ p: 1.75, borderRadius: "var(--r-md)", bgcolor: meta.bg, border: `1px solid ${meta.border}`, mb: 2.5, textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                  <Icon sx={{ fontSize: 16, color: meta.color }} />
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: meta.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>Your Reward</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9", mb: 0.25 }}>{badge.freebie.label}</Typography>
                {badge.freebie.detail && (
                  <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{badge.freebie.detail}</Typography>
                )}
              </Box>

              {/* Claim button */}
              <Box
                onClick={onClose}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                  py: 1.2, borderRadius: "var(--r-md)", cursor: "pointer",
                  background: "var(--grad-primary)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
                  "&:hover": { boxShadow: "0 10px 28px rgba(99,102,241,0.55)", transform: "translateY(-1px)" },
                  transition: "all 0.2s",
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 17, color: "#fff" }} />
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Claim Reward
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Badge card ────────────────────────────────────────────────────────────── */
const BadgeCard = ({ badge, index, onClaim }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.35 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: badge.earned ? -5 : -2 }}
      onClick={() => badge.earned && onClaim(badge)}
      style={{ cursor: badge.earned ? "pointer" : "default" }}
    >
      <Box sx={{
        p: 2.5, borderRadius: "var(--r-lg)", textAlign: "center",
        bgcolor: "var(--bg-card)",
        border: `1px solid ${badge.earned ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
        boxShadow: badge.earned && hovered ? "0 12px 32px rgba(245,158,11,0.15)" : "0 2px 10px rgba(0,0,0,0.15)",
        opacity: badge.earned ? 1 : 0.55,
        filter: badge.earned ? "none" : "grayscale(0.7)",
        transition: "all 0.25s",
        position: "relative", overflow: "hidden",
      }}>

        {/* Shimmer on earned hover */}
        {badge.earned && (
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "250%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,220,100,0.08) 50%,transparent 70%)", pointerEvents: "none", zIndex: 1 }}
              />
            )}
          </AnimatePresence>
        )}

        {/* Earned glow border */}
        {badge.earned && (
          <Box sx={{ position: "absolute", inset: 0, borderRadius: "var(--r-lg)", boxShadow: "inset 0 0 20px rgba(245,158,11,0.05)", pointerEvents: "none" }} />
        )}

        {/* Emoji */}
        <Typography sx={{
          fontSize: "2.6rem", lineHeight: 1, mb: 1,
          filter: badge.earned ? "drop-shadow(0 0 12px rgba(255,200,50,0.5))" : "none",
          ...(badge.earned && { animation: hovered ? undefined : "none" }),
        }}>
          {badge.earned ? badge.emoji : "🔒"}
        </Typography>

        {/* Name */}
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: badge.earned ? "#f1f5f9" : "var(--text-dim)", mb: 0.4 }}>
          {badge.name}
        </Typography>

        {/* Desc */}
        <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.45, mb: 1.25 }}>
          {badge.earned ? badge.desc : badge.desc}
        </Typography>

        {/* XP + date / unlock condition */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <BoltRoundedIcon sx={{ fontSize: 13, color: badge.earned ? "var(--amber)" : "var(--text-dim)" }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: badge.earned ? "var(--amber)" : "var(--text-dim)" }}>
            {badge.earned ? `+${badge.xp} XP · ${badge.date}` : `${badge.xp} XP on unlock`}
          </Typography>
        </Box>

        {/* Freebie pill */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.25,
            borderRadius: "100px",
            bgcolor: badge.earned ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${badge.earned ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.07)"}`,
          }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 11, color: badge.earned ? "var(--amber)" : "var(--text-dim)" }} />
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: badge.earned ? "var(--amber)" : "var(--text-dim)" }}>
              {badge.freebie.label}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

/* ══ Badges (main) ════════════════════════════════════════════════════════════ */
const Badges = () => {
  const [filter,      setFilter]      = useState("All");
  const [claimBadge,  setClaimBadge]  = useState(null);
  const [claimed,     setClaimed]     = useState([]);

  const FILTERS = ["All", "Earned", "Locked"];

  const visible = BADGES.filter(b => {
    if (filter === "Earned") return b.earned;
    if (filter === "Locked") return !b.earned;
    return true;
  });

  const earned = BADGES.filter(b => b.earned);
  const totalXP = earned.reduce((acc, b) => acc + b.xp, 0);

  const handleClaim = (badge) => {
    if (!claimed.includes(badge.id)) {
      setClaimBadge(badge);
      setClaimed(c => [...c, badge.id]);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>

      {/* Freebie modal */}
      <FreebieModal badge={claimBadge} onClose={() => setClaimBadge(null)} />

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 22, color: "var(--amber)" }} />
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
            Badges
          </Typography>
        </Box>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
          Unlock badges, earn freebies, level up your focus game.
        </Typography>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: "Earned",     value: earned.length, color: "var(--amber)",    icon: EmojiEventsRoundedIcon },
          { label: "Locked",     value: BADGES.length - earned.length, color: "var(--text-dim)", icon: LockRoundedIcon },
          { label: "Total XP",   value: `${totalXP} XP`, color: "var(--indigo-lt)", icon: BoltRoundedIcon },
        ].map(({ label, value, color, icon: Icon }) => (
          <Box key={label} sx={{ flex: "1 1 100px", px: 1.75, py: 1.25, bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", gap: 1 }}>
            <Icon sx={{ fontSize: 18, color }} />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#f1f5f9", lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 0.75, mb: 3 }}>
        {FILTERS.map(f => (
          <Chip
            key={f} label={f} size="small"
            onClick={() => setFilter(f)}
            sx={{
              fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.78rem",
              cursor: "pointer",
              bgcolor: filter === f ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: filter === f ? "#a5b4fc" : "var(--text-dim)",
              "&:hover": { bgcolor: "rgba(99,102,241,0.1)" },
            }}
          />
        ))}
      </Box>

      {/* Hint for earned badges */}
      {filter !== "Locked" && earned.length > 0 && (
        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)", mb: 2, fontStyle: "italic" }}>
          Click an earned badge to claim its reward.
        </Typography>
      )}

      {/* Badge grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "repeat(4,1fr)" }, gap: 1.75 }}>
        <AnimatePresence>
          {visible.map((badge, i) => (
            <BadgeCard key={badge.id} badge={badge} index={i} onClaim={handleClaim} />
          ))}
        </AnimatePresence>
      </Box>

      {visible.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>No badges in this category yet.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Badges;

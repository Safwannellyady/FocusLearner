import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Link } from "@mui/material";
import { motion } from "framer-motion";
import { supportAPI } from "../services/api";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const FEATURES = [
  { icon: SchoolRoundedIcon,          label: "AI Tutor",           desc: "Context-aware answers while you study"   },
  { icon: SportsEsportsRoundedIcon,   label: "Gamified Learning",  desc: "XP, badges, and engineering challenges"  },
  { icon: ShowChartRoundedIcon,       label: "Deep Analytics",     desc: "Streak tracking and mastery heatmaps"    },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null); // null | "privacy" | "terms"

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Top nav ── */}
      <Box
        component="nav"
        aria-label="Primary"
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: { xs: 2, md: 4 }, py: 1.75, position: "sticky", top: 0, zIndex: 10,
          bgcolor: "rgba(10,14,28,0.75)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navigate("/")}>
          <AutoAwesomeIcon sx={{ fontSize: 20, color: "#818cf8" }} />
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#f1f5f9" }}>
            FocusLearner
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={() => setWaitlistOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-mid)", "&:hover": { color: "#f1f5f9" } }}
          >
            Join waitlist
          </Button>
          <Button
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-mid)", "&:hover": { color: "#f1f5f9" } }}
          >
            Sign in
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/signup")}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.85rem", borderRadius: "var(--r-md)", background: "var(--grad-primary)", px: 2 }}
          >
            Get started
          </Button>
        </Box>
      </Box>

      {/* ── Hero ── */}
      <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 4 },
        py: 8,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Soft ambient orbs */}
      <Box sx={{
        position: "absolute", top: "20%", left: "15%",
        width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", bottom: "20%", right: "15%",
        width: 260, height: 260,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Logo badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.6,
            borderRadius: "100px",
            bgcolor: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            mb: 3,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "#818cf8" }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em" }}>
            AI-POWERED LEARNING STUDIO
          </Typography>
        </Box>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily:    "Outfit, sans-serif",
            fontWeight:    900,
            fontSize:      { xs: "2.4rem", sm: "3.5rem", md: "4.5rem" },
            lineHeight:    1.05,
            letterSpacing: "-0.04em",
            color:         "#f1f5f9",
            mb: 2.5,
            maxWidth: 720,
          }}
        >
          Focus is not a habit.
          <br />
          It's an{" "}
          <Box
            component="span"
            sx={{
              background: "var(--grad-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            environment.
          </Box>
        </Typography>
      </motion.div>

      {/* Sub-headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Typography
          sx={{
            color:     "var(--text-mid)",
            fontSize:  { xs: "1rem", md: "1.1rem" },
            mb: 4,
            maxWidth:  520,
            lineHeight: 1.65,
            fontWeight: 400,
          }}
        >
          Master your subjects with an AI-powered distraction-free environment
          built for deep work and long-term retention.
        </Typography>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center", mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/signup")}
            endIcon={<ArrowForwardIcon />}
            sx={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize:   "0.95rem",
              px: 3, py: 1.2,
              borderRadius: "var(--r-md)",
              background: "var(--grad-primary)",
              textTransform: "none",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              "&:hover": { boxShadow: "0 12px 32px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize:   "0.95rem",
              px: 3, py: 1.2,
              borderRadius: "var(--r-md)",
              textTransform: "none",
              borderColor: "rgba(255,255,255,0.15)",
              color: "var(--text-mid)",
              "&:hover": { borderColor: "var(--border-active)", color: "#f1f5f9", bgcolor: "rgba(99,102,241,0.08)" },
            }}
          >
            Sign In
          </Button>
        </Box>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <Box
              key={label}
              sx={{
                display:       "flex",
                alignItems:    "center",
                gap:           1.2,
                px:            1.75,
                py:            1,
                borderRadius:  "var(--r-lg)",
                bgcolor:       "var(--bg-card)",
                border:        "1px solid var(--border)",
                textAlign:     "left",
                transition:    "all 0.18s",
                "&:hover":     { borderColor: "var(--border-active)", transform: "translateY(-2px)" },
              }}
            >
              <Box className="icon-box icon-box-sm" sx={{ bgcolor: "rgba(99,102,241,0.15)", color: "var(--indigo-lt)" }}>
                <Icon sx={{ fontSize: 15 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#f1f5f9", lineHeight: 1.1 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  {desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </motion.div>

      {/* Buy me a coffee */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Button
          component="a"
          href="https://buymeacoffee.com/Safwan_ms"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<LocalCafeIcon />}
          sx={{
            mt: 4,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: "0.85rem",
            px: 2.5, py: 1,
            borderRadius: "var(--r-md)",
            textTransform: "none",
            background: "#FFDD00",
            color: "#000000",
            boxShadow: "0 6px 18px rgba(255,221,0,0.25)",
            "&:hover": {
              background: "#ffe033",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 24px rgba(255,221,0,0.4)",
            },
          }}
        >
          Buy me a coffee
        </Button>
      </motion.div>
      </Box>

      {/* ── Footer ── */}
      <Box
        component="footer"
        sx={{
          borderTop: "1px solid var(--border)",
          px: { xs: 2, md: 4 }, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 1,
        }}
      >
        <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
          © 2026 FocusLearner. Study deeply.
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Link
            component="button"
            type="button"
            onClick={() => setLegalDoc("privacy")}
            sx={{ fontSize: "0.78rem", color: "var(--text-dim)", textDecoration: "none", cursor: "pointer", "&:hover": { color: "#f1f5f9" } }}
          >
            Privacy Policy
          </Link>
          <Link
            component="button"
            type="button"
            onClick={() => setLegalDoc("terms")}
            sx={{ fontSize: "0.78rem", color: "var(--text-dim)", textDecoration: "none", cursor: "pointer", "&:hover": { color: "#f1f5f9" } }}
          >
            Terms of Service
          </Link>
        </Box>
      </Box>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />

      {/* ── Legal dialogs ── */}
      <Dialog open={legalDoc === "privacy"} onClose={() => setLegalDoc(null)} aria-labelledby="privacy-title" maxWidth="sm" fullWidth>
        <DialogTitle id="privacy-title">Privacy Policy</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {`FocusLearner stores the account details you provide (username, email) and the study data you create (sessions, notes, progress) so the app can function.

• We never sell your data.
• Study content and analytics are visible only to your account.
• Google sign-in shares only your basic profile (name, email) with us.
• You can request deletion of your account and data at any time via the support form.

This is a concise summary — a full policy will be published before public launch.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLegalDoc(null)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={legalDoc === "terms"} onClose={() => setLegalDoc(null)} aria-labelledby="terms-title" maxWidth="sm" fullWidth>
        <DialogTitle id="terms-title">Terms of Service</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {`By using FocusLearner you agree to:

• Use the service for lawful personal study purposes.
• Not attempt to disrupt the service or other users' accounts.
• Understand the service is provided "as is" during its beta period.

AI-generated summaries, video suggestions and study plans may contain mistakes — always verify against your own study material.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLegalDoc(null)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ── Re-triggerable waitlist modal ────────────────────────────────────────────
   Submits a real ticket to the backend support queue (category "waitlist"),
   so signups are actually recorded instead of vanishing into localStorage. */
const WaitlistModal = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStatus("idle"); setError(""); }, 300);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("sending"); setError("");
    try {
      await supportAPI.submitTicket({
        category: "waitlist",
        subject: `Beta waitlist signup — ${email.trim()}`,
        message: `Name: ${name.trim() || "(not provided)"}\nEmail: ${email.trim()}\nWants early access to FocusLearner.`,
      });
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Couldn't submit right now. Please try again in a moment.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="waitlist-title" maxWidth="xs" fullWidth>
      <DialogTitle id="waitlist-title" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Join the waitlist
        <Button onClick={handleClose} aria-label="Close" sx={{ minWidth: 32, p: 0.5 }}>
          <CloseRoundedIcon fontSize="small" />
        </Button>
      </DialogTitle>
      <DialogContent>
        {status === "done" ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography sx={{ fontSize: "2rem", mb: 1 }}>🎉</Typography>
            <Typography sx={{ fontWeight: 700, color: "#f1f5f9", mb: 0.5 }}>You're on the list!</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
              We'll email you when your invite is ready.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
              Get early access to new FocusLearner features before public launch.
            </Typography>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              required
            />
            {error && <Typography sx={{ fontSize: "0.8rem", color: "#fda4af" }}>{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              disabled={status === "sending"}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "var(--r-md)", background: "var(--grad-primary)", mt: 0.5 }}
            >
              {status === "sending" ? "Joining…" : "Notify me"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LandingPage;

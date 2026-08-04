import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";

const FEATURES = [
  { icon: SchoolRoundedIcon,          label: "AI Tutor",           desc: "Context-aware answers while you study"   },
  { icon: SportsEsportsRoundedIcon,   label: "Gamified Learning",  desc: "XP, badges, and engineering challenges"  },
  { icon: ShowChartRoundedIcon,       label: "Deep Analytics",     desc: "Streak tracking and mastery heatmaps"    },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
    </Box>
  );
};

export default LandingPage;

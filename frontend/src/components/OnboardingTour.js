import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    emoji: "👋",
    title: "Welcome to FocusLearner",
    body: "Your distraction-free study environment. Here's a 30-second tour of what you can do.",
  },
  {
    emoji: "⚡",
    title: "Start a focus session",
    body: "Hit “New Session”, pick a subject and topic, and we'll find verified videos, launch an AI tutor, and track your time.",
    cta: { label: "Start a session", to: "/courses" },
  },
  {
    emoji: "📊",
    title: "Track real progress",
    body: "Every completed session earns XP, builds your streak, and feeds your analytics and knowledge graph — all from your actual study time.",
    cta: { label: "See analytics", to: "/analytics" },
  },
];

/**
 * First-run onboarding tour. Shown once per browser (localStorage flag);
 * dismissible at any step, never blocks the dashboard.
 */
const OnboardingTour = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => {
      try { return localStorage.getItem("focuslearner_onboarded") === "1"; }
      catch { return true; }
    }
  );
  const [step, setStep] = useState(0);

  if (dismissed) return null;

  const finish = () => {
    try { localStorage.setItem("focuslearner_onboarded", "1"); } catch {}
    setDismissed(true);
  };

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <Box
      sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", p: 2,
      }}
      role="dialog"
      aria-label="Welcome tour"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Box
            sx={{
              bgcolor: "#0f172a", border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)", p: 3.5, textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>{current.emoji}</Typography>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#f1f5f9", mb: 1 }}>
              {current.title}
            </Typography>
            <Typography sx={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.65, mb: 2.5 }}>
              {current.body}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2.5 }}>
              {STEPS.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                    bgcolor: i === step ? "var(--indigo)" : "rgba(255,255,255,0.15)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={finish}
                sx={{ textTransform: "none", fontWeight: 600, color: "var(--text-dim)", flex: 1 }}
              >
                Skip tour
              </Button>
              {current.cta && !last ? (
                <Button
                  variant="contained"
                  onClick={() => { finish(); navigate(current.cta.to); }}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: "var(--r-md)", background: "var(--grad-primary)", flex: 2 }}
                >
                  {current.cta.label}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => (last ? finish() : setStep(s => s + 1))}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: "var(--r-md)", background: "var(--grad-primary)", flex: 2 }}
                >
                  {last ? "Start studying 🎯" : "Next"}
                </Button>
              )}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default OnboardingTour;

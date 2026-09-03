import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, IconButton, CircularProgress, Chip, LinearProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { srsAPI } from "../services/api";

const FlashcardsDeck = ({ subject = "General Science", topic = "Core Principles", notes = "" }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ total_cards: 0, due_cards: 0, mastered_cards: 0 });

  const loadDueCards = async () => {
    setLoading(true);
    try {
      const [dueRes, statsRes] = await Promise.allSettled([
        srsAPI.getDue(20),
        srsAPI.getStats()
      ]);

      if (dueRes.status === "fulfilled") {
        const fetched = dueRes.value?.data?.cards || [];
        setCards(fetched);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value?.data || { total_cards: 0, due_cards: 0, mastered_cards: 0 });
      }
    } catch (err) {
      console.error("Error loading flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, []);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await srsAPI.generateCards(subject, topic, notes);
      const generated = res?.data?.cards || [];
      if (generated.length > 0) {
        setCards(prev => [...generated, ...prev]);
        setCurrentIndex(0);
        setFlipped(false);
      }
    } catch (err) {
      console.error("Generate flashcards error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRateCard = async (quality) => {
    if (cards.length === 0 || currentIndex >= cards.length) return;
    const activeCard = cards[currentIndex];

    try {
      if (activeCard.id) {
        await srsAPI.submitReview(activeCard.id, quality);
      }
    } catch (err) {
      console.error("Review submit error:", err);
    }

    setFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(cards.length);
      loadDueCards();
    }
  };

  const currentCard = cards[currentIndex];
  const progressPct = cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16", p: { xs: 2, md: 3 } }}>
      {/* Header Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-md)", bgcolor: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StyleRoundedIcon sx={{ fontSize: 20, color: "var(--indigo-lt)" }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9", lineHeight: 1.1 }}>
              SM-2 Spaced Repetition Flashcards
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              {stats.due_cards} Due Today · {stats.mastered_cards} Mastered Cards
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={loadDueCards} sx={{ color: "var(--text-dim)" }}>
            <RefreshRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Button
            size="small"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              px: 2, py: 0.6, borderRadius: "var(--r-md)",
              background: "var(--grad-primary)", color: "#fff",
              fontSize: "0.78rem", fontWeight: 800, textTransform: "none",
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)"
            }}
          >
            {isGenerating ? "Generating..." : "Generate AI Flashcards"}
          </Button>
        </Box>
      </Box>

      {/* Progress Bar */}
      {cards.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Review Queue Progress</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "var(--indigo-lt)", fontWeight: 700 }}>{currentIndex} / {cards.length} Cards ({progressPct}%)</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPct} sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)", "& .MuiLinearProgress-bar": { bgcolor: "var(--indigo)" } }} />
        </Box>
      )}

      {/* Card Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 320 }}>
        {loading ? (
          <CircularProgress size={32} sx={{ color: "var(--indigo)" }} />
        ) : cards.length === 0 || currentIndex >= cards.length ? (
          <Box sx={{ textAlign: "center", p: 4, bgcolor: "#0f172a", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", maxWidth: 450 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 48, color: "var(--emerald)", mb: 1.5 }} />
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#f1f5f9", mb: 0.5 }}>
              All Flashcards Completed!
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", mb: 2.5 }}>
              You have reviewed all due cards for today. Click below to auto-generate new cards using Gemini AI.
            </Typography>
            <Button size="small" variant="contained" onClick={handleGenerateAI} disabled={isGenerating} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
              {isGenerating ? "Generating..." : "Generate AI Flashcards"}
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: "100%", maxWidth: 580, perspective: 1000 }}>
            {/* 3D Flip Card Container */}
            <motion.div
              onClick={() => setFlipped(p => !p)}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d", cursor: "pointer", position: "relative" }}
            >
              <Box
                sx={{
                  minHeight: 240, p: 4, borderRadius: "var(--r-xl)",
                  bgcolor: "#0b1320", border: `1px solid ${flipped ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.3)"}`,
                  boxShadow: flipped ? "0 20px 50px rgba(16,185,129,0.15)" : "0 20px 50px rgba(99,102,241,0.15)",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  transition: "border-color 0.3s"
                }}
              >
                {/* Top Badge */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    label={currentCard.subject || subject}
                    size="small"
                    sx={{ fontSize: "0.68rem", fontWeight: 700, bgcolor: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
                  />
                  <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
                    {flipped ? "Answer Side (Click to flip)" : "Question Side (Click to flip)"}
                  </Typography>
                </Box>

                {/* Main Card Text */}
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: flipped ? "1.05rem" : "1.2rem", color: flipped ? "#34d399" : "#f1f5f9", lineHeight: 1.5 }}>
                    {flipped ? (currentCard.answer || "No answer text available.") : (currentCard.question || currentCard.title)}
                  </Typography>
                </Box>

                {/* Bottom hint */}
                <Typography sx={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-dim)", fontStyle: "italic" }}>
                  {flipped ? "Rate your memory recall below ↓" : "Click anywhere on card to reveal answer"}
                </Typography>
              </Box>
            </motion.div>

            {/* SM-2 Quality Rating Buttons */}
            {flipped && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ display: "flex", gap: 1, mt: 2.5, justifyContent: "center" }}>
                  <Button
                    size="small" variant="outlined" color="error"
                    onClick={() => handleRateCard(1)}
                    sx={{ flex: 1, py: 1, borderRadius: "var(--r-md)", fontSize: "0.75rem", fontWeight: 800, textTransform: "none" }}
                  >
                    1: Again (1d)
                  </Button>
                  <Button
                    size="small" variant="outlined" color="warning"
                    onClick={() => handleRateCard(3)}
                    sx={{ flex: 1, py: 1, borderRadius: "var(--r-md)", fontSize: "0.75rem", fontWeight: 800, textTransform: "none" }}
                  >
                    3: Hard (2d)
                  </Button>
                  <Button
                    size="small" variant="outlined" color="primary"
                    onClick={() => handleRateCard(4)}
                    sx={{ flex: 1, py: 1, borderRadius: "var(--r-md)", fontSize: "0.75rem", fontWeight: 800, textTransform: "none" }}
                  >
                    4: Good (4d)
                  </Button>
                  <Button
                    size="small" variant="contained" color="success"
                    onClick={() => handleRateCard(5)}
                    sx={{ flex: 1, py: 1, borderRadius: "var(--r-md)", fontSize: "0.75rem", fontWeight: 800, textTransform: "none" }}
                  >
                    5: Easy (7d)
                  </Button>
                </Box>
              </motion.div>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FlashcardsDeck;

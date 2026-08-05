import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import RefreshRoundedIcon      from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import AutoAwesomeRoundedIcon  from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon         from "@mui/icons-material/BoltRounded";

/* ════════════════════════════════════════════════════════════════════════════
   GAME ENGINE DB — 5 fictional stateless prompt generators
════════════════════════════════════════════════════════════════════════════ */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const GAMES = [
  /* ── 1. Chrono-Fixer ──────────────────────────────────────────────── */
  {
    id:    "chrono",
    name:  "Chrono-Fixer",
    emoji: "⏳",
    color: "#6366f1",
    tagline: "Stranded in time. Improvise or perish.",
    instructions: "You're a time-traveller whose machine broke. Survive using only what you have.",
    generatePrompt: () => {
      const eras = ["Ancient Egypt (3000 BC)", "Medieval England (1250 AD)", "Caribbean Pirates (1700s)", "Feudal Japan (1600s)", "1920s New York speakeasy"];
      const items = ["a leaf blower", "a selfie stick", "a bag of microwave popcorn", "an office chair on wheels", "an empty shopping trolley", "a karaoke machine", "a rubber duck collection"];
      return `You are stranded in **${pick(eras)}** with nothing but **${pick(items)}**.\n\nWrite 2 sentences: how do you survive the next 24 hours?`;
    },
  },

  /* ── 2. Alien Tourism Board ───────────────────────────────────────── */
  {
    id:    "alien",
    name:  "Alien Tourism Board",
    emoji: "👽",
    color: "#10b981",
    tagline: "They came. They were confused.",
    instructions: "Explain a common human object to an alien species that has never seen Earth.",
    generatePrompt: () => {
      const items   = ["a toothbrush", "a TV remote control", "an egg carton", "a pair of socks", "a stapler", "a pizza box", "a flip-flop sandal"];
      const aliens  = ["the Zorblaxians (who have no hands)", "the Gloopians (who are made of liquid)", "the Xylosians (who communicate only in whistles)", "the Plinkos (who see only in infrared)", "the Kronosians (who experience time backwards)"];
      return `You are an ambassador presenting **${pick(items)}** to **${pick(aliens)}**.\n\nGive them 3 completely wrong (but confident) fictional uses for this object.`;
    },
  },

  /* ── 3. The 3-Ingredient Spellbook ───────────────────────────────── */
  {
    id:    "spellbook",
    name:  "3-Ingredient Spellbook",
    emoji: "📖",
    color: "#a78bfa",
    tagline: "Magic is just chemistry you haven't named yet.",
    instructions: "Combine two ingredients to create a named spell with a specific effect.",
    generatePrompt: () => {
      const pairs = [
        ["expired milk", "wifi signal"],
        ["Monday morning dread", "a perfectly sharpened pencil"],
        ["3 AM energy", "bubble wrap"],
        ["a broken umbrella", "nostalgia"],
        ["the last slice of pizza", "a library card"],
        ["elevator music", "a charging cable"],
        ["overripe banana", "a motivational poster"],
      ];
      const effects = [
        "makes anyone within 10 metres speak only in rhymes",
        "causes the target to forget every password they ever knew",
        "transforms all nearby furniture into clouds",
        "grants the ability to understand what cats are thinking",
        "makes time move at half speed, but only during meetings",
      ];
      const [a, b] = pick(pairs);
      return `Combine **${a}** with **${b}** to create a spell that **${pick(effects)}**.\n\nGive your spell a name and write the incantation (one sentence, dramatic).`;
    },
  },

  /* ── 4. Rogue AI Decryptor ────────────────────────────────────────── */
  {
    id:    "rogue",
    name:  "Rogue AI Decryptor",
    emoji: "🤖",
    color: "#f59e0b",
    tagline: "The AI doesn't understand humans. Help it.",
    instructions: "Describe a human concept using only cold, mechanical computer terminology to fool the AI.",
    generatePrompt: () => {
      const concepts = ["a hug", "jealousy", "a surprise birthday party", "procrastination", "a first date", "homesickness", "writer's block"];
      const personas = ["SENTINEL-9 (a military threat-detection AI)", "LEDGER-X (an accounting AI that only understands spreadsheets)", "CHEF-BOT 3000 (an AI trained exclusively on recipes)", "TRANSIT-AI (an AI that only understands train timetables)", "GARDEN-MIND (an AI built to optimize crop yields)"];
      return `**${pick(personas)}** has flagged human behaviour as anomalous.\n\nDescribe **"${pick(concepts)}"** using only technical/mechanical terminology so the AI classifies it as normal system activity.`;
    },
  },

  /* ── 5. Monster Taxonomy ──────────────────────────────────────────── */
  {
    id:    "monster",
    name:  "Monster Taxonomy",
    emoji: "🦎",
    color: "#f43f5e",
    tagline: "Science demands classification. Even of nightmares.",
    instructions: "Fuse two things together and give the result a scientific name and diet.",
    generatePrompt: () => {
      const heads = ["a golden retriever's head", "a cactus head", "a vintage jukebox head", "a storm cloud head", "a giant gummy bear head", "a medieval knight helmet head"];
      const bases = ["the body of a forklift truck", "the lower half of a grand piano", "eight legs of an office desk", "a skateboard base", "a giant snail shell", "the chassis of a golf cart"];
      const diets  = ["feeds exclusively on lost socks and expired loyalty cards", "consumes only unanswered emails and the feeling of déjà vu", "survives on unfinished to-do lists and the sound of dial-up internet", "eats overconfident LinkedIn posts and motivational wall art"];
      return `Creature parts:\n- **Head:** ${pick(heads)}\n- **Body:** ${pick(bases)}\n\nGive it:\n1. A Latin-style scientific name\n2. Its diet: ${pick(diets)}\n3. One unique defence mechanism`;
    },
  },
];

/* ── Countdown display ─────────────────────────────────────────────────────── */
const fmtTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* ── Game selector card ────────────────────────────────────────────────────── */
const GameCard = ({ game, onClick }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    <Box sx={{
      p: 2, borderRadius: "var(--r-lg)",
      bgcolor: "var(--bg-card)", border: `1px solid ${game.color}33`,
      boxShadow: `0 4px 20px ${game.color}11`,
      transition: "all 0.2s",
      "&:hover": { borderColor: `${game.color}66`, boxShadow: `0 8px 30px ${game.color}22` },
      textAlign: "center",
    }}>
      <Typography sx={{ fontSize: "2rem", mb: 0.5 }}>{game.emoji}</Typography>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", mb: 0.25 }}>
        {game.name}
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
        {game.tagline}
      </Typography>
    </Box>
  </motion.div>
);

/* ── Active game panel ─────────────────────────────────────────────────────── */
const GamePlay = ({ game, breakSec, onDone, onNewPrompt }) => {
  const [prompt,  setPrompt]  = useState(() => game.generatePrompt());
  const [answer,  setAnswer]  = useState("");
  const [rolling, setRolling] = useState(false);

  const reroll = useCallback(() => {
    setRolling(true);
    setTimeout(() => { setPrompt(game.generatePrompt()); setAnswer(""); setRolling(false); }, 220);
  }, [game]);

  // Parse **bold** markdown
  const renderPrompt = (text) =>
    text.split(/(\*\*[^*]+\*\*)/).map((chunk, i) =>
      chunk.startsWith("**") && chunk.endsWith("**")
        ? <strong key={i} style={{ color: game.color }}>{chunk.slice(2, -2)}</strong>
        : chunk
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
      {/* Game header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: "var(--r-md)", flexShrink: 0,
          bgcolor: `${game.color}18`, border: `1px solid ${game.color}33`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
        }}>
          {game.emoji}
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>
            {game.name}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            {game.instructions}
          </Typography>
        </Box>
        {/* Break countdown */}
        {breakSec !== null && (
          <Box sx={{ ml: "auto", flexShrink: 0, textAlign: "right" }}>
            <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: "1rem", color: breakSec < 60 ? "var(--rose)" : "var(--emerald)" }}>
              {fmtTime(breakSec)}
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.07em" }}>BREAK LEFT</Typography>
          </Box>
        )}
      </Box>

      {/* Prompt box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={prompt}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: rolling ? 0 : 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{
            p: 2, borderRadius: "var(--r-lg)",
            bgcolor: `${game.color}0d`, border: `1px solid ${game.color}2a`,
            lineHeight: 1.75,
          }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#e2e8f0", whiteSpace: "pre-line" }}>
              {renderPrompt(prompt)}
            </Typography>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Response area */}
      <Box
        component="textarea"
        placeholder="Write your response here… no judgement, no saving."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        sx={{
          flex: 1, resize: "none", p: 1.75,
          borderRadius: "var(--r-md)", minHeight: 100,
          bgcolor: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
          color: "#e2e8f0", fontSize: "0.9rem",
          fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.65,
          outline: "none", "&:focus": { borderColor: `${game.color}55` }, transition: "all 0.15s",
        }}
      />

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={reroll}
          sx={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
            py: 1, borderRadius: "var(--r-md)", cursor: "pointer",
            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            transition: "all 0.18s", "&:hover": { bgcolor: "rgba(255,255,255,0.08)", borderColor: "var(--border-active)" },
          }}
        >
          <RefreshRoundedIcon sx={{ fontSize: 17, color: "var(--text-mid)" }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-mid)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            🎲 New Prompt
          </Typography>
        </Box>

        <Box
          onClick={onDone}
          sx={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
            py: 1, borderRadius: "var(--r-md)", cursor: "pointer",
            background: "linear-gradient(135deg,#10b981,#059669)",
            boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            transition: "all 0.18s", "&:hover": { boxShadow: "0 6px 20px rgba(16,185,129,0.45)", transform: "translateY(-1px)" },
          }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 17, color: "#fff" }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Done, Back to Study
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

/* ══ GameLab (main) ═══════════════════════════════════════════════════════════ */
const GameLab = () => {
  const [selected, setSelected] = useState(null);
  const [breakSec, setBreakSec] = useState(null);

  // If launched from Focus Studio during break, grab remaining break time
  useEffect(() => {
    const session = (() => { try { return JSON.parse(localStorage.getItem("activeSession")); } catch { return null; } })();
    if (session?.breakRemaining) setBreakSec(session.breakRemaining);
  }, []);

  const handleDone = () => {
    setSelected(null);
    window.history.back();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 680, mx: "auto" }}>
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="picker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>

            {/* Header */}
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: "var(--indigo-lt)" }} />
                <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
                  Break Games
                </Typography>
              </Box>
              <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                5 fictional brain-refresh games. No progress saved. No rules broken.
              </Typography>

              {/* Break timer badge */}
              {breakSec !== null && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mt: 1.5, px: 1.25, py: 0.5, borderRadius: "100px", bgcolor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "var(--emerald)", animation: "pulse-ring 1.5s infinite" }} />
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--emerald)" }}>
                    {fmtTime(breakSec)} break remaining
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Game grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 1.5, mb: 2 }}>
              {GAMES.map((game, i) => (
                <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <GameCard game={game} onClick={() => setSelected(game)} />
                </motion.div>
              ))}
              {/* Random pick card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: GAMES.length * 0.07 }}>
                <Box
                  onClick={() => setSelected(GAMES[Math.floor(Math.random() * GAMES.length)])}
                  sx={{
                    p: 2, borderRadius: "var(--r-lg)", textAlign: "center", cursor: "pointer",
                    bgcolor: "rgba(99,102,241,0.07)", border: "1px dashed rgba(99,102,241,0.35)",
                    "&:hover": { bgcolor: "rgba(99,102,241,0.14)", borderColor: "rgba(99,102,241,0.6)" },
                    transition: "all 0.2s",
                  }}
                >
                  <BoltRoundedIcon sx={{ fontSize: 28, color: "var(--indigo-lt)", mb: 0.5 }} />
                  <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#a5b4fc" }}>
                    Random Game
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Surprise me</Typography>
                </Box>
              </motion.div>
            </Box>

            <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", textAlign: "center", fontStyle: "italic" }}>
              "The brain refreshes best when it plays. Then it returns to work, sharpened."
            </Typography>
          </motion.div>

        ) : (
          <motion.div key="play" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}
          >
            {/* Back link */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2, cursor: "pointer", width: "fit-content" }} onClick={() => setSelected(null)}>
              <Typography sx={{ fontSize: "0.8rem", color: "var(--text-dim)", "&:hover": { color: "#f1f5f9" } }}>← All Games</Typography>
            </Box>

            <GamePlay
              game={selected}
              breakSec={breakSec}
              onDone={handleDone}
              onNewPrompt={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default GameLab;

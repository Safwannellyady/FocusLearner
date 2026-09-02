import React, { useState } from "react";
import { Box, Typography, Button, Menu, MenuItem } from "@mui/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import PythonRunner from "./PythonRunner";
import CppPlayground from "./CppPlayground";
import LinuxTerminal from "./LinuxTerminal";
import SQLEngine from "./SQLEngine";
import FinanceLab from "./FinanceLab";
import PhysicsSim from "./PhysicsSim";
import BiologyLab from "./BiologyLab";

const StudyWorkspace = ({ subjectFocus, topic }) => (
  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 3, textAlign: "center", bgcolor: "#090d16" }}>
    <Box sx={{ maxWidth: 520 }}>
      <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9", mb: 1 }}>
        Study workspace ready
      </Typography>
      <Typography sx={{ color: "var(--text-dim)", fontSize: "0.86rem", lineHeight: 1.65 }}>
        {topic ? `${topic} is best supported by notes, search, chat, and summaries—not a coding terminal.` : `${subjectFocus || "This subject"} does not require a technical lab.`}
      </Typography>
    </Box>
  </Box>
);

/**
 * Dynamic Subject Lab Registry Engine
 * Maps ANY subject to its corresponding interactive practice lab environment.
 */
export const LAB_REGISTRY = [
  {
    id: "study",
    label: "Study Workspace",
    icon: ScienceRoundedIcon,
    color: "#818cf8",
    keywords: ["neuroscience", "neuro", "psychology", "behavioral", "cognitive", "mental", "sociology", "history", "literature", "language", "philosophy"],
    component: StudyWorkspace,
  },
  {
    id: "python",
    label: "Python Compiler & REPL",
    icon: CodeRoundedIcon,
    color: "#38bdf8",
    keywords: ["python", "coding", "software", "algo", "data structure", "script"],
    component: PythonRunner,
  },
  {
    id: "cpp",
    label: "C / C++ Playground",
    icon: CodeRoundedIcon,
    color: "#6366f1",
    keywords: ["c++", "c ", "cpp", "systems", "embedded", "compiler", "pointer"],
    component: CppPlayground,
  },
  {
    id: "linux",
    label: "Linux Terminal Sandbox",
    icon: TerminalRoundedIcon,
    color: "#10b981",
    keywords: ["cyber", "security", "linux", "bash", "cli", "network", "os", "operating system"],
    component: LinuxTerminal,
  },
  {
    id: "sql",
    label: "SQL Database Engine",
    icon: StorageRoundedIcon,
    color: "#f59e0b",
    keywords: ["sql", "database", "db", "query", "relational", "postgres", "mysql"],
    component: SQLEngine,
  },
  {
    id: "finance",
    label: "Financial & Ledger Lab",
    icon: CalculateRoundedIcon,
    color: "#ec4899",
    keywords: ["account", "finance", "math", "calculus", "ledger", "tax", "money", "statistic"],
    component: FinanceLab,
  },
  {
    id: "physics",
    label: "Physics Mechanics Sandbox",
    icon: ScienceRoundedIcon,
    color: "#a855f7",
    keywords: ["physics", "force", "circuit", "mechanics", "motion", "gravity", "wave", "optics"],
    component: PhysicsSim,
  },
  {
    id: "biology",
    label: "Virtual Biology & Cell Lab",
    icon: BiotechRoundedIcon,
    color: "#84cc16",
    keywords: ["bio", "biology", "cell", "micro", "genetics", "dna", "anatomy", "organism"],
    component: BiologyLab,
  },
];

export const resolveLabForSubject = (subjectStr = "", topicStr = "") => {
  const text = `${subjectStr} ${topicStr}`.toLowerCase();
  const matchesKeyword = (keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+])${escaped}($|[^a-z0-9+])`, "i").test(text);
  };
  const scoredLabs = LAB_REGISTRY
    .map((lab) => ({ lab, score: lab.keywords.reduce((score, keyword) => score + (matchesKeyword(keyword) ? keyword.length : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Never force a technical sandbox for a subject that has no appropriate
  // hands-on environment.  The study workspace keeps the session coherent.
  return scoredLabs[0]?.lab.id || "study";
};

const SubjectLabs = ({ subjectFocus = "", topic = "", initialLabId = null }) => {
  const resolvedDefault = LAB_REGISTRY.some((lab) => lab.id === initialLabId)
    ? initialLabId
    : resolveLabForSubject(subjectFocus, topic);
  const [activeLabId, setActiveLabId] = useState(resolvedDefault);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isManuallySelected, setIsManuallySelected] = useState(Boolean(initialLabId));

  const activeLab = LAB_REGISTRY.find((l) => l.id === activeLabId) || LAB_REGISTRY[0];
  const ActiveComponent = activeLab.component;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#090d16" }}>
      {/* Lab Selector Header Toolbar */}
      <Box sx={{
        px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: "var(--r-sm)",
            bgcolor: `${activeLab.color}18`, border: `1px solid ${activeLab.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <activeLab.icon sx={{ fontSize: 16, color: activeLab.color }} />
          </Box>

          <Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#f1f5f9", lineHeight: 1.1 }}>
              {activeLab.label}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
              {isManuallySelected ? "Selected manually" : "Recommended for"}: <span style={{ color: "var(--indigo-lt)", fontWeight: 600 }}>{subjectFocus || "General Study"}</span>
            </Typography>
          </Box>
        </Box>

        {/* Switch Lab Menu */}
        <Button
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            px: 1.5, py: 0.4, borderRadius: "var(--r-md)",
            bgcolor: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
            color: "#f1f5f9", fontSize: "0.72rem", fontWeight: 700, textTransform: "none",
            "&:hover": { bgcolor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)" }
          }}
        >
          Change workspace
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: { bgcolor: "#0f172a", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }
          }}
        >
          {LAB_REGISTRY.map((lab) => (
            <MenuItem
              key={lab.id}
              onClick={() => { setActiveLabId(lab.id); setIsManuallySelected(true); setAnchorEl(null); }}
              selected={lab.id === activeLabId}
              sx={{ gap: 1.5, py: 1, px: 2, fontSize: "0.8rem", color: lab.id === activeLabId ? lab.color : "#f1f5f9" }}
            >
              <lab.icon sx={{ fontSize: 16, color: lab.color }} />
              {lab.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Render Active Interactive Lab */}
      <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <ActiveComponent subjectFocus={subjectFocus} topic={topic} />
      </Box>
    </Box>
  );
};

export default SubjectLabs;

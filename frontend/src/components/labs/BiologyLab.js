import React, { useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";

const ORGANELLES = [
  { name: "Nucleus", role: "Contains genetic material (DNA) and controls cellular activity.", color: "#84cc16" },
  { name: "Mitochondria", role: "Powerhouse of the cell, generates ATP via cellular respiration.", color: "#f59e0b" },
  { name: "Ribosomes", role: "Synthesizes proteins based on mRNA sequences.", color: "#38bdf8" },
  { name: "Endoplasmic Reticulum", role: "Folds proteins and synthesizes lipids.", color: "#a855f7" },
];

const BiologyLab = () => {
  const [selected, setSelected] = useState(ORGANELLES[0]);

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
        <BiotechRoundedIcon sx={{ fontSize: 16, color: "#84cc16" }} />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>Virtual Biology & Cell Anatomy Microscope</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, overflowY: "auto" }}>
        <Box sx={{ flex: 1, bgcolor: "#0b1320", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9" }}>Select Cellular Structure</Typography>
          {ORGANELLES.map((o) => (
            <Button
              key={o.name}
              onClick={() => setSelected(o)}
              variant={selected.name === o.name ? "contained" : "outlined"}
              sx={{
                justifyContent: "flex-start", textTransform: "none", py: 1, px: 2, borderRadius: "var(--r-md)",
                borderColor: "rgba(255,255,255,0.1)", color: selected.name === o.name ? "#fff" : "var(--text-mid)",
                bgcolor: selected.name === o.name ? "rgba(132,204,22,0.25)" : "transparent"
              }}
            >
              {o.name}
            </Button>
          ))}
        </Box>

        <Box sx={{ flex: 1, bgcolor: "#04070d", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Microscope Inspection</Typography>
          <Box sx={{ p: 2.5, borderRadius: "var(--r-md)", bgcolor: "rgba(132,204,22,0.12)", border: "1px solid rgba(132,204,22,0.3)" }}>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#84cc16", mb: 1 }}>{selected.name}</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#f1f5f9", lineHeight: 1.6 }}>{selected.role}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BiologyLab;

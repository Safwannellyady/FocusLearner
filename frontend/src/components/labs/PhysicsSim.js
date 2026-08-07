import React, { useState } from "react";
import { Box, Typography, Slider, Button } from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";

const PhysicsSim = () => {
  const [gravity, setGravity] = useState(9.8);
  const [length, setLength] = useState(1.5);
  const period = (2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2);

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
        <ScienceRoundedIcon sx={{ fontSize: 16, color: "#a855f7" }} />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>Physics Pendulum & Harmonic Motion Simulator</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, overflowY: "auto" }}>
        <Box sx={{ flex: 1, bgcolor: "#0b1320", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9" }}>Harmonic Oscillator Parameters</Typography>

          <Box>
            <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>Gravity g (m/s²): {gravity}</Typography>
            <Slider value={gravity} min={1.6} max={25} step={0.1} onChange={(e, v) => setGravity(v)} sx={{ color: "#a855f7" }} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>String Length L (meters): {length}m</Typography>
            <Slider value={length} min={0.2} max={5.0} step={0.1} onChange={(e, v) => setLength(v)} sx={{ color: "#a855f7" }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, bgcolor: "#04070d", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Calculated Period T = 2π√(L/g)</Typography>
          <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(168,85,247,0.15)", border: "2px solid #a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.6rem", color: "#a855f7" }}>{period}s</Typography>
          </Box>
          <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)", textAlign: "center" }}>
            Oscillation Period per cycle: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{period} seconds</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PhysicsSim;

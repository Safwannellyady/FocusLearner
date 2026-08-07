import React, { useState } from "react";
import { Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";

const FinanceLab = () => {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7.5);
  const [years, setYears] = useState(5);

  const compoundInterest = principal * Math.pow(1 + rate / 100, years);
  const interestEarned = compoundInterest - principal;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
        <CalculateRoundedIcon sx={{ fontSize: 16, color: "#ec4899" }} />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>Financial & Accounting Calculator</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, overflowY: "auto" }}>
        {/* Input Parameters */}
        <Box sx={{ flex: 1, bgcolor: "#0b1320", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9" }}>Compound Interest & Annuity Simulator</Typography>

          <TextField label="Principal Investment ($)" type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} size="small" fullWidth />
          <TextField label="Annual Interest Rate (%)" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} size="small" fullWidth />
          <TextField label="Investment Duration (Years)" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} size="small" fullWidth />
        </Box>

        {/* Financial Summary */}
        <Box sx={{ flex: 1, bgcolor: "#04070d", p: 2.5, borderRadius: "var(--r-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Calculation Results</Typography>
          <Box sx={{ bgcolor: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "var(--r-md)", p: 2 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-mid)" }}>Future Value (FV)</Typography>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#ec4899" }}>
              ${compoundInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--r-md)", p: 2 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-mid)" }}>Total Interest Earned</Typography>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#10b981" }}>
              +${interestEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FinanceLab;

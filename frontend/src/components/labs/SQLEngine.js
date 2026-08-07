import React, { useState } from "react";
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

const INITIAL_QUERY = `SELECT id, username, email, streak_days FROM users WHERE is_active = true ORDER BY streak_days DESC;`;

const MOCK_ROWS = [
  { id: 1, username: "safwan", email: "safwan@focuslearner.com", streak_days: 14 },
  { id: 2, username: "alex_dev", email: "alex@university.edu", streak_days: 9 },
  { id: 3, username: "jordan_m", email: "jordan@mit.edu", streak_days: 5 },
];

const SQLEngine = () => {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [results, setResults] = useState(MOCK_ROWS);
  const [status, setStatus] = useState("Connected to SQLite WASM DB. 3 rows returned.");

  const handleRun = () => {
    setStatus("Executing SQL Query...");
    setTimeout(() => {
      setResults(MOCK_ROWS);
      setStatus(`Query Executed: 3 rows returned in 0.02s.`);
    }, 300);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StorageRoundedIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>SQL Database Studio (SQLite)</Typography>
        </Box>
        <Button
          size="small"
          onClick={handleRun}
          startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ px: 2, py: 0.4, borderRadius: "var(--r-md)", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: "0.75rem", fontWeight: 800, textTransform: "none" }}
        >
          Run Query
        </Button>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, gap: 2, overflowY: "auto" }}>
        {/* Editor */}
        <Box sx={{ p: 1.5, bgcolor: "#04070d", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-dim)", mb: 1, textTransform: "uppercase" }}>SQL Query Editor</Typography>
          <Box
            component="textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            sx={{ width: "100%", height: 70, border: "none", outline: "none", bgcolor: "transparent", color: "#fbbf24", fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem", resize: "none" }}
          />
        </Box>

        {/* Results Table */}
        <Box sx={{ flex: 1, bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-md)", p: 1.5, display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#10b981", fontFamily: "JetBrains Mono, monospace", mb: 1.5 }}>{status}</Typography>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255,255,255,0.04)" }}>
                <TableCell sx={{ color: "var(--text-mid)", fontWeight: 700, fontSize: "0.75rem" }}>ID</TableCell>
                <TableCell sx={{ color: "var(--text-mid)", fontWeight: 700, fontSize: "0.75rem" }}>Username</TableCell>
                <TableCell sx={{ color: "var(--text-mid)", fontWeight: 700, fontSize: "0.75rem" }}>Email</TableCell>
                <TableCell sx={{ color: "var(--text-mid)", fontWeight: 700, fontSize: "0.75rem" }}>Streak Days</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ color: "#f1f5f9", fontSize: "0.75rem" }}>{r.id}</TableCell>
                  <TableCell sx={{ color: "#fbbf24", fontSize: "0.75rem", fontWeight: 600 }}>{r.username}</TableCell>
                  <TableCell sx={{ color: "var(--text-mid)", fontSize: "0.75rem" }}>{r.email}</TableCell>
                  <TableCell sx={{ color: "#10b981", fontSize: "0.75rem", fontWeight: 700 }}>{r.streak_days} 🔥</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default SQLEngine;

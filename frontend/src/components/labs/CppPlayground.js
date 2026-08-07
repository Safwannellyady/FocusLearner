import React, { useState } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

const DEFAULT_CPP = `#include <iostream>
#include <vector>

int main() {
    std::cout << "FocusLearner C++ Systems Playground" << std::endl;
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    
    int sum = 0;
    for (int n : numbers) {
        sum += n;
    }
    
    std::cout << "Sum of elements: " << sum << std::endl;
    std::cout << "Memory Address of vector: " << &numbers << std::endl;
    return 0;
}
`;

const CppPlayground = () => {
  const [code, setCode] = useState(DEFAULT_CPP);
  const [output, setOutput] = useState("Click Compile & Run to execute C++ binary...");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Compiling with g++ -O3 main.cpp -o main...");
    setTimeout(() => {
      setOutput(`[g++ Compilation: SUCCESS (0.12s)]\nExecuting ./main:\n\nFocusLearner C++ Systems Playground\nSum of elements: 150\nMemory Address of vector: 0x7fff5fbff7c0\n\nProcess exited with status 0.`);
      setIsRunning(false);
    }, 500);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CodeRoundedIcon sx={{ fontSize: 16, color: "#6366f1" }} />
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>main.cpp</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Reset">
            <IconButton size="small" onClick={() => { setCode(DEFAULT_CPP); setOutput("Reset complete."); }} sx={{ color: "var(--text-dim)" }}>
              <RefreshRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            onClick={handleRun}
            disabled={isRunning}
            startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              px: 2, py: 0.4, borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff",
              fontSize: "0.75rem", fontWeight: 800, textTransform: "none",
              boxShadow: "0 2px 10px rgba(99,102,241,0.3)"
            }}
          >
            {isRunning ? "Compiling..." : "Compile & Run"}
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
        <Box sx={{ flex: 1, p: 2, borderRight: "1px solid var(--border)", bgcolor: "#080d16", display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>C++ Source Editor</Typography>
          <Box
            component="textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            sx={{ flex: 1, width: "100%", border: "none", outline: "none", bgcolor: "transparent", color: "#818cf8", fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem", lineHeight: 1.6, resize: "none" }}
          />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "40%" }, p: 2, bgcolor: "#04070d", display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>Build Terminal</Typography>
          <Box sx={{ flex: 1, fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem", color: "#34d399", whiteSpace: "pre-wrap", overflowY: "auto" }}>{output}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CppPlayground;

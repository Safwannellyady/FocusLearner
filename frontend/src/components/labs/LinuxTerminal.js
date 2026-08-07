import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";

const INITIAL_LOGS = [
  "FocusLearner Linux Security Sandbox v3.0 (x86_64-pc-linux-gnu)",
  "Type 'help', 'ls', 'whoami', 'ifconfig', 'nmap', or 'clear' to execute commands.",
  ""
];

const LinuxTerminal = () => {
  const [history, setHistory] = useState(INITIAL_LOGS);
  const [cmd, setCmd] = useState("");

  const handleCommand = (e) => {
    if (e.key === "Enter" && cmd.trim()) {
      const input = cmd.trim();
      const promptLine = `student@focuslearner-lab:~$ ${input}`;
      let responseLines = [];

      switch (input.toLowerCase()) {
        case "help":
          responseLines = [
            "Available Commands:",
            "  ls          - List directory contents",
            "  whoami      - Display current user role",
            "  ifconfig    - Show network interfaces",
            "  nmap        - Scan open ports",
            "  uname -a    - Show kernel information",
            "  clear       - Clear terminal history"
          ];
          break;
        case "ls":
          responseLines = ["notes.txt  cyber_lab/  network_scan.pcap  security_audit.sh"];
          break;
        case "whoami":
          responseLines = ["root (Cybersecurity Researcher)"];
          break;
        case "ifconfig":
          responseLines = [
            "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500",
            "        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255"
          ];
          break;
        case "nmap":
        case "nmap localhost":
          responseLines = [
            "Starting Nmap 7.94 ( https://nmap.org )",
            "Nmap scan report for localhost (127.0.0.1)",
            "PORT     STATE SERVICE",
            "22/tcp   open  ssh",
            "80/tcp   open  http",
            "5001/tcp open  focuslearner-api"
          ];
          break;
        case "uname -a":
          responseLines = ["Linux focuslearner-lab 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC GNU/Linux"];
          break;
        case "clear":
          setHistory([]);
          setCmd("");
          return;
        default:
          responseLines = [`bash: ${input}: command not found. Type 'help' for available commands.`];
      }

      setHistory((prev) => [...prev, promptLine, ...responseLines, ""]);
      setCmd("");
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#04070d", fontFamily: "JetBrains Mono, monospace" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid var(--border)", bgcolor: "#0b1320", display: "flex", alignItems: "center", gap: 1 }}>
        <TerminalRoundedIcon sx={{ fontSize: 16, color: "#10b981" }} />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>Linux Shell Terminal (student@focuslearner)</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {history.map((line, idx) => (
          <Typography key={idx} sx={{ fontSize: "0.78rem", color: line.startsWith("student@") ? "#38bdf8" : line.startsWith("bash:") ? "#f87171" : "#10b981", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {line}
          </Typography>
        ))}

        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#38bdf8", mr: 1, fontWeight: 700 }}>
            student@focuslearner-lab:~$
          </Typography>
          <Box
            component="input"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={handleCommand}
            autoFocus
            sx={{ flex: 1, border: "none", outline: "none", bgcolor: "transparent", color: "#f1f5f9", fontFamily: "inherit", fontSize: "0.78rem" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LinuxTerminal;

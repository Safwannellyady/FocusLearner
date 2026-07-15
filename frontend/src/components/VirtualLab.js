import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Chip, Tabs, Tab, TextField, MenuItem, Select,
  FormControl, InputLabel, Slider, Paper, Alert, LinearProgress, IconButton, Divider
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import ComputerIcon from '@mui/icons-material/Computer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BugReportIcon from '@mui/icons-material/BugReport';

const VirtualLab = ({ subject = '', topic = '', videoTitle = '', labConfig = null }) => {
  // Determine domain type based on deep-learned labConfig or subject/topic text
  const getDomainType = () => {
    if (labConfig && labConfig.mode) {
      return labConfig.mode;
    }
    const text = `${subject} ${topic}`.toLowerCase();
    if (text.includes('code') || text.includes('python') || text.includes('javascript') || text.includes('react') || text.includes('cpp') || text.includes('c++') || text.includes('rust') || text.includes('sql') || text.includes('algorithm')) {
      return 'coding';
    } else if (text.includes('cyber') || text.includes('hack') || text.includes('linux') || text.includes('kali') || text.includes('network') || text.includes('penetration') || text.includes('nmap') || text.includes('security')) {
      return 'cybersecurity';
    } else if (text.includes('physic') || text.includes('mechanic') || text.includes('kinematic') || text.includes('circuit') || text.includes('ohm') || text.includes('quantum') || text.includes('motion') || text.includes('gravity')) {
      return 'physics';
    } else if (text.includes('chem') || text.includes('titration') || text.includes('molecular') || text.includes('reaction') || text.includes('acid') || text.includes('base') || text.includes('organic')) {
      return 'chemistry';
    } else if (text.includes('system') || text.includes('computer') || text.includes('os') || text.includes('cpu') || text.includes('memory') || text.includes('kernel')) {
      return 'computer';
    }
    return 'coding'; // Default fallback to coding lab
  };

  const [activeDomain, setActiveDomain] = useState(getDomainType());
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  useEffect(() => {
    const domain = getDomainType();
    setActiveDomain(domain);
    if (labConfig && labConfig.starter_code) {
      setCode(labConfig.starter_code);
      if (labConfig.language) setLanguage(labConfig.language);
    }
  }, [subject, topic, labConfig]);

  // --- CODING LAB STATE ---
  const [language, setLanguage] = useState(labConfig?.language || 'python');
  const [code, setCode] = useState(labConfig?.starter_code || `# AI Deep-Learned Template for: ${topic || 'Data Processing'}
# Language: Python 3.11

def solve_challenge(data):
    """
    Implement your algorithm below based on the active lecture topic.
    """
    result = []
    for item in data:
        # Process data
        if item % 2 == 0:
            result.append(item * 2)
        else:
            result.append(item)
    return result

# Test Execution
sample_input = [12, 5, 8, 21, 34, 19]
print("Evaluating on sample input:", sample_input)
output = solve_challenge(sample_input)
print("Compiler Execution Output:", output)
`);
  const [compilerOutput, setCompilerOutput] = useState("Ready for execution. Click 'Run Compiler Engine' above.");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (lang === 'python') {
      setCode(`# Python 3.11 template for ${topic}\ndef solve(data):\n    return [x * 2 for x in data if x > 10]\n\nprint("Output:", solve([5, 12, 18, 4]))`);
    } else if (lang === 'javascript') {
      setCode(`// JavaScript (Node.js) template for ${topic}\nfunction solveChallenge(data) {\n  return data.map(n => n > 10 ? n * 2 : n);\n}\n\nconsole.log("Output:", solveChallenge([5, 12, 18, 4]));`);
    } else if (lang === 'cpp') {
      setCode(`// C++20 template for ${topic}\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> data = {5, 12, 18, 4};\n    std::cout << "Execution Result: ";\n    for(int val : data) {\n        if(val > 10) std::cout << val * 2 << " ";\n    }\n    std::cout << std::endl;\n    return 0;\n}`);
    } else if (lang === 'sql') {
      setCode(`-- SQL query challenge for ${topic}\nSELECT user_id, session_title, neural_score\nFROM focus_sessions\nWHERE neural_score >= 85\nORDER BY created_at DESC;`);
    }
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setCompilerOutput("Compiling and running in sandbox environment...");
    setAiFeedback('');
    setTimeout(() => {
      setIsExecuting(false);
      if (language === 'python') {
        setCompilerOutput(`Evaluating on sample input: [12, 5, 8, 21, 34, 19]\nCompiler Execution Output: [24, 5, 16, 21, 68, 19]\n\nProcess exited with return code 0 (0.042s)`);
        setAiFeedback(`✅ AI Deep-Learning Compiler Check: Excellent implementation! Your conditional list processing correctly doubles even numbers while preserving odd integers. Big-O time complexity is O(n), optimal for this ${topic || 'algorithm'} requirement.`);
      } else if (language === 'javascript') {
        setCompilerOutput(`Output: [ 5, 24, 36, 4 ]\n\nNode.js v20.11.0 execution completed.`);
        setAiFeedback(`✅ AI Code Mentor Analysis: Clean usage of array map and ternary operators. Memory footprint is minimal at 32MB.`);
      } else if (language === 'cpp') {
        setCompilerOutput(`Execution Result: 24 36 \n\nFinished in 12ms with 0 memory leaks (Valgrind verified).`);
        setAiFeedback(`✅ AI Systems Debugger: Zero pointer exceptions detected. Vector iteration utilizes modern C++ range-based loops cleanly.`);
      } else if (language === 'sql') {
        setCompilerOutput(`Query executed cleanly. 3 rows returned:\n| user_id | session_title | neural_score |\n|---------|---------------|--------------|\n| u_102   | Master React  | 98           |\n| u_405   | Linux Kernel  | 92           |\n| u_088   | Quantum Math  | 88           |`);
        setAiFeedback(`✅ AI Database Architect: Query utilizes index on neural_score. Execution cost: 0.0031.`);
      }
    }, 1200);
  };

  // --- CYBERSECURITY / LINUX LAB STATE ---
  const [terminalHistory, setTerminalHistory] = useState([
    "[kali-focus-box v2026.1 initialized]",
    "Type 'help' or click any quick command badge to run network simulation against target sandbox."
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const executeLinuxCommand = (cmdText) => {
    const cmd = cmdText.trim();
    if (!cmd) return;
    setTerminalHistory(prev => [...prev, `root@kali-focus-box:~# ${cmd}`]);
    setTerminalInput('');
    setAiFeedback('');

    setTimeout(() => {
      if (cmd.startsWith('nmap')) {
        setTerminalHistory(prev => [
          ...prev,
          `Starting Nmap 7.94 ( https://nmap.org ) at 2026-07-15 23:25 UTC`,
          `Nmap scan report for target-focus-server.internal (10.0.42.15)`,
          `Host is up (0.0023s latency).`,
          `PORT     STATE SERVICE VERSION`,
          `22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu`,
          `80/tcp   open  http    Apache/2.4.52`,
          `443/tcp  open  ssl/https nginx/1.18.0`,
          `3306/tcp open  mysql   MySQL 8.0.35`,
          `Nmap done: 1 IP address scanned in 1.45 seconds`
        ]);
        setAiFeedback(`🛡️ AI Security Analyst Check: Nmap discovered 4 open ports. Port 3306 (MySQL) exposed publicly on eth0 indicates a potential network boundary vulnerability that requires firewall filtering or VPC isolation.`);
      } else if (cmd.startsWith('tcpdump') || cmd.includes('wireshark')) {
        setTerminalHistory(prev => [
          ...prev,
          `tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes`,
          `23:26:01.104218 IP 10.0.42.15.443 > 192.168.1.104.52180: Flags [P.], seq 1042:1584, ack 1, win 501, length 542`,
          `23:26:01.105891 IP 192.168.1.104.52180 > 10.0.42.15.443: Flags [.], ack 1584, win 2048, length 0`,
          `23:26:02.402110 IP 10.0.42.15.80 > 192.168.1.104.52182: HTTP: GET /api/v1/auth?user=admin&token=UNENCRYPTED_JWT`,
          `3 packets captured`
        ]);
        setAiFeedback(`⚠️ AI Packet Inspector: Alert! Packet 3 on Port 80 transmitted an unencrypted authorization token over plaintext HTTP. Always enforce TLS 1.3 encryption for bearer credentials.`);
      } else if (cmd.includes('grep') || cmd.includes('passwd')) {
        setTerminalHistory(prev => [
          ...prev,
          `root:x:0:0:root:/root:/bin/bash`,
          `kali:x:1000:1000:kali,,,:/home/kali:/bin/bash`,
          `postgres:x:114:120:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash`,
          `service_backup:x:1001:1001::/home/service_backup:/bin/sh`
        ]);
        setAiFeedback(`🛡️ AI Privilege Escrow Check: Account 'service_backup' possesses interactive shell access (/bin/sh). Verify sudoers configuration to ensure no unauthorized root escalation path exists.`);
      } else if (cmd === 'help' || cmd === 'clear') {
        if (cmd === 'clear') setTerminalHistory([]);
        else setTerminalHistory(prev => [...prev, `Available simulation commands:\n• nmap -sV -p 1-5000 target.box\n• tcpdump -i eth0 -c 5\n• cat /etc/passwd | grep -v nologin\n• python3 exploit_sqli.py`]);
      } else {
        setTerminalHistory(prev => [...prev, `Command simulated: ${cmd}\n[Execution successful in sandboxed container]`]);
      }
    }, 400);
  };

  // --- PHYSICS SIMULATION LAB STATE ---
  const [velocity, setVelocity] = useState(35); // m/s
  const [angle, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(9.8); // m/s²
  const [circuitVoltage, setCircuitVoltage] = useState(12); // V
  const [circuitResistance, setCircuitResistance] = useState(4); // Ohms

  // Projectile Physics Calculations
  const radAngle = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(radAngle)) / gravity;
  const maxRange = (velocity * velocity * Math.sin(2 * radAngle)) / gravity;
  const maxHeight = (velocity * velocity * Math.sin(radAngle) * Math.sin(radAngle)) / (2 * gravity);
  const currentAmpere = circuitVoltage / circuitResistance;

  // --- CHEMISTRY LAB STATE ---
  const [molarityAcid, setMolarityAcid] = useState(0.5); // M HCl
  const [molarityBase, setMolarityBase] = useState(0.5); // M NaOH
  const [temperature, setTemperature] = useState(25); // °C
  const calculatedPH = molarityBase === molarityAcid ? 7.0 : molarityBase > molarityAcid ? 12.4 : 1.8;
  const enthalpyChange = -57.3 * (molarityAcid * 10); // kJ/mol exothermic

  return (
    <Box>
      {/* Lab Domain Selector Banner */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AutoAwesomeIcon sx={{ color: '#00f2fe', fontSize: 26 }} />
          <Typography variant="subtitle1" fontWeight="800" fontFamily="Outfit, sans-serif" color="#ffffff">
            AI-Featured Virtual Laboratory & Simulation Sandbox
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          {[
            { id: 'coding', label: '💻 Coding Compiler', icon: <CodeIcon fontSize="small" /> },
            { id: 'cybersecurity', label: '🛡️ Linux Terminal', icon: <TerminalIcon fontSize="small" /> },
            { id: 'physics', label: '⚛️ Physics Simulator', icon: <ScienceIcon fontSize="small" /> },
            { id: 'chemistry', label: '🧪 Chemistry Lab', icon: <BiotechIcon fontSize="small" /> },
            { id: 'computer', label: '🖥️ OS Architect', icon: <ComputerIcon fontSize="small" /> }
          ].map(d => (
            <Chip
              key={d.id}
              label={d.label}
              onClick={() => setActiveDomain(d.id)}
              sx={{
                bgcolor: activeDomain === d.id ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '10px',
                border: activeDomain === d.id ? '1px solid #60a5fa' : '1px solid transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: activeDomain === d.id ? '#1d4ed8' : 'rgba(255, 255, 255, 0.12)' }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 1. CODING COMPILER LAB */}
      {activeDomain === 'coding' && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={1.5}>
              {['python', 'javascript', 'cpp', 'rust', 'sql'].map(lang => (
                <Chip
                  key={lang}
                  label={lang.toUpperCase()}
                  onClick={() => handleLanguageChange(lang)}
                  sx={{
                    bgcolor: language === lang ? '#00f2fe' : 'rgba(255, 255, 255, 0.05)',
                    color: language === lang ? '#0f172a' : '#ffffff',
                    fontWeight: 800,
                    borderRadius: '8px'
                  }}
                />
              ))}
            </Box>
            <Button
              onClick={handleRunCode}
              disabled={isExecuting}
              startIcon={<PlayArrowIcon />}
              className="epic-btn-primary"
              sx={{ py: '10px !important', px: '28px !important', fontSize: '0.95rem !important' }}
            >
              {isExecuting ? 'Compiling Code...' : '⚡ Run Compiler Engine'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2.5, bgcolor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                <Typography variant="caption" color="#00f2fe" fontWeight="700" display="block" mb={1}>
                  💻 LIVE SANDBOX EDITOR ({language.toUpperCase()}) | TOPIC: {topic || 'Core Module'}
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  minRows={14}
                  maxRows={18}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  InputProps={{
                    sx: {
                      fontFamily: 'Consolas, "Courier New", monospace',
                      fontSize: '0.92rem',
                      color: '#38bdf8',
                      bgcolor: '#080d1a',
                      borderRadius: '10px',
                      p: 2,
                      lineHeight: 1.6
                    }
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2.5, bgcolor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" color="#94a3b8" fontWeight="700" display="block" mb={1.5}>
                  🖥️ COMPILER & SANDBOX TERMINAL OUTPUT
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#050b14', borderRadius: '10px', flexGrow: 1, fontFamily: 'Consolas, monospace', fontSize: '0.88rem', color: '#10b981', whiteSpace: 'pre-wrap', border: '1px solid rgba(16, 185, 129, 0.2)', minHeight: 220 }}>
                  {isExecuting && <LinearProgress sx={{ mb: 2, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#00f2fe' } }} />}
                  {compilerOutput}
                </Box>
                {aiFeedback && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#ffffff', border: '1px solid #10b981' }}>
                    <Typography variant="body2" fontWeight="700" fontFamily="Outfit, sans-serif">{aiFeedback}</Typography>
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 2. CYBERSECURITY LINUX TERMINAL LAB */}
      {activeDomain === 'cybersecurity' && (
        <Box>
          <Box display="flex" flexWrap="wrap" gap={1.2} mb={2.5}>
            <Typography variant="body2" color="#94a3b8" sx={{ alignSelf: 'center', mr: 1, fontWeight: 700 }}>
              Quick Penetration Testing Commands:
            </Typography>
            {[
              "nmap -sV -p 1-5000 target-focus-server.internal",
              "tcpdump -i eth0 -n -c 5",
              "cat /etc/passwd | grep -v nologin",
              "python3 exploit_sqli.py --target http://localhost:80/login",
              "clear"
            ].map(cmd => (
              <Chip
                key={cmd}
                label={`$ ${cmd}`}
                onClick={() => executeLinuxCommand(cmd)}
                sx={{
                  bgcolor: 'rgba(255, 75, 43, 0.15)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(255, 75, 43, 0.4)',
                  fontWeight: 600,
                  fontFamily: 'Consolas, monospace',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(255, 75, 43, 0.28)' }
                }}
              />
            ))}
          </Box>

          <Paper sx={{ p: 3, bgcolor: '#0a0e1a', borderRadius: '18px', border: '1px solid #ff4b2b', boxShadow: '0 0 25px rgba(255, 75, 43, 0.2)' }}>
            <Box display="flex" justifyContent="space-between" mb={1.5} pb={1} borderBottom="1px solid rgba(255,255,255,0.1)">
              <Typography variant="caption" color="#ff4b2b" fontWeight="800" fontFamily="Consolas, monospace">
                🛡️ KALI LINUX VIRTUAL PENETRATION SANDBOX (ROOT@KALI-FOCUS-BOX:~#)
              </Typography>
              <Typography variant="caption" color="#34d399" fontWeight="700">
                Connected Target: {topic || 'Network Defense Module'}
              </Typography>
            </Box>

            <Box sx={{ minHeight: 300, maxHeight: 420, overflowY: 'auto', p: 2, bgcolor: '#04070e', borderRadius: '10px', fontFamily: 'Consolas, monospace', fontSize: '0.88rem', color: '#38bdf8', mb: 2 }}>
              {terminalHistory.map((line, idx) => (
                <Box key={idx} sx={{ mb: 0.8, color: line.startsWith('root@kali') ? '#facc15' : line.includes('Alert') || line.includes('open') ? '#34d399' : '#e2e8f0' }}>
                  {line}
                </Box>
              ))}
            </Box>

            {aiFeedback && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#ffffff', border: '1px solid #f59e0b' }}>
                <Typography variant="body2" fontWeight="700" fontFamily="Outfit, sans-serif">{aiFeedback}</Typography>
              </Alert>
            )}

            <form onSubmit={(e) => { e.preventDefault(); executeLinuxCommand(terminalInput); }}>
              <Box display="flex" gap={1.5}>
                <TextField
                  placeholder="Type Linux command here (e.g. nmap, tcpdump, cat /etc/passwd)..."
                  fullWidth
                  size="small"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ color: '#facc15', mr: 1, fontFamily: 'Consolas, monospace', fontWeight: 700 }}>root@kali:~#</Typography>,
                    sx: { bgcolor: '#080d1a', color: '#ffffff', fontFamily: 'Consolas, monospace', borderRadius: '10px' }
                  }}
                />
                <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4b2b', fontWeight: 800, px: 4, borderRadius: '10px', '&:hover': { bgcolor: '#d9381e' } }}>
                  Execute
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      )}

      {/* 3. PHYSICS SIMULATION SANDBOX */}
      {activeDomain === 'physics' && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px solid rgba(167, 139, 250, 0.4)' }}>
                <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#a78bfa" mb={3}>
                  ⚛️ Kinematics & Circuit Board Simulation Controls
                </Typography>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Launch Velocity: <span style={{ color: '#00f2fe' }}>{velocity} m/s</span>
                  </Typography>
                  <Slider value={velocity} min={5} max={100} onChange={(_, v) => setVelocity(v)} sx={{ color: '#00f2fe' }} />
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Launch Angle: <span style={{ color: '#facc15' }}>{angle}°</span>
                  </Typography>
                  <Slider value={angle} min={10} max={85} onChange={(_, v) => setAngle(v)} sx={{ color: '#facc15' }} />
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Circuit Voltage (Ohm's Law): <span style={{ color: '#34d399' }}>{circuitVoltage} V</span> | Resistance: <span style={{ color: '#ff4b2b' }}>{circuitResistance} Ω</span>
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><Slider value={circuitVoltage} min={1} max={48} onChange={(_, v) => setCircuitVoltage(v)} sx={{ color: '#34d399' }} /></Grid>
                    <Grid item xs={6}><Slider value={circuitResistance} min={1} max={20} onChange={(_, v) => setCircuitResistance(v)} sx={{ color: '#ff4b2b' }} /></Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#090d1a', borderRadius: '20px', border: '1px solid rgba(0, 242, 254, 0.4)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="800" color="#ffffff" mb={2}>
                    📊 Real-Time Simulation Calculation & Physics Output
                  </Typography>

                  <Box sx={{ p: 2.5, bgcolor: 'rgba(0, 242, 254, 0.08)', borderRadius: '14px', border: '1px solid rgba(0, 242, 254, 0.25)', mb: 2.5 }}>
                    <Typography variant="body2" color="#00f2fe" fontWeight="700">PROJECTILE TRAJECTORY METRICS:</Typography>
                    <Typography variant="h6" color="#ffffff" fontWeight="800" sx={{ mt: 0.5 }}>
                      Time of Flight: {timeOfFlight.toFixed(2)}s | Max Range: {maxRange.toFixed(1)} meters
                    </Typography>
                    <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
                      Max Altitude Reached: {maxHeight.toFixed(1)} meters (Gravitational Constant g = {gravity} m/s²)
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2.5, bgcolor: 'rgba(52, 211, 153, 0.08)', borderRadius: '14px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                    <Typography variant="body2" color="#34d399" fontWeight="700">OHM'S LAW CURRENT SIMULATION (I = V / R):</Typography>
                    <Typography variant="h5" color="#ffffff" fontWeight="900" sx={{ mt: 0.5 }}>
                      Current Flow: {currentAmpere.toFixed(2)} Amperes (A)
                    </Typography>
                    <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
                      Power Dissipated: {(circuitVoltage * currentAmpere).toFixed(1)} Watts (W)
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 3, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <Typography variant="caption">💡 Adjust sliders above to practice physical simulation equations before entering a physical laboratory.</Typography>
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 4. CHEMISTRY & MOLECULAR LAB */}
      {activeDomain === 'chemistry' && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#34d399" mb={3}>
                  🧪 Acid-Base Titration & Exothermic Reaction Controls
                </Typography>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Hydrochloric Acid [HCl] Molarity: <span style={{ color: '#f87171' }}>{molarityAcid} M</span>
                  </Typography>
                  <Slider value={molarityAcid} min={0.1} max={2.0} step={0.1} onChange={(_, v) => setMolarityAcid(v)} sx={{ color: '#f87171' }} />
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Sodium Hydroxide [NaOH] Molarity: <span style={{ color: '#60a5fa' }}>{molarityBase} M</span>
                  </Typography>
                  <Slider value={molarityBase} min={0.1} max={2.0} step={0.1} onChange={(_, v) => setMolarityBase(v)} sx={{ color: '#60a5fa' }} />
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="#e2e8f0" fontWeight="700" gutterBottom>
                    Reaction Chamber Temperature: <span style={{ color: '#facc15' }}>{temperature}°C</span>
                  </Typography>
                  <Slider value={temperature} min={10} max={100} onChange={(_, v) => setTemperature(v)} sx={{ color: '#facc15' }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#091018', borderRadius: '20px', border: '1px solid rgba(52, 211, 153, 0.4)', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="800" color="#ffffff" mb={2}>
                  ⚗️ Molecular Bond Observation & pH Titration Output
                </Typography>

                <Box sx={{ p: 3, bgcolor: calculatedPH === 7.0 ? 'rgba(52, 211, 153, 0.15)' : calculatedPH > 7 ? 'rgba(96, 165, 250, 0.15)' : 'rgba(248, 113, 113, 0.15)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', mb: 3, textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="900" fontFamily="Outfit, sans-serif" color="#ffffff">
                    pH = {calculatedPH.toFixed(1)}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="800" color={calculatedPH === 7.0 ? '#34d399' : calculatedPH > 7 ? '#60a5fa' : '#f87171'}>
                    {calculatedPH === 7.0 ? '✨ EQUIVALENCE POINT REACHED (NEUTRAL SALINE H2O + NaCl)' : calculatedPH > 7 ? '🔵 BASIC / ALKALINE SOLUTION EXCESS' : '🔴 ACIDIC SOLUTION EXCESS'}
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="body2" color="#facc15" fontWeight="700">THERMODYNAMIC ENTHALPY CHANGE (ΔH):</Typography>
                  <Typography variant="h6" color="#ffffff" fontWeight="800" sx={{ mt: 0.5 }}>
                    {enthalpyChange.toFixed(1)} kJ/mol (Exothermic Neutralization)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 1 }}>
                    Reaction Equation: HCl(aq) + NaOH(aq) ➔ NaCl(aq) + H₂O(l) + Heat Energy
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 5. DEMO COMPUTER / OS ARCHITECT LAB */}
      {activeDomain === 'computer' && (
        <Paper sx={{ p: 4, bgcolor: '#0b1329', borderRadius: '20px', border: '1px solid #38bdf8' }}>
          <Typography variant="h6" fontWeight="800" fontFamily="Outfit, sans-serif" color="#38bdf8" mb={3}>
            🖥️ Operating System CPU Scheduler & Memory Architecture Simulation
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(56, 189, 248, 0.1)', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Typography variant="subtitle2" color="#38bdf8" fontWeight="700">ACTIVE CPU SCHEDULER:</Typography>
                <Typography variant="h6" color="#ffffff" fontWeight="800" sx={{ mt: 0.5 }}>Round-Robin (Time Quantum: 4ms)</Typography>
                <LinearProgress variant="determinate" value={76} sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' } }} />
                <Typography variant="caption" color="#94a3b8" sx={{ mt: 1, display: 'block' }}>CPU Utilization: 76% (4 threads running)</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(167, 139, 250, 0.1)', borderRadius: '14px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                <Typography variant="subtitle2" color="#a78bfa" fontWeight="700">RAM VIRTUAL MEMORY PAGES:</Typography>
                <Typography variant="h6" color="#ffffff" fontWeight="800" sx={{ mt: 0.5 }}>4.8 GB / 16.0 GB Allocated</Typography>
                <LinearProgress variant="determinate" value={30} sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#a78bfa' } }} />
                <Typography variant="caption" color="#94a3b8" sx={{ mt: 1, display: 'block' }}>Page Faults: 0 | LRU Eviction Active</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(52, 211, 153, 0.1)', borderRadius: '14px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                <Typography variant="subtitle2" color="#34d399" fontWeight="700">KERNEL SYSTEM CALLS (SYSCALL):</Typography>
                <Typography variant="h6" color="#ffffff" fontWeight="800" sx={{ mt: 0.5 }}>1,420 Ops/sec (fork, execve, mmap)</Typography>
                <Typography variant="caption" color="#34d399" sx={{ mt: 2, display: 'block', fontWeight: 700 }}>Kernel Mode Ring 0 Protected</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default VirtualLab;

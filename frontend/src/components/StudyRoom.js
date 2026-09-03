import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, TextField, IconButton, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Drawer, CircularProgress
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { roomAPI } from "../services/api";

const StudyRoom = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Create form state
  const [createTitle, setCreateTitle] = useState("Engineering Focus Arena");
  const [createSubject, setCreateSubject] = useState("Computer Science");
  const [createDuration, setCreateDuration] = useState(25);
  const [isCreating, setIsCreating] = useState(false);

  // Join form state
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Room status & chat state
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Poll room status every 3 seconds when in an active room
  useEffect(() => {
    if (!activeRoom) return;
    const pollInterval = setInterval(async () => {
      try {
        const [statusRes, msgRes] = await Promise.allSettled([
          roomAPI.getStatus(activeRoom.room_code),
          roomAPI.getMessages(activeRoom.room_code)
        ]);

        if (statusRes.status === "fulfilled") {
          setRoomData(statusRes.value?.data?.room || null);
        }
        if (msgRes.status === "fulfilled") {
          setMessages(msgRes.value?.data?.messages || []);
        }
      } catch (err) {
        console.error("Room poll error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeRoom]);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const res = await roomAPI.create({
        title: createTitle,
        subject_focus: createSubject,
        target_duration: createDuration
      });
      const room = res?.data?.room;
      if (room) {
        setActiveRoom(room);
        setRoomData(room);
        setCreateOpen(false);
      }
    } catch (err) {
      console.error("Create room error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    setIsJoining(true); setJoinError("");
    try {
      const res = await roomAPI.join(joinCode);
      const room = res?.data?.room;
      if (room) {
        setActiveRoom(room);
        setRoomData(room);
        setJoinOpen(false);
      }
    } catch (err) {
      setJoinError(err.response?.data?.error || "Invalid room code or inactive room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeRoom) return;
    const msg = chatInput.trim();
    setChatInput("");
    try {
      await roomAPI.sendMessage(activeRoom.room_code, msg);
      const msgRes = await roomAPI.getMessages(activeRoom.room_code);
      setMessages(msgRes?.data?.messages || []);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.room_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16", p: { xs: 2, md: 3 } }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-md)", bgcolor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GroupsRoundedIcon sx={{ fontSize: 20, color: "var(--emerald)" }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9", lineHeight: 1.1 }}>
              Collaborative Peer Study Rooms
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              {activeRoom ? `Connected to ${activeRoom.title}` : "Join or create a live study arena"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small" variant="outlined"
            onClick={() => setJoinOpen(true)}
            startIcon={<LoginRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: "var(--r-md)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-mid)", fontSize: "0.78rem", textTransform: "none" }}
          >
            Join Room
          </Button>
          <Button
            size="small" variant="contained"
            onClick={() => setCreateOpen(true)}
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: "var(--r-md)", background: "var(--grad-primary)", fontSize: "0.78rem", fontWeight: 800, textTransform: "none" }}
          >
            Create Arena
          </Button>
        </Box>
      </Box>

      {/* Main Room View or Empty State */}
      {!activeRoom ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", textAlign: "center" }}>
          <GroupsRoundedIcon sx={{ fontSize: 56, color: "rgba(16,185,129,0.3)", mb: 2 }} />
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#f1f5f9", mb: 0.5 }}>
            No Active Study Room
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)", maxWidth: 420, mb: 3 }}>
            Create a live Pomodoro study arena or enter a room code from a classmate to study together with real-time peer presence and group chat.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setJoinOpen(true)} sx={{ borderRadius: "var(--r-md)", color: "#f1f5f9", borderColor: "var(--border)" }}>
              Join with Code
            </Button>
            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ borderRadius: "var(--r-md)", background: "var(--grad-primary)", fontWeight: 700 }}>
              Create New Room
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Active Room Header Card */}
          <Box sx={{ p: 2.5, bgcolor: "#0b1320", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9" }}>
                  {roomData?.title || activeRoom.title}
                </Typography>
                <Chip label={roomData?.subject_focus || activeRoom.subject_focus} size="small" sx={{ bgcolor: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 700, fontSize: "0.68rem" }} />
              </Box>
              <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                Pomodoro Duration: {activeRoom.target_duration} mins · Host ID: #{activeRoom.created_by}
              </Typography>
            </Box>

            {/* Room Code Badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ px: 2, py: 0.75, borderRadius: "var(--r-md)", bgcolor: "rgba(0,0,0,0.4)", border: "1px dashed rgba(16,185,129,0.5)", display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Room Code:</Typography>
                <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 900, fontSize: "1rem", color: "var(--emerald)" }}>
                  {activeRoom.room_code}
                </Typography>
                <IconButton size="small" onClick={handleCopyCode} sx={{ color: "var(--text-mid)" }}>
                  {copiedCode ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "var(--emerald)" }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Box>

              <Button
                size="small" variant="contained"
                onClick={() => setChatOpen(p => !p)}
                startIcon={<ChatRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", fontWeight: 700 }}
              >
                Chat ({messages.length})
              </Button>
            </Box>
          </Box>

          {/* Active Peers Grid */}
          <Box sx={{ flex: 1, bgcolor: "#04070d", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: 2.5, display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
              Active Study Peers ({(roomData?.participants || []).length || 1})
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
              {(roomData?.participants || [{ user_id: activeRoom.created_by, is_focused: true, current_streak: 1 }]).map((p, idx) => (
                <Box key={idx} sx={{ p: 2, borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: "var(--indigo)", width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700 }}>
                    P{p.user_id}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>
                      Peer User #{p.user_id}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.2 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: p.is_focused ? "var(--emerald)" : "var(--amber)" }} />
                      <Typography sx={{ fontSize: "0.72rem", color: p.is_focused ? "var(--emerald)" : "var(--amber)", fontWeight: 600 }}>
                        {p.is_focused ? "In Focus Lock" : "Break"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Room Chat Drawer */}
      <Drawer anchor="right" open={chatOpen} onClose={() => setChatOpen(false)} PaperProps={{ sx: { width: 340, bgcolor: "#090d16", borderLeft: "1px solid var(--border)", p: 2, display: "flex", flexDirection: "column" } }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9", mb: 2 }}>
          Room Chat
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {messages.map((m, idx) => (
            <Box key={idx} sx={{ p: 1.25, borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--indigo-lt)" }}>User #{m.user_id}</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#f1f5f9", mt: 0.2 }}>{m.message}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField size="small" fullWidth placeholder="Type message…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} />
          <IconButton onClick={handleSendMessage} sx={{ bgcolor: "var(--indigo)", color: "#fff", "&:hover": { bgcolor: "var(--indigo-lt)" } }}>
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Drawer>

      {/* Create Room Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340, p: 1 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9" }}>Create Study Arena</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Arena Title" value={createTitle} onChange={e => setCreateTitle(e.target.value)} size="small" fullWidth />
          <TextField label="Subject Focus" value={createSubject} onChange={e => setCreateSubject(e.target.value)} size="small" fullWidth />
          <TextField label="Pomodoro Duration (Minutes)" type="number" value={createDuration} onChange={e => setCreateDuration(Number(e.target.value))} size="small" fullWidth />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRoom} disabled={isCreating} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {isCreating ? "Creating..." : "Create Arena"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Room Modal */}
      <Dialog open={joinOpen} onClose={() => setJoinOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340, p: 1 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9" }}>Join Study Arena</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {joinError && <Typography sx={{ fontSize: "0.78rem", color: "var(--rose)" }}>{joinError}</Typography>}
          <TextField label="Enter 6-Character Room Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} size="small" fullWidth placeholder="e.g. FOCUS-8921" />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setJoinOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleJoinRoom} disabled={isJoining || !joinCode.trim()} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {isJoining ? "Joining..." : "Join Room"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyRoom;

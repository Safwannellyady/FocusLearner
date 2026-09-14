import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Button, TextField, IconButton, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert
} from "@mui/material";
import {
  GroupsRounded, SendRounded, MoreVertRounded,
  EditRounded, PersonAddRounded, DeleteRounded, ShieldRounded,
  ImageRounded, ContentPasteRounded, CheckCircleRounded,
  CloseRounded
} from "@mui/icons-material";
import { roomAPI } from "../services/api";

const EMOJI_AVATARS = ["📚","🎓","🔬","💻","🧮","📐","🧪","📝","🎯","💡","🚀","⚡","🔥","🌟","🎨","🎵","🏆","📊","🔍","🧠"];

const StudyRoom = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Create form
  const [createTitle, setCreateTitle] = useState("");
  const [createAvatar, setCreateAvatar] = useState("📚");
  const [isCreating, setIsCreating] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Invite form
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [pendingInvites, setPendingInvites] = useState([]);

  // Settings form
  const [editTitle, setEditTitle] = useState("");
  const [editAvatar, setEditAvatar] = useState("📚");
  const [editPrivate, setEditPrivate] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // File sharing
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [pastedContent, setPastedContent] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const isCreator = activeRoom && roomData && activeRoom.created_by === roomData.created_by;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll messages when in a room
  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(async () => {
      try {
        const res = await roomAPI.getMessages(activeRoom.room_code);
        setMessages(res?.data?.messages || []);
      } catch (err) {
        console.error("Poll messages error:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  const handleCreateRoom = async () => {
    if (!createTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await roomAPI.create({
        title: createTitle.trim(),
        avatar: createAvatar,
        is_private: true,
      });
      const room = res?.data?.room;
      if (room) {
        setActiveRoom(room);
        setRoomData(room);
        setCreateOpen(false);
        setCreateTitle("");
        setCreateAvatar("📚");
      }
    } catch (err) {
      console.error("Create room error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeRoom) return;
    const text = chatInput.trim();
    const hasText = text.length > 0;
    const hasFile = selectedFile !== null;
    const hasPaste = pastedContent !== null;

    if (!hasText && !hasFile && !hasPaste) return;

    try {
      if (hasFile) {
        const formData = new FormData();
        formData.append("message", text);
        formData.append("file", selectedFile);
        await roomAPI.sendMessage(activeRoom.room_code, formData);
      } else if (hasPaste) {
        const formData = new FormData();
        formData.append("message", text || pastedContent);
        formData.append("file", pastedContent);
        await roomAPI.sendMessage(activeRoom.room_code, formData);
      } else {
        await roomAPI.sendMessage(activeRoom.room_code, { message: text });
      }
      setChatInput("");
      setSelectedFile(null);
      setFilePreview(null);
      setPastedContent(null);
      const msgRes = await roomAPI.getMessages(activeRoom.room_code);
      setMessages(msgRes?.data?.messages || []);
    } catch (err) {
      console.error("Send message error:", err);
      setToast({ open: true, message: "Failed to send message", severity: "error" });
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.room_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(blob));
            setPastedContent(null);
            return;
          }
        }
      }
    } catch (err) {
      // paste fallback: just insert text
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    setPastedContent(null);
  };

  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleModifyRoom = () => {
    handleMenuClose();
    if (!roomData) return;
    setEditTitle(roomData.title || activeRoom.title);
    setEditAvatar(roomData.avatar || "📚");
    setEditPrivate(roomData.is_private !== false);
    setSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!activeRoom) return;
    setSettingsLoading(true);
    try {
      const res = await roomAPI.updateSettings(activeRoom.room_code, {
        title: editTitle,
        avatar: editAvatar,
        is_private: editPrivate,
      });
      const updated = res?.data?.room;
      if (updated) {
        setRoomData(updated);
        setActiveRoom(prev => ({ ...prev, ...updated }));
      }
      setSettingsOpen(false);
      setToast({ open: true, message: "Room updated", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: "Failed to update room", severity: "error" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleOpenInvite = async () => {
    handleMenuClose();
    if (!activeRoom) return;
    setInviteOpen(true);
    setInviteUsername("");
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await roomAPI.listInvites(activeRoom.room_code);
      setPendingInvites(res?.data?.invites || []);
    } catch (err) {
      console.error("Failed to load invites:", err);
    }
  };

  const handleSendInvite = async () => {
    if (!activeRoom || !inviteUsername.trim()) return;
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await roomAPI.invite(activeRoom.room_code, inviteUsername.trim());
      if (res?.data?.invited_username) {
        setInviteSuccess(`Invited ${res.data.invited_username}`);
        setInviteUsername("");
        const listRes = await roomAPI.listInvites(activeRoom.room_code);
        setPendingInvites(listRes?.data?.invites || []);
      }
    } catch (err) {
      setInviteError(err.response?.data?.error || "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespondInvite = async (inviteId, action) => {
    if (!activeRoom) return;
    try {
      await roomAPI.respondInvite(activeRoom.room_code, inviteId, action);
      const listRes = await roomAPI.listInvites(activeRoom.room_code);
      setPendingInvites(listRes?.data?.invites || []);
    } catch (err) {
      console.error("Respond invite error:", err);
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    setIsDeleting(true);
    try {
      await roomAPI.deleteRoom(activeRoom.room_code);
      setActiveRoom(null);
      setRoomData(null);
      setMessages([]);
      setDeleteConfirmOpen(false);
      setToast({ open: true, message: "Room deleted", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: "Failed to delete room", severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderMessageAttachment = (msg) => {
    if (!msg.attachment_url) return null;
    if (msg.attachment_type === "image") {
      return (
        <Box sx={{ mt: 1, borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
          <img src={msg.attachment_url} alt={msg.attachment_name || "Shared image"} style={{ maxWidth: "100%", maxHeight: 200, display: "block" }} />
        </Box>
      );
    }
    return (
      <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
        <span style={{ fontSize: 16 }}>📄</span>
        <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)", flex: 1 }} noWrap>{msg.attachment_name || "Document"}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#080d16" }}>

      {/* ── NO ACTIVE ROOM ───────────────────────────────────────────── */}
      {!activeRoom ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
            <GroupsRounded sx={{ fontSize: 32, color: "var(--emerald)" }} />
          </Box>
          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#f1f5f9", mb: 1 }}>
            Study Groups
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)", maxWidth: 400, mb: 3 }}>
            Create a private study room, invite classmates, and chat together with shared notes and files.
          </Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ background: "var(--grad-primary)", fontWeight: 700, px: 3, py: 1.2, borderRadius: "var(--r-md)" }}>
            Create Study Group
          </Button>
        </Box>
      ) : (
        /* ── ACTIVE ROOM ────────────────────────────────────────────── */
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Room Header */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: "#0b1320", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
              {roomData?.avatar || activeRoom.avatar || "📚"}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f1f5f9", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {roomData?.title || activeRoom.title}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                {roomData?.participant_count || 1} participants · Code: {activeRoom.room_code}
              </Typography>
            </Box>
            <Tooltip title="Copy code">
              <IconButton size="small" onClick={handleCopyCode} sx={{ color: "var(--text-mid)" }}>
                {copiedCode ? <CheckCircleRounded sx={{ fontSize: 16, color: "var(--emerald)" }} /> : <ContentPasteRounded sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Menu">
              <IconButton size="small" onClick={handleMenuOpen} sx={{ color: "var(--text-mid)" }}>
                <MoreVertRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose} PaperProps={{ sx: { bgcolor: "#0f1623", border: "1px solid var(--border)", minWidth: 180 } }}>
              <MenuItem onClick={handleModifyRoom} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
                <ListItemIcon><EditRounded sx={{ fontSize: 18, color: "var(--indigo-lt)" }} /></ListItemIcon>
                <ListItemText primary="Modify Room" />
              </MenuItem>
              <MenuItem onClick={handleOpenInvite} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
                <ListItemIcon><PersonAddRounded sx={{ fontSize: 18, color: "var(--emerald)" }} /></ListItemIcon>
                <ListItemText primary="Invite Users" />
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); setSecurityOpen(true); }} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
                <ListItemIcon><ShieldRounded sx={{ fontSize: 18, color: "var(--amber)" }} /></ListItemIcon>
                <ListItemText primary="Security Settings" />
              </MenuItem>
              {isCreator && (
                <MenuItem onClick={() => { handleMenuClose(); setDeleteConfirmOpen(true); }} sx={{ color: "#f43f5e", fontSize: "0.82rem" }}>
                  <ListItemIcon><DeleteRounded sx={{ fontSize: 18, color: "#f43f5e" }} /></ListItemIcon>
                  <ListItemText primary="Delete Room" />
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", p: 2, gap: 1.5 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 8, color: "var(--text-dim)" }}>
                <Typography sx={{ fontSize: "0.85rem", mb: 1 }}>No messages yet</Typography>
                <Typography sx={{ fontSize: "0.75rem" }}>Be the first to say hello or share notes</Typography>
              </Box>
            )}
            {messages.map((m) => {
              const isMe = m.user_id === activeRoom.created_by;
              return (
                <Box key={m.id} sx={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 0.75 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: isMe ? "var(--indigo)" : "rgba(255,255,255,0.1)", flexShrink: 0 }}>
                    {m.username?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <Box sx={{ maxWidth: "70%", bgcolor: isMe ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isMe ? "rgba(99,102,241,0.3)" : "var(--border)"}`, borderRadius: "var(--r-lg)", px: 1.5, py: 1 }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-dim)", mb: 0.2 }}>{m.username || `User ${m.user_id}`}</Typography>
                    {m.message && <Typography sx={{ fontSize: "0.82rem", color: "#f1f5f9", lineHeight: 1.4, wordBreak: "break-word" }}>{m.message}</Typography>}
                    {renderMessageAttachment(m)}
                  </Box>
                </Box>
              );
            })}
            <div ref={chatEndRef} />
            {messages.length >= 60 && (
              <Typography sx={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-dim)", mt: 1 }}>
                Message limit reached (60). Create a new room to continue.
              </Typography>
            )}
          </Box>

          {/* Chat Input */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: "#0b1320", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            {(selectedFile || pastedContent || filePreview) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, p: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                {filePreview && <img src={filePreview} alt="preview" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} />}
                {!filePreview && <span style={{ fontSize: 18 }}>📄</span>}
                <Typography sx={{ fontSize: "0.75rem", color: "var(--text-mid)", flex: 1 }} noWrap>
                  {selectedFile?.name || pastedContent?.name || "Pasted content"}
                </Typography>
                <IconButton size="small" onClick={() => { setSelectedFile(null); setFilePreview(null); setPastedContent(null); }} sx={{ color: "var(--text-dim)" }}>
                  <CloseRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-end" }}>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx" style={{ display: "none" }} onChange={handleFileSelect} />
              <Tooltip title="Attach image/document">
                <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: "var(--text-dim)", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                  <ImageRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Paste from clipboard">
                <IconButton size="small" onClick={handlePaste} sx={{ color: "var(--text-dim)", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                  <ContentPasteRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "var(--r-md)", "& .MuiOutlinedInput-root": { borderRadius: "var(--r-md)", fontSize: "0.85rem", color: "#f1f5f9", "& fieldset": { borderColor: "var(--border)" }, "&:hover fieldset": { borderColor: "var(--border-active)" } } }}
              />
              <IconButton onClick={handleSendMessage} disabled={messages.length >= 60} sx={{ bgcolor: "var(--indigo)", color: "#fff", "&:hover": { bgcolor: "var(--indigo-lt)" }, "&.Mui-disabled": { opacity: 0.4 } }}>
                <SendRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── CREATE ROOM DIALOG ────────────────────────────────────────── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1.1rem" }}>Create Study Group</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Pick an avatar for your group</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {EMOJI_AVATARS.map((emoji) => (
              <Box key={emoji} onClick={() => setCreateAvatar(emoji)} sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: createAvatar === emoji ? "2px solid var(--indigo)" : "1px solid var(--border)", bgcolor: createAvatar === emoji ? "rgba(99,102,241,0.15)" : "transparent", fontSize: "1.2rem", transition: "all 0.15s" }}>
                {emoji}
              </Box>
            ))}
          </Box>
          <TextField label="Group Name" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} size="small" fullWidth placeholder="e.g. Biology Exam Prep" autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRoom} disabled={isCreating || !createTitle.trim()} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODIFY ROOM DIALOG ────────────────────────────────────────── */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1.1rem" }}>Modify Room</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Avatar</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {EMOJI_AVATARS.map((emoji) => (
              <Box key={emoji} onClick={() => setEditAvatar(emoji)} sx={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: editAvatar === emoji ? "2px solid var(--indigo)" : "1px solid var(--border)", bgcolor: editAvatar === emoji ? "rgba(99,102,241,0.15)" : "transparent", fontSize: "1.1rem" }}>
                {emoji}
              </Box>
            ))}
          </Box>
          <TextField label="Group Name" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} size="small" fullWidth />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShieldRounded sx={{ fontSize: 18, color: "var(--amber)" }} />
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-mid)", flex: 1 }}>Private (invite-only)</Typography>
            <input type="checkbox" checked={editPrivate} onChange={(e) => setEditPrivate(e.target.checked)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings} disabled={settingsLoading || !editTitle.trim()} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {settingsLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── INVITE USERS DIALOG ──────────────────────────────────────── */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340, maxHeight: "80vh" } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1.1rem" }}>Invite Users</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField label="Username" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} size="small" fullWidth onKeyDown={(e) => e.key === "Enter" && handleSendInvite()} />
            <Button variant="contained" onClick={handleSendInvite} disabled={inviteLoading || !inviteUsername.trim()} sx={{ background: "var(--grad-primary)", fontWeight: 700, px: 2 }}>Invite</Button>
          </Box>
          {inviteError && <Alert severity="error" sx={{ fontSize: "0.75rem" }}>{inviteError}</Alert>}
          {inviteSuccess && <Alert severity="success" sx={{ fontSize: "0.75rem" }}>{inviteSuccess}</Alert>}
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", mt: 1 }}>Pending Invites</Typography>
          {pendingInvites.length === 0 && <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>No pending invites</Typography>}
          {pendingInvites.map((inv) => (
            <Box key={inv.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
              <Box>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>{inv.invited_username || `User ${inv.invited_user_id}`}</Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Status: {inv.status}</Typography>
              </Box>
              {inv.status === "pending" && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Button size="small" variant="contained" onClick={() => handleRespondInvite(inv.id, "accept")} sx={{ background: "var(--emerald)", fontSize: "0.7rem", py: 0.3 }}>Accept</Button>
                  <Button size="small" variant="outlined" onClick={() => handleRespondInvite(inv.id, "decline")} sx={{ borderColor: "var(--border)", color: "var(--text-dim)", fontSize: "0.7rem", py: 0.3 }}>Decline</Button>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: "var(--text-mid)" }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── SECURITY SETTINGS DIALOG ──────────────────────────────────── */}
      <Dialog open={securityOpen} onClose={() => setSecurityOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1.1rem" }}>Security Settings</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <ShieldRounded sx={{ fontSize: 22, color: "var(--amber)" }} />
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>Private Group</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Only invited users can join. Room code is for reference only.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <GroupsRounded sx={{ fontSize: 22, color: "var(--indigo-lt)" }} />
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>Message Limit</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Max 60 messages per room to keep performance smooth.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>File Sharing</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Share images and documents with the group.</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setSecurityOpen(false)} sx={{ color: "var(--text-mid)" }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE CONFIRMATION DIALOG ────────────────────────────────── */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "var(--r-lg)", minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f43f5e", fontSize: "1.1rem" }}>Delete Room?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.6 }}>
            This will permanently delete <strong>{roomData?.title || activeRoom.title}</strong> and all its messages, participants, and invites. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteRoom} disabled={isDeleting} sx={{ background: "#f43f5e", fontWeight: 700 }}>
            {isDeleting ? "Deleting..." : "Delete Room"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CREATE ROOM DIALOG ────────────────────────────────────────── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1.1rem" }}>Create Study Group</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Pick an avatar for your group</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {EMOJI_AVATARS.map((emoji) => (
              <Box key={emoji} onClick={() => setCreateAvatar(emoji)} sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: createAvatar === emoji ? "2px solid var(--indigo)" : "1px solid var(--border)", bgcolor: createAvatar === emoji ? "rgba(99,102,241,0.15)" : "transparent", fontSize: "1.2rem", transition: "all 0.15s" }}>
                {emoji}
              </Box>
            ))}
          </Box>
          <TextField label="Group Name" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} size="small" fullWidth placeholder="e.g. Biology Exam Prep" autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRoom} disabled={isCreating || !createTitle.trim()} sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ fontSize: "0.85rem" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudyRoom;
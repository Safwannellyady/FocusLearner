import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, TextField, IconButton, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Checkbox, Collapse, Chip, useMediaQuery
} from "@mui/material";
import {
  CloseRounded, AddRounded, DeleteRounded, SendRounded,
  DescriptionRounded, AssignmentRounded, ExpandMoreRounded
} from "@mui/icons-material";
import { roomAPI } from "../services/api";

/**
 * StudyRoomDock — Claude-artifacts-style docked workspace panel for study rooms.
 * Chat stays clean on the left; documents and to-dos live here on the right.
 * Anyone in the room can dock items; each item has its own discussion thread.
 */
const StudyRoomDock = ({ roomCode, participants, currentUserId, currentUsername, onClose, notifyActivity }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [tab, setTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded item thread: { type: 'document'|'todo', id, title } | null
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  // Create document dialog
  const [docOpen, setDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docSaving, setDocSaving] = useState(false);

  // Create todo dialog
  const [todoOpen, setTodoOpen] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoAssignee, setTodoAssignee] = useState("");
  const [todoSaving, setTodoSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, title }
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    if (!roomCode) return;
    setLoading(true);
    try {
      const [docRes, todoRes] = await Promise.all([
        roomAPI.listDockDocuments(roomCode),
        roomAPI.listTodos(roomCode),
      ]);
      setDocuments(docRes?.data?.documents || []);
      setTodos(todoRes?.data?.todos || []);
    } catch (err) {
      console.error("Dock load error:", err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { setExpanded(null); setComments([]); }, [roomCode]);

  const loadComments = useCallback(async (type, id) => {
    setCommentsLoading(true);
    try {
      const res = await roomAPI.listItemComments(roomCode, type, id);
      setComments(res?.data?.comments || []);
    } catch (err) {
      console.error("Comments load error:", err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [roomCode]);

  const toggleExpand = (type, item) => {
    if (expanded && expanded.type === type && expanded.id === item.id) {
      setExpanded(null);
      setComments([]);
    } else {
      setExpanded({ type, id: item.id, title: item.title });
      setCommentInput("");
      loadComments(type, item.id);
    }
  };

  const handleCreateDoc = async () => {
    const title = docTitle.trim();
    if (!title) return;
    setDocSaving(true);
    try {
      await roomAPI.createDockDocument(roomCode, { title, content: docContent });
      setDocOpen(false);
      setDocTitle("");
      setDocContent("");
      await loadAll();
      notifyActivity("dock", `📄 ${currentUsername} docked "${title}"`);
    } catch (err) {
      console.error("Create doc error:", err);
    } finally {
      setDocSaving(false);
    }
  };

  const handleCreateTodo = async () => {
    const title = todoTitle.trim();
    if (!title) return;
    setTodoSaving(true);
    try {
      await roomAPI.createTodo(roomCode, {
        title,
        assignee_id: todoAssignee ? parseInt(todoAssignee, 10) : null,
      });
      setTodoOpen(false);
      setTodoTitle("");
      setTodoAssignee("");
      await loadAll();
      notifyActivity("dock", `📝 ${currentUsername} added to-do "${title}"`);
    } catch (err) {
      console.error("Create todo error:", err);
    } finally {
      setTodoSaving(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    const next = todo.status === "done" ? "open" : "done";
    try {
      await roomAPI.updateTodo(roomCode, todo.id, { status: next });
      await loadAll();
      if (next === "done") {
        notifyActivity("todo_done", `✅ ${currentUsername} completed "${todo.title}"`);
      }
    } catch (err) {
      console.error("Toggle todo error:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "document") {
        await roomAPI.deleteDockDocument(roomCode, deleteTarget.id);
      } else {
        await roomAPI.deleteTodo(roomCode, deleteTarget.id);
      }
      if (expanded && expanded.id === deleteTarget.id) {
        setExpanded(null);
        setComments([]);
      }
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      console.error("Delete dock item error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostComment = async () => {
    const text = commentInput.trim();
    if (!text || !expanded) return;
    try {
      await roomAPI.postItemComment(roomCode, expanded.type, expanded.id, text);
      setCommentInput("");
      await loadComments(expanded.type, expanded.id);
      notifyActivity("comment", `💬 ${currentUsername} commented on "${expanded.title}"`);
    } catch (err) {
      console.error("Post comment error:", err);
    }
  };

  const panelSx = isMobile
    ? {
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1300,
        maxHeight: "72vh", borderTop: "1px solid var(--border)",
        borderRadius: "16px 16px 0 0",
      }
    : {
        width: 360, flexShrink: 0, borderLeft: "1px solid var(--border)",
      };

  const renderThread = () => (
    <Box sx={{ mt: 1, pt: 1.5, borderTop: "1px dashed var(--border)" }}>
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
        Discussion
      </Typography>
      {commentsLoading ? (
        <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Loading…</Typography>
      ) : comments.length === 0 ? (
        <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)", mb: 1 }}>No comments yet — start the discussion.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1, maxHeight: 220, overflowY: "auto" }}>
          {comments.map((c) => (
            <Box key={c.id} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: "var(--r-md)", px: 1.25, py: 0.75 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-dim)" }}>
                {c.username || `User ${c.user_id}`}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#f1f5f9", wordBreak: "break-word" }}>{c.message}</Typography>
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Comment on this…"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePostComment()}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.8rem", color: "#f1f5f9", "& fieldset": { borderColor: "var(--border)" } } }}
        />
        <IconButton size="small" onClick={handlePostComment} disabled={!commentInput.trim()} sx={{ bgcolor: "var(--indigo)", color: "#fff" }}>
          <SendRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );

  const canDelete = (item) =>
    currentUserId != null && (item.created_by === currentUserId);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0b1320", ...panelSx }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", flex: 1 }}>
          Docked
        </Typography>
        <Tooltip title="Close panel">
          <IconButton size="small" onClick={onClose} sx={{ color: "var(--text-dim)" }}>
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth"
        sx={{ flexShrink: 0, "& .MuiTab-root": { color: "var(--text-dim)", fontSize: "0.78rem", fontWeight: 700 }, "& .Mui-selected": { color: "#f1f5f9" } }}>
        <Tab value="documents" label={`Documents (${documents.length})`} icon={<DescriptionRounded sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab value="todos" label={`To-dos (${todos.length})`} icon={<AssignmentRounded sx={{ fontSize: 16 }} />} iconPosition="start" />
      </Tabs>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
        {loading ? (
          <Typography sx={{ fontSize: "0.8rem", color: "var(--text-dim)", textAlign: "center", mt: 4 }}>Loading docked items…</Typography>
        ) : tab === "documents" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button variant="outlined" startIcon={<AddRounded />} onClick={() => setDocOpen(true)}
              sx={{ borderColor: "var(--border)", color: "var(--text-mid)", fontSize: "0.78rem", fontWeight: 700 }}>
              New document
            </Button>
            {documents.length === 0 && (
              <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)", textAlign: "center", mt: 2 }}>
                Nothing docked yet. Dock notes, summaries, or code here.
              </Typography>
            )}
            {documents.map((doc) => {
              const isOpen = expanded && expanded.type === "document" && expanded.id === doc.id;
              return (
                <Box key={doc.id} sx={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", bgcolor: "rgba(255,255,255,0.02)" }}>
                  <Box onClick={() => toggleExpand("document", doc)}
                    sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, cursor: "pointer" }}>
                    <DescriptionRounded sx={{ fontSize: 18, color: "var(--indigo-lt)", flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }} noWrap>{doc.title}</Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                        {doc.created_by_username || `User ${doc.created_by}`}
                      </Typography>
                    </Box>
                    {canDelete(doc) && (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "document", id: doc.id, title: doc.title }); }}
                        sx={{ color: "var(--text-dim)" }}>
                        <DeleteRounded sx={{ fontSize: 15 }} />
                      </IconButton>
                    )}
                    <ExpandMoreRounded sx={{ fontSize: 18, color: "var(--text-dim)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                  </Box>
                  <Collapse in={isOpen}>
                    <Box sx={{ px: 1.5, pb: 1.5 }}>
                      <Typography sx={{ fontSize: "0.8rem", color: "var(--text-mid)", whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 1 }}>
                        {doc.content || <em style={{ color: "var(--text-dim)" }}>Empty document</em>}
                      </Typography>
                      {renderThread()}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button variant="outlined" startIcon={<AddRounded />} onClick={() => setTodoOpen(true)}
              sx={{ borderColor: "var(--border)", color: "var(--text-mid)", fontSize: "0.78rem", fontWeight: 700 }}>
              New to-do
            </Button>
            {todos.length === 0 && (
              <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)", textAlign: "center", mt: 2 }}>
                No to-dos yet. Add one and assign it to someone.
              </Typography>
            )}
            {todos.map((todo) => {
              const isOpen = expanded && expanded.type === "todo" && expanded.id === todo.id;
              const done = todo.status === "done";
              return (
                <Box key={todo.id} sx={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", bgcolor: done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.75 }}>
                    <Checkbox checked={done} onChange={() => handleToggleTodo(todo)} size="small"
                      sx={{ color: "var(--text-dim)", "&.Mui-checked": { color: "var(--emerald)" } }} />
                    <Box onClick={() => toggleExpand("todo", todo)} sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: done ? "var(--text-dim)" : "#f1f5f9", textDecoration: done ? "line-through" : "none" }} noWrap>
                        {todo.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.25, alignItems: "center" }}>
                        {todo.assignee_username ? (
                          <Chip label={`→ ${todo.assignee_username}`} size="small"
                            sx={{ height: 20, fontSize: "0.62rem", bgcolor: "rgba(99,102,241,0.15)", color: "var(--indigo-lt)" }} />
                        ) : (
                          <Chip label="Unassigned" size="small" variant="outlined"
                            sx={{ height: 20, fontSize: "0.62rem", color: "var(--text-dim)", borderColor: "var(--border)" }} />
                        )}
                      </Box>
                    </Box>
                    {canDelete(todo) && (
                      <IconButton size="small" onClick={() => setDeleteTarget({ type: "todo", id: todo.id, title: todo.title })}
                        sx={{ color: "var(--text-dim)" }}>
                        <DeleteRounded sx={{ fontSize: 15 }} />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => toggleExpand("todo", todo)} sx={{ color: "var(--text-dim)" }}>
                      <ExpandMoreRounded sx={{ fontSize: 18, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </IconButton>
                  </Box>
                  <Collapse in={isOpen}>
                    <Box sx={{ px: 1.5, pb: 1.5 }}>{renderThread()}</Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── CREATE DOCUMENT DIALOG ── */}
      <Dialog open={docOpen} onClose={() => setDocOpen(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1rem" }}>
          Dock a document
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <TextField label="Title" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} size="small" fullWidth autoFocus
            sx={{ "& .MuiOutlinedInput-root": { color: "#f1f5f9", fontSize: "0.85rem", "& fieldset": { borderColor: "var(--border)" } }, "& .MuiInputLabel-root": { color: "var(--text-dim)" } }} />
          <TextField label="Content" value={docContent} onChange={(e) => setDocContent(e.target.value)} multiline rows={8} fullWidth
            placeholder="Notes, summary, code… (plain text)"
            sx={{ "& .MuiOutlinedInput-root": { color: "#f1f5f9", fontSize: "0.85rem", fontFamily: "monospace", "& fieldset": { borderColor: "var(--border)" } }, "& .MuiInputLabel-root": { color: "var(--text-dim)" } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDocOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDoc} disabled={docSaving || !docTitle.trim()}
            sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {docSaving ? "Docking…" : "Dock it"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CREATE TODO DIALOG ── */}
      <Dialog open={todoOpen} onClose={() => setTodoOpen(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" } }}>
        <DialogTitle sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, color: "#f1f5f9", fontSize: "1rem" }}>
          New to-do
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <TextField label="What needs doing?" value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} size="small" fullWidth autoFocus
            sx={{ "& .MuiOutlinedInput-root": { color: "#f1f5f9", fontSize: "0.85rem", "& fieldset": { borderColor: "var(--border)" } }, "& .MuiInputLabel-root": { color: "var(--text-dim)" } }} />
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: "var(--text-dim)" }}>Assign to</InputLabel>
            <Select value={todoAssignee} label="Assign to" onChange={(e) => setTodoAssignee(e.target.value)}
              sx={{ color: "#f1f5f9", fontSize: "0.85rem", "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" } }}>
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {(participants || []).map((p) => (
                <MenuItem key={p.user_id} value={String(p.user_id)}>{p.username || `User ${p.user_id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setTodoOpen(false)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTodo} disabled={todoSaving || !todoTitle.trim()}
            sx={{ background: "var(--grad-primary)", fontWeight: 700 }}>
            {todoSaving ? "Adding…" : "Add to-do"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { bgcolor: "#0b1320", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "var(--r-lg)" } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "#f43f5e", fontSize: "1rem" }}>Remove this item?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: "var(--text-mid)" }}>
            "{deleteTarget?.title}" and its discussion will be removed. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "var(--text-mid)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={isDeleting} sx={{ background: "#f43f5e", fontWeight: 700 }}>
            {isDeleting ? "Removing…" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyRoomDock;

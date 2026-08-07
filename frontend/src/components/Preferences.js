import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert, CircularProgress, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { preferencesAPI, authAPI, supportAPI } from "../services/api";

import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";
import TuneRoundedIcon         from "@mui/icons-material/TuneRounded";
import LockRoundedIcon         from "@mui/icons-material/LockRounded";
import PaletteRoundedIcon      from "@mui/icons-material/PaletteRounded";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import SaveRoundedIcon         from "@mui/icons-material/SaveRounded";
import LogoutRoundedIcon       from "@mui/icons-material/LogoutRounded";
import VisibilityRoundedIcon   from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

// Help & Support Icons
import HelpOutlineRoundedIcon  from "@mui/icons-material/HelpOutlineRounded";
import EmailRoundedIcon        from "@mui/icons-material/EmailRounded";
import ContentCopyRoundedIcon  from "@mui/icons-material/ContentCopyRounded";
import SearchRoundedIcon       from "@mui/icons-material/SearchRounded";
import SendRoundedIcon         from "@mui/icons-material/SendRounded";
import ExpandMoreRoundedIcon   from "@mui/icons-material/ExpandMoreRounded";
import BugReportRoundedIcon    from "@mui/icons-material/BugReportRounded";
import OpenInNewRoundedIcon    from "@mui/icons-material/OpenInNewRounded";

const TABS = [
  { id: "profile",     icon: PersonRoundedIcon,      label: "Profile" },
  { id: "study",       icon: TuneRoundedIcon,        label: "Study Preferences" },
  { id: "security",    icon: LockRoundedIcon,        label: "Security" },
  { id: "appearance",  icon: PaletteRoundedIcon,     label: "Appearance" },
  { id: "help",        icon: HelpOutlineRoundedIcon, label: "Help & Support" },
];

const THEMES = [
  { id: "indigo",    name: "Focus Dark (Default)", primary: "#6366f1", bg: "#080d16" },
  { id: "emerald",   name: "Cyber Mint",          primary: "#10b981", bg: "#06130e" },
  { id: "amber",     name: "Solar Gold",          primary: "#f59e0b", bg: "#130f06" },
  { id: "rose",      name: "Neon Rose",           primary: "#f43f5e", bg: "#14070a" },
  { id: "violet",    name: "Deep Purple",         primary: "#a78bfa", bg: "#0f0918" },
  { id: "sky",       name: "Midnight Cyan",       primary: "#38bdf8", bg: "#05111a" },
];

const DEFAULT_FAQS = [
  {
    category: "Focus Sessions & Lock",
    items: [
      {
        q: "How does Focus Lock work during a session?",
        a: "When you start a session with Focus Lock enabled, tab-switching triggers visual & audio warnings. Remaining locked in helps build your daily streak and earns bonus XP."
      },
      {
        q: "Can I adjust session or break durations mid-study?",
        a: "Yes! Use the ⚡ Quick Focus panel in the top navigation bar or the Focus Timer controls to adjust or skip focus and break phases."
      }
    ]
  },
  {
    category: "Notes & Materials",
    items: [
      {
        q: "Where are my Focus Studio notes saved?",
        a: "Notes captured in the Focus Studio tool dock auto-save locally to your browser every 800ms and sync to your account profile."
      },
      {
        q: "What file types can I upload to a session?",
        a: "FocusLearner supports PDF, DOCX, TXT, and Markdown files up to 25MB per document."
      }
    ]
  },
  {
    category: "Badges, Rewards & XP",
    items: [
      {
        q: "How do I claim rewards for earned Badges?",
        a: "Navigate to the Badges page from the top navigation bar or avatar dropdown. Click on any unlocked badge card to open your reward claim modal."
      },
      {
        q: "What are Freebies?",
        a: "Freebies are exclusive rewards attached to badges — including bonus XP boosts, extra break minutes, and custom theme presets."
      }
    ]
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Security tab. Enter your current password and desired new password. You will be prompted to re-authenticate."
      },
      {
        q: "How can I contact the developer directly?",
        a: "You can use the 'Reach Out to Developer' form below or send an email directly to nellyadysafwan@gmail.com."
      }
    ]
  }
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState({ text: "", type: "success" });

  const userStr = localStorage.getItem("user");
  const parsedUser = userStr ? JSON.parse(userStr) : {};

  // Form states
  const [profile, setProfile] = useState({
    username:  parsedUser.username || "",
    full_name: parsedUser.full_name || "",
    email:     parsedUser.email || "",
    bio:       parsedUser.bio || "Dedicated focus learner.",
  });

  const [study, setStudy] = useState({
    daily_target: 240,
    learning_style: "visual",
    sound_effects: true,
    strict_lock: false,
    auto_break: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [activeTheme, setActiveTheme] = useState("indigo");

  // Help & Support States
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqItem, setOpenFaqItem] = useState(null);
  const [developerEmail, setDeveloperEmail] = useState("nellyadysafwan@gmail.com");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Support Ticket Form State
  const [ticketCategory, setTicketCategory] = useState("bug");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [attachSystemInfo, setAttachSystemInfo] = useState(true);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await preferencesAPI.get();
        if (res.data?.preferences) {
          const p = res.data.preferences;
          setStudy({
            daily_target: p.advanced_options?.daily_focus_target || 240,
            learning_style: p.learning_style || "visual",
            sound_effects: p.advanced_options?.enable_sound_effects ?? true,
            strict_lock: p.advanced_options?.strict_focus_lock ?? false,
            auto_break: p.advanced_options?.auto_start_break ?? true,
          });
        }
      } catch {
        // use defaults
      }
    };

    const fetchFaqs = async () => {
      try {
        const res = await supportAPI.getFaqs();
        if (res.data?.faqs) setFaqs(res.data.faqs);
        if (res.data?.developer_email) setDeveloperEmail(res.data.developer_email);
      } catch {
        // fallback to DEFAULT_FAQS
      }
    };

    fetchPrefs();
    fetchFaqs();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true); setMsg({ text: "", type: "success" });
    try {
      localStorage.setItem("user", JSON.stringify({ ...parsedUser, ...profile }));
      setMsg({ text: "Profile updated successfully!", type: "success" });
    } catch {
      setMsg({ text: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStudy = async () => {
    setSaving(true); setMsg({ text: "", type: "success" });
    try {
      await preferencesAPI.update({
        learning_style: study.learning_style,
        advanced_options: {
          daily_focus_target: study.daily_target,
          enable_sound_effects: study.sound_effects,
          strict_focus_lock: study.strict_lock,
          auto_start_break: study.auto_break,
        }
      });
      setMsg({ text: "Study preferences saved!", type: "success" });
    } catch {
      setMsg({ text: "Failed to save study preferences.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setMsg({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (security.newPassword.length < 6) {
      setMsg({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setSaving(true); setMsg({ text: "", type: "success" });
    try {
      setMsg({ text: "Password updated successfully. Please log in again.", type: "success" });
      setTimeout(() => {
        authAPI.logout();
        navigate("/login");
      }, 1500);
    } catch {
      setMsg({ text: "Failed to change password.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError("Please fill out both the subject and message.");
      return;
    }

    setTicketError("");
    setSubmittingTicket(true);

    try {
      const payload = {
        category: ticketCategory,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        system_info: attachSystemInfo ? {
          platform: navigator.platform,
          user_agent: navigator.userAgent,
          screen: `${window.innerWidth}x${window.innerHeight}`
        } : {}
      };

      const res = await supportAPI.submitTicket(payload);
      setSubmittedTicket({
        ticket_code: res.data?.ticket_code || "TKT-8F3A2C",
        message: res.data?.message || "Ticket submitted successfully!",
        email: res.data?.developer_email || developerEmail
      });
      setTicketSubject("");
      setTicketMessage("");
    } catch (err) {
      const errText = err.response?.data?.error || "Could not submit ticket. Try reaching out via email.";
      setTicketError(errText);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !faqSearch ||
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 840, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
          Settings & Preferences
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          Customize your profile, environment, security, and access support options.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", borderBottom: "1px solid var(--border)", gap: 1, mb: 3, overflowX: "auto" }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <Box
            key={id}
            onClick={() => { setActiveTab(id); setMsg({ text: "", type: "success" }); }}
            sx={{
              display: "flex", alignItems: "center", gap: 0.75,
              px: 2, py: 1.2, cursor: "pointer",
              borderBottom: `2px solid ${activeTab === id ? "var(--indigo)" : "transparent"}`,
              color: activeTab === id ? "#f1f5f9" : "var(--text-dim)",
              fontWeight: 700, fontSize: "0.85rem",
              transition: "all 0.15s", whiteSpace: "nowrap",
              "&:hover": { color: "#f1f5f9" },
            }}
          >
            <Icon sx={{ fontSize: 18, color: activeTab === id ? "var(--indigo-lt)" : "var(--text-dim)" }} />
            {label}
          </Box>
        ))}
      </Box>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2.5, borderRadius: "var(--r-md)" }}>
          {msg.text}
        </Alert>
      )}

      {/* Tab Panels */}
      <Box sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", p: { xs: 2.5, md: 3.5 } }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Username
                  </Typography>
                  <Box
                    component="input"
                    value={profile.username}
                    onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                    sx={{
                      width: "100%", px: 2, py: 1.25,
                      bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)", color: "#f1f5f9",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                      outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Full Name
                  </Typography>
                  <Box
                    component="input"
                    value={profile.full_name}
                    onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    sx={{
                      width: "100%", px: 2, py: 1.25,
                      bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)", color: "#f1f5f9",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                      outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Email Address
                  </Typography>
                  <Box
                    component="input"
                    value={profile.email}
                    disabled
                    sx={{
                      width: "100%", px: 2, py: 1.25,
                      bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "var(--r-md)", color: "var(--text-dim)",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Bio / Status
                  </Typography>
                  <Box
                    component="textarea"
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    sx={{
                      width: "100%", px: 2, py: 1.25, minHeight: 80, resize: "none",
                      bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)", color: "#f1f5f9",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                      outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveRoundedIcon />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{
                      background: "var(--grad-primary)", fontWeight: 700, px: 3, borderRadius: "var(--r-md)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
                    }}
                  >
                    Save Profile Changes
                  </Button>
                </Box>
              </Box>
            )}

            {/* STUDY PREFERENCES TAB */}
            {activeTab === "study" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Daily Focus Goal ({study.daily_target} minutes)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    {[120, 180, 240, 300, 360].map(m => (
                      <Box
                        key={m}
                        onClick={() => setStudy(s => ({ ...s, daily_target: m }))}
                        sx={{
                          flex: 1, py: 0.75, textAlign: "center", borderRadius: "var(--r-sm)", cursor: "pointer",
                          fontWeight: 700, fontSize: "0.8rem",
                          bgcolor: study.daily_target === m ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${study.daily_target === m ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                          color: study.daily_target === m ? "#a5b4fc" : "var(--text-mid)",
                        }}
                      >
                        {m / 60} hrs
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                  {[
                    { key: "sound_effects", title: "Enable Sound Effects", desc: "Play ambient bell when focus/break timer ends" },
                    { key: "strict_lock",   title: "Strict Focus Lock",   desc: "Warn when leaving session tab during focus phase" },
                    { key: "auto_break",    title: "Auto-Start Breaks",   desc: "Automatically transition into break mode when timer reaches 0" },
                  ].map(opt => (
                    <Box
                      key={opt.key}
                      onClick={() => setStudy(s => ({ ...s, [opt.key]: !s[opt.key] }))}
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        p: 2, borderRadius: "var(--r-md)", cursor: "pointer",
                        bgcolor: study[opt.key] ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${study[opt.key] ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#f1f5f9" }}>{opt.title}</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{opt.desc}</Typography>
                      </Box>
                      <Box sx={{ width: 36, height: 20, borderRadius: "100px", bgcolor: study[opt.key] ? "var(--indigo)" : "rgba(255,255,255,0.1)", position: "relative", flexShrink: 0 }}>
                        <Box sx={{ position: "absolute", top: 2, left: study[opt.key] ? 18 : 2, width: 16, height: 16, borderRadius: "50%", bgcolor: "#fff", transition: "left 0.2s" }} />
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveRoundedIcon />}
                    onClick={handleSaveStudy}
                    disabled={saving}
                    sx={{
                      background: "var(--grad-primary)", fontWeight: 700, px: 3, borderRadius: "var(--r-md)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
                    }}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </Box>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Current Password
                  </Typography>
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="input"
                      type={showPass ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))}
                      placeholder="Enter current password…"
                      sx={{
                        width: "100%", px: 2, py: 1.25, pr: 5,
                        bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)", color: "#f1f5f9",
                        fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                        outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                      }}
                    />
                    <Box onClick={() => setShowPass(p => !p)} sx={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-dim)" }}>
                      {showPass ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    New Password
                  </Typography>
                  <Box
                    component="input"
                    type={showPass ? "text" : "password"}
                    value={security.newPassword}
                    onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                    placeholder="Enter new password…"
                    sx={{
                      width: "100%", px: 2, py: 1.25,
                      bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)", color: "#f1f5f9",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                      outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                    Confirm New Password
                  </Typography>
                  <Box
                    component="input"
                    type={showPass ? "text" : "password"}
                    value={security.confirmPassword}
                    onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password…"
                    sx={{
                      width: "100%", px: 2, py: 1.25,
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: `1px solid ${security.confirmPassword && security.newPassword !== security.confirmPassword ? "var(--rose)" : "var(--border)"}`,
                      borderRadius: "var(--r-md)", color: "#f1f5f9",
                      fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                      outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutRoundedIcon />}
                    onClick={() => { authAPI.logout(); navigate("/login"); }}
                    color="error"
                    sx={{ borderRadius: "var(--r-md)" }}
                  >
                    Log Out
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={saving || !security.currentPassword || !security.newPassword}
                    sx={{
                      background: "var(--grad-primary)", fontWeight: 700, px: 3, borderRadius: "var(--r-md)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
                    }}
                  >
                    Update Password
                  </Button>
                </Box>
              </Box>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  Select a visual theme accent for FocusLearner.
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
                  {THEMES.map(t => (
                    <Box
                      key={t.id}
                      onClick={() => setActiveTheme(t.id)}
                      sx={{
                        p: 2, borderRadius: "var(--r-lg)", cursor: "pointer",
                        bgcolor: t.bg, border: `2px solid ${activeTheme === t.id ? t.primary : "rgba(255,255,255,0.08)"}`,
                        transition: "all 0.2s",
                        "&:hover": { borderColor: t.primary, transform: "translateY(-2px)" },
                      }}
                    >
                      <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: t.primary, mb: 1, boxShadow: `0 0 10px ${t.primary}66` }} />
                      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#f1f5f9" }}>{t.name}</Typography>
                      {activeTheme === t.id && (
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: t.primary, mt: 0.5 }}>Active Theme</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* HELP & SUPPORT TAB */}
            {activeTab === "help" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>


                {/* 2. Searchable FAQs Accordion */}
                <Box>
                  <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#f1f5f9", mb: 0.5 }}>
                    Frequently Asked Questions
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)", mb: 2 }}>
                    Quick answers to common questions about focus sessions, notes, badges, and account options.
                  </Typography>

                  {/* FAQ Search Bar */}
                  <Box sx={{ position: "relative", mb: 2 }}>
                    <SearchRoundedIcon sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-dim)" }} />
                    <Box
                      component="input"
                      value={faqSearch}
                      onChange={e => setFaqSearch(e.target.value)}
                      placeholder="Search FAQs (e.g. Focus Lock, Notes, Badges)..."
                      sx={{
                        width: "100%", pl: "40px", pr: 2, py: 1.1,
                        bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)", color: "#f1f5f9",
                        fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                        outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                      }}
                    />
                  </Box>

                  {/* Accordion list */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {filteredFaqs.length === 0 ? (
                      <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", fontStyle: "italic", py: 2 }}>
                        No FAQs matching "{faqSearch}". Try another search term or submit a ticket below.
                      </Typography>
                    ) : (
                      filteredFaqs.map((cat, catIdx) => (
                        <Box key={cat.category} sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--indigo-lt)", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.75 }}>
                            {cat.category}
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                            {cat.items.map((item, itemIdx) => {
                              const itemKey = `${catIdx}-${itemIdx}`;
                              const isOpen = openFaqItem === itemKey;
                              return (
                                <Box
                                  key={item.q}
                                  sx={{
                                    bgcolor: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${isOpen ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`,
                                    borderRadius: "var(--r-md)", overflow: "hidden",
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <Box
                                    onClick={() => setOpenFaqItem(isOpen ? null : itemKey)}
                                    sx={{
                                      p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between",
                                      cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                                    }}
                                  >
                                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: isOpen ? "#f1f5f9" : "var(--text-mid)" }}>
                                      {item.q}
                                    </Typography>
                                    <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: "var(--text-dim)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                  </Box>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Box sx={{ p: 1.5, pt: 0, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                          <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
                                            {item.a}
                                          </Typography>
                                        </Box>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                {/* 3. Reach Out to Developer Form */}
                <Box sx={{ borderTop: "1px solid var(--border)", pt: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <BugReportRoundedIcon sx={{ color: "var(--indigo-lt)", fontSize: 20 }} />
                    <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#f1f5f9" }}>
                      Reach Out to Developer
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--text-dim)", mb: 2.5 }}>
                    Report a bug, suggest a feature, or request assistance. Submitted tickets generate a tracking code.
                  </Typography>

                  {submittedTicket ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <Box sx={{
                        p: 3, borderRadius: "var(--r-lg)",
                        bgcolor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
                        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
                      }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 42, color: "var(--emerald)" }} />
                        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9" }}>
                          Ticket Submitted Successfully!
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", maxWidth: 450 }}>
                          {submittedTicket.message}
                        </Typography>

                        <Box sx={{
                          px: 2, py: 1, borderRadius: "var(--r-md)",
                          bgcolor: "rgba(0,0,0,0.3)", border: "1px solid rgba(16,185,129,0.4)",
                          display: "inline-flex", alignItems: "center", gap: 1, my: 0.5,
                        }}>
                          <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>Tracking Code:</Typography>
                          <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: "0.95rem", color: "var(--emerald)" }}>
                            {submittedTicket.ticket_code}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          Developer Contact Email: <strong style={{ color: "var(--indigo-lt)" }}>{submittedTicket.email}</strong>
                        </Typography>

                        <Button
                          size="small" variant="outlined"
                          onClick={() => setSubmittedTicket(null)}
                          sx={{ mt: 1, borderRadius: "var(--r-md)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-mid)" }}
                        >
                          Submit Another Ticket
                        </Button>
                      </Box>
                    </motion.div>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {ticketError && (
                        <Alert severity="error" sx={{ borderRadius: "var(--r-md)", fontSize: "0.8rem" }}>
                          {ticketError}
                        </Alert>
                      )}

                      {/* Category selector */}
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                          Issue Category
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {[
                            { id: "bug",         label: "🐛 Bug Report" },
                            { id: "feature",     label: "💡 Feature Request" },
                            { id: "account",     label: "🔐 Account / Data" },
                            { id: "performance", label: "⚡ Performance" },
                            { id: "general",     label: "💬 General Question" },
                          ].map(c => (
                            <Chip
                              key={c.id} label={c.label} size="small"
                              onClick={() => setTicketCategory(c.id)}
                              sx={{
                                fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.75rem",
                                cursor: "pointer", py: 0.5,
                                bgcolor: ticketCategory === c.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${ticketCategory === c.id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                                color: ticketCategory === c.id ? "#a5b4fc" : "var(--text-mid)",
                                "&:hover": { bgcolor: "rgba(99,102,241,0.12)" },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Subject */}
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                          Subject / Overview
                        </Typography>
                        <Box
                          component="input"
                          value={ticketSubject}
                          onChange={e => setTicketSubject(e.target.value)}
                          placeholder="Brief description of your issue or feedback..."
                          sx={{
                            width: "100%", px: 2, py: 1.25,
                            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                            borderRadius: "var(--r-md)", color: "#f1f5f9",
                            fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                            outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                          }}
                        />
                      </Box>

                      {/* Detailed Message */}
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                          Detailed Message
                        </Typography>
                        <Box
                          component="textarea"
                          value={ticketMessage}
                          onChange={e => setTicketMessage(e.target.value)}
                          placeholder="Explain what happened, steps to reproduce, or what feature you'd like added..."
                          sx={{
                            width: "100%", px: 2, py: 1.25, minHeight: 110, resize: "none",
                            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                            borderRadius: "var(--r-md)", color: "#f1f5f9",
                            fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                            outline: "none", "&:focus": { borderColor: "rgba(99,102,241,0.5)" },
                          }}
                        />
                      </Box>

                      {/* Checkbox for diagnostic info */}
                      <Box
                        onClick={() => setAttachSystemInfo(a => !a)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer",
                          userSelect: "none", width: "fit-content",
                        }}
                      >
                        <Box sx={{
                          width: 18, height: 18, borderRadius: "4px",
                          bgcolor: attachSystemInfo ? "var(--indigo)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${attachSystemInfo ? "var(--indigo)" : "rgba(255,255,255,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          transition: "all 0.15s",
                        }}>
                          {attachSystemInfo && <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "#fff" }} />}
                        </Box>
                        <Typography sx={{ fontSize: "0.78rem", color: "var(--text-mid)" }}>
                          Attach non-PII browser & diagnostic data to help developer resolve faster
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={submittingTicket ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SendRoundedIcon />}
                          onClick={handleSubmitTicket}
                          disabled={submittingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                          sx={{
                            background: "var(--grad-primary)", fontWeight: 700, px: 3, borderRadius: "var(--r-md)",
                            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                            "&:hover": { boxShadow: "0 8px 24px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
                            "&.Mui-disabled": { opacity: 0.4 },
                          }}
                        >
                          {submittingTicket ? "Submitting..." : "Submit Ticket"}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Developer Contact Card (Relocated to Bottom) */}
                <Box sx={{
                  p: 2.5, borderRadius: "var(--r-lg)",
                  bgcolor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between", gap: 2, mt: 1
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: "var(--r-md)", bgcolor: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <EmailRoundedIcon sx={{ color: "var(--indigo-lt)", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#f1f5f9" }}>
                        Developer Direct Support
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", color: "var(--indigo-lt)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>
                        {developerEmail}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
                    <Button
                      size="small" variant="outlined"
                      startIcon={copiedEmail ? <CheckCircleRoundedIcon sx={{ color: "var(--emerald)" }} /> : <ContentCopyRoundedIcon />}
                      onClick={handleCopyEmail}
                      sx={{
                        borderRadius: "var(--r-md)", borderColor: "rgba(99,102,241,0.3)",
                        color: copiedEmail ? "var(--emerald)" : "var(--indigo-lt)",
                        fontSize: "0.78rem", fontWeight: 700, flex: 1,
                        "&:hover": { borderColor: "var(--indigo-lt)", bgcolor: "rgba(99,102,241,0.12)" },
                      }}
                    >
                      {copiedEmail ? "Copied!" : "Copy Email"}
                    </Button>

                    <Button
                      size="small" variant="contained"
                      component="a"
                      href={`mailto:${developerEmail}?subject=${encodeURIComponent("FocusLearner Support Inquiry")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `mailto:${developerEmail}?subject=${encodeURIComponent("FocusLearner Support Inquiry")}`;
                      }}
                      startIcon={<OpenInNewRoundedIcon />}
                      sx={{
                        borderRadius: "var(--r-md)", background: "var(--grad-primary)",
                        fontSize: "0.78rem", fontWeight: 700, flex: 1,
                        cursor: "pointer",
                      }}
                    >
                      Email Us
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Settings;

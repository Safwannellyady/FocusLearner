import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { preferencesAPI, authAPI } from "../services/api";

import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";
import TuneRoundedIcon         from "@mui/icons-material/TuneRounded";
import LockRoundedIcon         from "@mui/icons-material/LockRounded";
import PaletteRoundedIcon      from "@mui/icons-material/PaletteRounded";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import SaveRoundedIcon         from "@mui/icons-material/SaveRounded";
import LogoutRoundedIcon       from "@mui/icons-material/LogoutRounded";
import VisibilityRoundedIcon   from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

const TABS = [
  { id: "profile",     icon: PersonRoundedIcon,  label: "Profile" },
  { id: "study",       icon: TuneRoundedIcon,    label: "Study Preferences" },
  { id: "security",    icon: LockRoundedIcon,    label: "Security" },
  { id: "appearance",  icon: PaletteRoundedIcon, label: "Appearance" },
];

const THEMES = [
  { id: "indigo",    name: "Focus Dark (Default)", primary: "#6366f1", bg: "#080d16" },
  { id: "emerald",   name: "Cyber Mint",          primary: "#10b981", bg: "#06130e" },
  { id: "amber",     name: "Solar Gold",          primary: "#f59e0b", bg: "#130f06" },
  { id: "rose",      name: "Neon Rose",           primary: "#f43f5e", bg: "#14070a" },
  { id: "violet",    name: "Deep Purple",         primary: "#a78bfa", bg: "#0f0918" },
  { id: "sky",       name: "Midnight Cyan",       primary: "#38bdf8", bg: "#05111a" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading,   setLoading]   = useState(false);
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
    fetchPrefs();
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
          Settings & Preferences
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.85rem", mt: 0.5 }}>
          Customize your profile, environment, and security options.
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
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Settings;

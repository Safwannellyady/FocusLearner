import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Button, Divider, IconButton, CircularProgress, LinearProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/api";

import GoogleIcon              from "@mui/icons-material/Google";
import VisibilityIcon          from "@mui/icons-material/Visibility";
import VisibilityOffIcon       from "@mui/icons-material/VisibilityOff";
import AutoAwesomeIcon         from "@mui/icons-material/AutoAwesome";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon       from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import BoltIcon                from "@mui/icons-material/Bolt";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import EmojiEventsRoundedIcon  from "@mui/icons-material/EmojiEventsRounded";
import ShowChartRoundedIcon    from "@mui/icons-material/ShowChartRounded";

/* ── Password strength ──────────────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const tiers = [
    { score: 0, label: "",          color: "transparent"   },
    { score: 1, label: "Weak",      color: "#f43f5e"       },
    { score: 2, label: "Fair",      color: "#f59e0b"       },
    { score: 3, label: "Strong",    color: "#10b981"       },
    { score: 4, label: "Fortress",  color: "#6366f1"       },
  ];
  return tiers[s] || tiers[0];
};

/* ── Custom input ───────────────────────────────────────────────────────────── */
const InputField = ({ label, type = "text", value, onChange, id, required, autoFocus, endAdornment, hint }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ position: "relative" }}>
        <Box component="label" htmlFor={id} sx={{
          position: "absolute", left: 16,
          top: focused || hasValue ? 8 : "50%",
          transform: focused || hasValue ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
          transformOrigin: "left",
          color: focused ? "var(--indigo-lt)" : "var(--text-dim)",
          fontSize: "0.95rem", fontWeight: 500,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          pointerEvents: "none", transition: "all 0.18s ease", zIndex: 1,
        }}>
          {label}{required && <span style={{ color: "var(--rose)", marginLeft: 2 }}>*</span>}
        </Box>
        <Box component="input" id={id} type={type} value={value}
          onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoFocus={autoFocus} autoComplete={type === "password" ? "new-password" : "off"}
          sx={{
            width: "100%",
            pt: hasValue || focused ? "26px" : "16px", pb: "10px", px: 2,
            bgcolor: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${focused ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: "var(--r-md)", color: "#f1f5f9",
            fontSize: "0.98rem", fontFamily: "Plus Jakarta Sans, sans-serif",
            outline: "none", transition: "all 0.18s ease",
            boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            pr: endAdornment ? "48px" : "16px",
          }}
        />
        {endAdornment && (
          <Box sx={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {endAdornment}
          </Box>
        )}
      </Box>
      {hint && <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", mt: 0.5, ml: 0.5 }}>{hint}</Typography>}
    </Box>
  );
};

/* ── Username status indicator ─────────────────────────────────────────────── */
const UsernameStatus = ({ status }) => {
  if (status === "idle") return null;
  const map = {
    checking: { icon: HourglassTopRoundedIcon, color: "var(--text-dim)",  text: "Checking…"    },
    available:{ icon: CheckCircleRoundedIcon,  color: "var(--emerald)",   text: "Available ✓"  },
    taken:    { icon: CancelRoundedIcon,       color: "var(--rose)",      text: "Already taken" },
    invalid:  { icon: CancelRoundedIcon,       color: "var(--amber)",     text: "Invalid format" },
  };
  const { icon: Icon, color, text } = map[status] || {};
  return (
    <AnimatePresence mode="wait">
      <motion.div key={status} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, ml: 0.5 }}>
          <Icon sx={{ fontSize: 13, color }} />
          <Typography sx={{ fontSize: "0.72rem", color, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>{text}</Typography>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Error card ────────────────────────────────────────────────────────────── */
const ErrorCard = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "12px 16px", mb: 2.5, borderRadius: "var(--r-md)", bgcolor: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
          <ErrorOutlineRoundedIcon sx={{ color: "#fb7185", fontSize: 18, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.8rem", color: "#fb7185", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500 }}>{message}</Typography>
        </Box>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Brand features ────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: BoltIcon,                  label: "Start a focus session in seconds", color: "#818cf8" },
  { icon: SportsEsportsRoundedIcon,  label: "5 brain-refresh games on break",   color: "#34d399" },
  { icon: EmojiEventsRoundedIcon,    label: "Earn badges + freebies as you grow",color: "#fbbf24" },
  { icon: ShowChartRoundedIcon,      label: "Track mastery across 15 subjects",  color: "#a78bfa" },
];

/* ── Ambient particle ──────────────────────────────────────────────────────── */
const Particle = ({ style }) => (
  <motion.div
    style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
    animate={{ y: [0, -15, 0], opacity: [0.25, 0.5, 0.25] }}
    transition={{ duration: style.duration || 5, repeat: Infinity, ease: "easeInOut", delay: style.delay || 0 }}
  />
);

/* ══ Signup ══════════════════════════════════════════════════════════════════ */
const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirmPassword: "" });
  const [showPass,      setShowPass]      = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken | invalid
  const [checkTimer,    setCheckTimer]    = useState(null);

  const strength = getStrength(form.password);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  /* real-time username check (debounced 500ms) */
  const checkUsername = useCallback(async (val) => {
    const clean = val.trim();
    if (!clean || clean.length < 3) { setUsernameStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    try {
      const res = await authAPI.checkUsername(clean);
      setUsernameStatus(res.data.available ? "available" : "taken");
    } catch { setUsernameStatus("idle"); }
  }, []);

  useEffect(() => {
    if (checkTimer) clearTimeout(checkTimer);
    const t = setTimeout(() => checkUsername(form.username), 500);
    setCheckTimer(t);
    return () => clearTimeout(t);
  }, [form.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (usernameStatus === "taken")    return setError("That username is already taken.");
    if (usernameStatus === "invalid")  return setError("Username can only contain letters, numbers, and underscores.");
    setLoading(true);
    try {
      const res   = await authAPI.register(form.username.trim(), form.email.trim(), form.password, form.fullName.trim());
      const token = res.data.token || res.data.access_token;
      localStorage.setItem("token", token);
      if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      setGoogleLoading(true); setError("");
      try {
        const res = await authAPI.googleLogin(tokenRes.access_token);
        localStorage.setItem("token", res.data.token || res.data.access_token);
        if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate(res.data.is_new_user ? "/preferences" : "/dashboard");
      } catch (err) { setError(err.response?.data?.error || "Google signup failed."); }
      finally { setGoogleLoading(false); }
    },
    onError: () => { setError("Google signup failed."); setGoogleLoading(false); },
  });

  const canSubmit = form.username && form.email && form.password && form.confirmPassword
    && usernameStatus !== "taken" && usernameStatus !== "invalid" && usernameStatus !== "checking";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "var(--bg)", overflowY: "auto" }}>

      {/* ══ LEFT — Brand Panel ════════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: "none", md: "flex" }, flexDirection: "column",
        width: "45%", flexShrink: 0, position: "relative",
        bgcolor: "#080d16", borderRight: "1px solid var(--border)", overflow: "hidden", minHeight: "100vh",
      }}>
        <Particle style={{ width: 240, height: 240, top: "10%", left: "15%", background: "radial-gradient(circle,rgba(99,102,241,0.16),transparent 70%)", filter: "blur(50px)", duration: 6, delay: 0 }} />
        <Particle style={{ width: 160, height: 160, bottom: "25%", right: "5%",  background: "radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)",  filter: "blur(35px)", duration: 5, delay: 2 }} />
        <Particle style={{ width: 100, height: 100, top: "55%",  left: "5%",    background: "radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)",   filter: "blur(25px)", duration: 7, delay: 1 }} />
        <Box sx={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", p: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "auto" }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Focus<span style={{ color: "var(--indigo)" }}>Learner</span>
            </Typography>
          </Box>

          <Box sx={{ my: 5 }}>
            {/* Stat pills */}
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {[["15", "Subjects"], ["100+", "Micro-topics"], ["5", "Break Games"]].map(([n, l]) => (
                <Box key={l} sx={{ px: 1.5, py: 0.5, bgcolor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "100px" }}>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--indigo-lt)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    <span style={{ color: "#f1f5f9" }}>{n}</span> {l}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { md: "2.2rem", lg: "2.6rem" }, lineHeight: 1.1, letterSpacing: "-0.04em", color: "#f1f5f9", mb: 2.5 }}>
              Build your
              <br />
              <Box component="span" sx={{ background: "var(--grad-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                focus stack
              </Box>
              <br />
              today.
            </Typography>

            <Typography sx={{ color: "var(--text-mid)", fontSize: "0.9rem", lineHeight: 1.65, maxWidth: 320, mb: 4 }}>
              Join students who learn deeper, retain longer, and
              actually enjoy the process.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {FEATURES.map(({ icon: Icon, label, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.09 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: "var(--r-sm)", bgcolor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 15, color }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.845rem", color: "var(--text-mid)", fontWeight: 500 }}>{label}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          <Box sx={{ borderTop: "1px solid var(--border)", pt: 3 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
              FREE · NO CREDIT CARD · START IN 30 SECONDS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ RIGHT — Form Panel ═══════════════════════════════════════════ */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
        p: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, bgcolor: "var(--bg)", overflowY: "auto", minHeight: "100vh",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ width: "100%", maxWidth: 420, paddingTop: 10, paddingBottom: 20 }}
        >


          {/* Mobile logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>
              Focus<span style={{ color: "var(--indigo)" }}>Learner</span>
            </Typography>
          </Box>

          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.03em", color: "#f1f5f9", mb: 0.75 }}>
            Create your account
          </Typography>
          <Typography sx={{ color: "var(--text-dim)", fontSize: "0.87rem", mb: 3.5 }}>
            Free forever. Start in under a minute.
          </Typography>

          <ErrorCard message={error} />

          <Box component="form" onSubmit={handleSubmit}>
            <InputField id="su-fullname" label="Full Name" value={form.fullName} onChange={set("fullName")} autoFocus />

            {/* Username with live check */}
            <Box sx={{ mb: 0.5 }}>
              <InputField
                id="su-username" label="Username" value={form.username}
                onChange={set("username")} required
                hint=""
                endAdornment={
                  usernameStatus === "available" ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "var(--emerald)" }} /> :
                  usernameStatus === "taken"     ? <CancelRoundedIcon      sx={{ fontSize: 18, color: "var(--rose)"    }} /> :
                  usernameStatus === "checking"  ? <CircularProgress size={14} sx={{ color: "var(--text-dim)" }} /> : null
                }
              />
              <UsernameStatus status={usernameStatus} />
            </Box>

            <InputField id="su-email"    label="Email"    type="email"    value={form.email}    onChange={set("email")}    required />

            <InputField
              id="su-password" label="Password" type={showPass ? "text" : "password"}
              value={form.password} onChange={set("password")} required
              endAdornment={
                <IconButton size="small" onClick={() => setShowPass(p => !p)} sx={{ color: "var(--text-dim)", p: 0.5 }}>
                  {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              }
            />

            {/* Password strength meter */}
            {form.password.length > 0 && (
              <Box sx={{ mb: 2, mt: -1.25 }}>
                <LinearProgress
                  variant="determinate"
                  value={(strength.score / 4) * 100}
                  sx={{
                    height: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.06)",
                    "& .MuiLinearProgress-bar": { bgcolor: strength.color, transition: "all 0.35s ease" },
                  }}
                />
                {strength.label && (
                  <Typography sx={{ fontSize: "0.68rem", color: strength.color, mt: 0.5, ml: 0.5, fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {strength.label}
                    {strength.score < 3 && " — add uppercase, numbers or symbols"}
                  </Typography>
                )}
              </Box>
            )}

            <InputField
              id="su-confirm" label="Confirm Password" type={showConfirm ? "text" : "password"}
              value={form.confirmPassword} onChange={set("confirmPassword")} required
              endAdornment={
                <IconButton size="small" onClick={() => setShowConfirm(p => !p)} sx={{ color: "var(--text-dim)", p: 0.5 }}>
                  {showConfirm ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              }
            />

            {/* Passwords match indicator */}
            {form.confirmPassword.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: -1.5, mb: 2, ml: 0.5 }}>
                {form.password === form.confirmPassword
                  ? <><CheckCircleRoundedIcon sx={{ fontSize: 13, color: "var(--emerald)" }} /><Typography sx={{ fontSize: "0.7rem", color: "var(--emerald)", fontWeight: 600 }}>Passwords match</Typography></>
                  : <><CancelRoundedIcon      sx={{ fontSize: 13, color: "var(--rose)"    }} /><Typography sx={{ fontSize: "0.7rem", color: "var(--rose)",    fontWeight: 600 }}>Passwords do not match</Typography></>
                }
              </Box>
            )}

            <Button
              type="submit" fullWidth variant="contained"
              disabled={loading || !canSubmit}
              endIcon={loading ? null : <ArrowForwardRoundedIcon />}
              sx={{
                py: 1.4, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700, borderRadius: "var(--r-md)", mb: 2,
                background: "var(--grad-primary)",
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                "&:hover": { boxShadow: "0 10px 28px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
                "&.Mui-disabled": { opacity: 0.45 },
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create Account"}
            </Button>

            <Divider sx={{ my: 2.5, "&::before,&::after": { borderColor: "var(--border)" } }}>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", px: 1, fontWeight: 600, letterSpacing: "0.08em" }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Button
              fullWidth variant="outlined"
              startIcon={googleLoading ? <CircularProgress size={16} /> : <GoogleIcon sx={{ fontSize: "18px !important" }} />}
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading || loading}
              sx={{
                py: 1.25, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600,
                fontSize: "0.88rem", borderRadius: "var(--r-md)", mb: 3,
                borderColor: "var(--border)", color: "var(--text-mid)",
                "&:hover": { borderColor: "var(--border-active)", bgcolor: "rgba(255,255,255,0.04)", color: "#f1f5f9" },
              }}
            >
              {googleLoading ? "Signing up…" : "Continue with Google"}
            </Button>

            <Typography sx={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-dim)" }}>
              Already have an account?{" "}
              <Box component={Link} to="/login" sx={{ color: "var(--indigo-lt)", fontWeight: 700, textDecoration: "none", "&:hover": { color: "#f1f5f9" } }}>
                Sign in →
              </Box>
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Signup;

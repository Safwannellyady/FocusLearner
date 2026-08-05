import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Button, Divider, IconButton, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/api";

// Icons
import GoogleIcon                from "@mui/icons-material/Google";
import VisibilityIcon            from "@mui/icons-material/Visibility";
import VisibilityOffIcon         from "@mui/icons-material/VisibilityOff";
import AutoAwesomeIcon           from "@mui/icons-material/AutoAwesome";
import BoltIcon                  from "@mui/icons-material/Bolt";
import SportsEsportsRoundedIcon  from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon      from "@mui/icons-material/ShowChartRounded";
import SchoolRoundedIcon         from "@mui/icons-material/SchoolRounded";
import LockPersonRoundedIcon     from "@mui/icons-material/LockPersonRounded";
import ErrorOutlineRoundedIcon   from "@mui/icons-material/ErrorOutlineRounded";
import ArrowForwardRoundedIcon   from "@mui/icons-material/ArrowForwardRounded";

/* ── Styled input ──────────────────────────────────────────────────────────── */
const InputField = ({ label, type = "text", value, onChange, id, autoFocus, endAdornment }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <Box sx={{ position: "relative", mb: 2 }}>
      <Box
        component="label"
        htmlFor={id}
        sx={{
          position: "absolute",
          left: 16,
          top: focused || hasValue ? 8 : "50%",
          transform: focused || hasValue ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
          transformOrigin: "left",
          color: focused ? "var(--indigo-lt)" : "var(--text-dim)",
          fontSize: "0.95rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontWeight: 500,
          pointerEvents: "none",
          transition: "all 0.18s ease",
          zIndex: 1,
        }}
      >
        {label}
      </Box>
      <Box
        component="input"
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={type === "password" ? "current-password" : "username"}
        sx={{
          width: "100%",
          pt: hasValue || focused ? "26px" : "16px",
          pb: "10px",
          px: 2,
          bgcolor: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${focused ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: "var(--r-md)",
          color: "#f1f5f9",
          fontSize: "0.98rem",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          outline: "none",
          transition: "all 0.18s ease",
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
  );
};

/* ── Creative error card ───────────────────────────────────────────────────── */
const ErrorCard = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        key="error"
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <Box
          sx={{
            display: "flex", alignItems: "flex-start", gap: 1.5,
            p: "12px 16px", mb: 2.5,
            borderRadius: "var(--r-md)",
            bgcolor: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ color: "#fb7185", fontSize: 18, mt: 0.15, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#fb7185", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Access Denied
            </Typography>
            <Typography sx={{ fontSize: "0.77rem", color: "rgba(251,113,133,0.8)", mt: 0.2, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {message}
            </Typography>
          </Box>
          {/* Lock icon that "glitches" on error */}
          <Box sx={{ ml: "auto" }}>
            <motion.div
              animate={{ rotate: [0, -12, 12, -8, 8, 0], x: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <LockPersonRoundedIcon sx={{ color: "rgba(244,63,94,0.5)", fontSize: 22 }} />
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Brand features list ───────────────────────────────────────────────────── */
const FEATURES = [
  { icon: BoltIcon,                  label: "AI-powered focus sessions",     color: "#818cf8" },
  { icon: SportsEsportsRoundedIcon,  label: "Brain-refresh games on breaks", color: "#34d399" },
  { icon: ShowChartRoundedIcon,      label: "Deep learning analytics",       color: "#fbbf24" },
  { icon: SchoolRoundedIcon,         label: "15 subjects, 100+ micro-topics",color: "#a78bfa" },
];

/* ── Floating particle (ambient bg) ───────────────────────────────────────── */
const Particle = ({ style }) => (
  <motion.div
    style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
    animate={{ y: [0, -18, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: style.duration || 4, repeat: Infinity, ease: "easeInOut", delay: style.delay || 0 }}
  />
);

/* ══ Login ══════════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const [username,       setUsername]       = useState("");
  const [password,       setPassword]       = useState("");
  const [showPass,       setShowPass]       = useState(false);
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [googleLoading,  setGoogleLoading]  = useState(false);

  // Animated clock for brand panel
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res   = await authAPI.login(username.trim(), password);
      const token = res.data.token || res.data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      setGoogleLoading(true);
      setError("");
      try {
        const res   = await authAPI.googleLogin(tokenRes.access_token);
        const token = res.data.token || res.data.access_token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate(res.data.is_new_user ? "/preferences" : "/dashboard");
      } catch (err) {
        setError(err.response?.data?.error || "Google login failed.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => { setError("Google login failed."); setGoogleLoading(false); },
  });

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", overflow: "hidden",
      bgcolor: "var(--bg)", fontFamily: "Plus Jakarta Sans, sans-serif",
    }}>

      {/* ══ LEFT — Brand Panel ══════════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: "none", md: "flex" }, flexDirection: "column",
        width: "48%", flexShrink: 0, position: "relative",
        bgcolor: "#080d16",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Ambient particles */}
        <Particle style={{ width: 220, height: 220, top: "15%", left: "20%", background: "radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)", filter: "blur(40px)", duration: 6, delay: 0 }} />
        <Particle style={{ width: 160, height: 160, bottom: "20%", right: "10%", background: "radial-gradient(circle,rgba(59,130,246,0.14),transparent 70%)", filter: "blur(30px)", duration: 5, delay: 1.5 }} />
        <Particle style={{ width: 100, height: 100, top: "60%", left: "10%", background: "radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)", filter: "blur(20px)", duration: 7, delay: 0.8 }} />

        {/* Grid overlay */}
        <Box sx={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", p: 5 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "auto" }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Focus<span style={{ color: "var(--indigo)" }}>Learner</span>
            </Typography>
          </Box>

          {/* Main copy */}
          <Box sx={{ my: 5 }}>
            {/* Live clock */}
            <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--indigo-lt)", letterSpacing: "0.12em", mb: 2, opacity: 0.8 }}>
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} — STUDY SESSION AVAILABLE
            </Typography>

            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: { md: "2.4rem", lg: "2.8rem" }, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#f1f5f9", mb: 2.5 }}>
              Your mind is
              <br />the lab.{" "}
              <Box component="span" sx={{ background: "var(--grad-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Focus is
              </Box>
              <br />the experiment.
            </Typography>

            <Typography sx={{ color: "var(--text-mid)", fontSize: "0.92rem", lineHeight: 1.65, maxWidth: 340, mb: 4 }}>
              An AI-powered distraction-free environment designed for
              deep work, gamified retention, and long-term mastery.
            </Typography>

            {/* Features */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {FEATURES.map(({ icon: Icon, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: "var(--r-sm)", bgcolor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 15, color }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.845rem", color: "var(--text-mid)", fontWeight: 500 }}>
                      {label}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Bottom quote */}
          <Box sx={{ borderTop: "1px solid var(--border)", pt: 3 }}>
            <Typography sx={{ fontSize: "0.82rem", color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>
              "The secret of getting ahead is getting started."
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "var(--text-dim)", mt: 0.5, opacity: 0.7 }}>
              — Mark Twain
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ RIGHT — Form Panel ══════════════════════════════════════════════ */}
      <Box sx={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        p: { xs: 3, md: 5 }, bgcolor: "var(--bg)",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { md: "none" }, mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>
              Focus<span style={{ color: "var(--indigo)" }}>Learner</span>
            </Typography>
          </Box>

          <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "-0.03em", color: "#f1f5f9", mb: 0.75 }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: "var(--text-dim)", fontSize: "0.87rem", mb: 3.5 }}>
            Sign in to continue your learning journey
          </Typography>

          <ErrorCard message={error} />

          <Box component="form" onSubmit={handleSubmit}>
            <InputField
              id="login-username"
              label="Username or Email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
            <InputField
              id="login-password"
              label="Password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              endAdornment={
                <IconButton size="small" onClick={() => setShowPass(p => !p)} sx={{ color: "var(--text-dim)", p: 0.5 }}>
                  {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              }
            />

            <Box sx={{ textAlign: "right", mb: 2.5, mt: -1 }}>
              <Typography
                component="span"
                sx={{ fontSize: "0.78rem", color: "var(--indigo-lt)", cursor: "pointer", fontWeight: 600, "&:hover": { color: "#f1f5f9" } }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !username || !password}
              endIcon={loading ? null : <ArrowForwardRoundedIcon />}
              sx={{
                py: 1.4, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700, borderRadius: "var(--r-md)", mb: 2,
                background: "var(--grad-primary)",
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                "&:hover": { boxShadow: "0 10px 28px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
                "&.Mui-disabled": { opacity: 0.5 },
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Sign In"}
            </Button>

            <Divider sx={{ my: 2.5, "&::before,&::after": { borderColor: "var(--border)" } }}>
              <Typography sx={{ fontSize: "0.72rem", color: "var(--text-dim)", px: 1, fontWeight: 600, letterSpacing: "0.08em" }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
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
              {googleLoading ? "Signing in…" : "Sign in with Google"}
            </Button>

            <Typography sx={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-dim)" }}>
              No account?{" "}
              <Box component={Link} to="/signup" sx={{ color: "var(--indigo-lt)", fontWeight: 700, textDecoration: "none", "&:hover": { color: "#f1f5f9" } }}>
                Create one free →
              </Box>
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Login;

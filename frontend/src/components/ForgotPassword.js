import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, TextField, Button, CircularProgress, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { authAPI } from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "var(--bg)", p: 3 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: "100%", maxWidth: 420 }}>
        <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#f1f5f9", mb: 0.75 }}>
          Reset your password
        </Typography>
        <Typography sx={{ color: "var(--text-dim)", fontSize: "0.87rem", mb: 3.5 }}>
          Enter your email and we'll send you a reset link.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
        {sent && <Alert severity="success" sx={{ mb: 2.5 }}>If that email is registered, a password reset link has been issued.</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 2.5,
              "& .MuiInputBase-root": { color: "#f1f5f9" },
              "& .MuiInputLabel-root": { color: "var(--text-dim)" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
            }}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading || !email} sx={{
            py: 1.4, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700, borderRadius: "var(--r-md)", mb: 2,
            background: "var(--grad-primary)", boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
          }}>
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Send reset link"}
          </Button>
          <Typography sx={{ textAlign: "center", fontSize: "0.84rem", color: "var(--text-dim)" }}>
            <Link to="/login" style={{ color: "var(--indigo-lt)", fontWeight: 700, textDecoration: "none" }}>Back to login</Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ForgotPassword;

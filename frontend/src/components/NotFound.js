import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

/** Catch-all 404 page for unknown routes. */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        gap: 1.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 900,
          fontSize: "4rem",
          background: "var(--grad-primary)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
        }}
      >
        404
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#f1f5f9" }}>
        This page doesn't exist
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "var(--text-dim)", maxWidth: 380, lineHeight: 1.6, mb: 1 }}>
        The link you followed may be broken, or the page may have been moved.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<HomeRoundedIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: "var(--r-md)" }}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "var(--r-md)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-mid)" }}
        >
          Go back
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;

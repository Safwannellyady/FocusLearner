import React from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

/**
 * Route-level error boundary. A crash in one page (e.g. Study Room) renders
 * this fallback instead of blanking the entire app, with retry + navigation
 * so the user is never stuck on a dead screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary${this.props.pageName ? `:${this.props.pageName}` : ""}]`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
          gap: 1.5,
        }}
        role="alert"
      >
        <Typography sx={{ fontSize: "2.5rem" }}>😵</Typography>
        <Typography
          sx={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "#f1f5f9",
          }}
        >
          Something went wrong on this page
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "var(--text-dim)", maxWidth: 420, lineHeight: 1.6 }}>
          The rest of the app is fine — this page just hit an unexpected error.
          Try reloading it, or head back to your dashboard.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={this.handleRetry}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "var(--r-md)" }}
          >
            Try again
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeRoundedIcon />}
            onClick={this.handleHome}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "var(--r-md)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-mid)" }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }
}

export default ErrorBoundary;

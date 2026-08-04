import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandPalette from "../common/CommandPalette";

/**
 * Root layout shell.
 * ┌──────────────────────────────────────┐
 * │ Sidebar (fixed width, full height)   │
 * │ ┌────────────────────────────────┐   │
 * │ │ Navbar (sticky top, flex row)  │   │
 * │ ├────────────────────────────────┤   │
 * │ │ Page content (scrollable)      │   │
 * │ └────────────────────────────────┘   │
 * └──────────────────────────────────────┘
 *
 * Overflow strategy:
 *  - Outer wrapper: overflow hidden (clips everything)
 *  - Content area:  overflow-y auto  (only scrollable pane)
 *  - No element uses vw/% widths that exceed 100%
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [cmdOpen,     setCmdOpen]     = useState(false);
  const navigate = useNavigate();

  // Close sidebar automatically on small screens
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    if (mq.matches) setSidebarOpen(false);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Ctrl+K → command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const SIDEBAR_W    = sidebarOpen ? 240 : 68;
  const SIDEBAR_W_PX = `${SIDEBAR_W}px`;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",          // ← kills ALL overflow at root
        bgcolor: "var(--bg)",
        position: "relative",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        width={SIDEBAR_W}
      />

      {/* ── Main column ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,              // ← crucial: prevents flex child blowout
          overflow: "hidden",
          transition: "margin-left 0.25s ease",
        }}
      >
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          onCmdClick={() => setCmdOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {/* ── Scrollable page content ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            bgcolor: "var(--bg)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </Box>
      </Box>

      {/* ── Command Palette overlay ── */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={(path) => { navigate(path); setCmdOpen(false); }}
      />
    </Box>
  );
};

export default Layout;

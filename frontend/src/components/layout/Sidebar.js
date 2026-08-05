import React from "react";
import {
  Box, Typography, Tooltip,
  IconButton, Avatar, Drawer,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardRoundedIcon      from "@mui/icons-material/DashboardRounded";
import AutoStoriesIcon           from "@mui/icons-material/AutoStories";
import SchoolRoundedIcon         from "@mui/icons-material/SchoolRounded";
import TimerRoundedIcon          from "@mui/icons-material/TimerRounded";
import EmojiEventsRoundedIcon    from "@mui/icons-material/EmojiEventsRounded";
import SportsEsportsRoundedIcon  from "@mui/icons-material/SportsEsportsRounded";
import ShowChartRoundedIcon      from "@mui/icons-material/ShowChartRounded";
import SettingsRoundedIcon       from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon         from "@mui/icons-material/LogoutRounded";
import ChevronLeftIcon           from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon          from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon           from "@mui/icons-material/AutoAwesome";

const NAV = [
  { label: "Dashboard",    icon: DashboardRoundedIcon,     path: "/dashboard"    },
  { label: "My Sessions",  icon: SchoolRoundedIcon,        path: "/my-courses"   },
  { label: "Focus Timer",  icon: TimerRoundedIcon,         path: "/manage-focus" },
  { label: "Game Lab",     icon: SportsEsportsRoundedIcon, path: "/games"        },
  { label: "Analytics",    icon: ShowChartRoundedIcon,     path: "/analytics"    },
  { label: "Badges",       icon: EmojiEventsRoundedIcon,   path: "/badges"       },
];

const NavItem = ({ item, open, active, onClick }) => {
  const Icon = item.icon;
  return (
    <Tooltip title={open ? "" : item.label} placement="right" arrow>
      <Box
        onClick={onClick}
        sx={{
          display:        "flex",
          alignItems:     "center",
          gap:            open ? 1.25 : 0,
          px:             open ? 1.5 : 0,
          py:             0.75,
          borderRadius:   "var(--r-md)",
          cursor:         "pointer",
          justifyContent: open ? "flex-start" : "center",
          bgcolor:        active ? "rgba(99,102,241,0.13)" : "transparent",
          border:         `1px solid ${active ? "rgba(99,102,241,0.32)" : "transparent"}`,
          color:          active ? "#a5b4fc" : "var(--text-mid)",
          transition:     "all 0.15s ease",
          userSelect:     "none",
          mb:             0.4,
          "&:hover": {
            bgcolor:   active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
            color:     "#f1f5f9",
            transform: "translateX(2px)",
          },
          "&:active": { transform: "scale(0.97)" },
        }}
      >
        <Box sx={{
          width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "var(--r-sm)",
          bgcolor: active ? "rgba(99,102,241,0.18)" : "transparent",
          flexShrink: 0, transition: "background 0.15s",
        }}>
          <Icon sx={{ fontSize: 17, color: active ? "#818cf8" : "inherit" }} />
        </Box>
        {open && (
          <Typography noWrap sx={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: active ? 700 : 500,
            fontSize:   "0.845rem",
            lineHeight: 1,
            color: "inherit",
          }}>
            {item.label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

const SidebarContent = ({ open, setOpen, navigate, location }) => {
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const userStr = localStorage.getItem("user");
  let user = { username: "User" };
  try { if (userStr) user = JSON.parse(userStr); } catch {}
  const initials = (user?.full_name || user?.username || "FL").substring(0, 2).toUpperCase();

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Brand */}
      <Box sx={{
        display: "flex", alignItems: "center",
        gap: open ? 1.5 : 0, justifyContent: open ? "flex-start" : "center",
        px: 2, height: 60, borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "var(--r-md)",
          background: "var(--grad-primary)", display: "flex",
          alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.28)",
        }}>
          <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 16 }} />
        </Box>
        {open && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "#f1f5f9", lineHeight: 1.1 }}>
              Focus<span style={{ color: "var(--indigo)" }}>Learner</span>
            </Typography>
            <Typography sx={{ fontSize: "0.58rem", color: "var(--text-dim)", fontWeight: 600, letterSpacing: "0.1em" }}>
              ACADEMIC STUDIO
            </Typography>
          </Box>
        )}
      </Box>

      {/* Toggle */}
      <Box sx={{ display: "flex", justifyContent: open ? "flex-end" : "center", px: 1.5, pt: 1.25, pb: 0.5 }}>
        <IconButton
          size="small" onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
          sx={{ color: "var(--text-dim)", borderRadius: "var(--r-sm)", width: 26, height: 26, "&:hover": { bgcolor: "rgba(255,255,255,0.07)", color: "#f1f5f9" } }}
        >
          {open ? <ChevronLeftIcon sx={{ fontSize: 16 }} /> : <ChevronRightIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 1.25, py: 0.5 }}>
        {open && (
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", px: 1.5, pb: 0.75, pt: 0.25 }}>
            Navigation
          </Typography>
        )}
        {NAV.map(item => (
          <NavItem
            key={item.path}
            item={item}
            open={open}
            active={location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path))}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 1.25, py: 1.25, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 0.5 }}>
        {open ? (
          <Box
            onClick={() => navigate("/preferences")}
            sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 0.75, borderRadius: "var(--r-md)", cursor: "pointer", mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: "0.65rem", fontWeight: 700, background: "var(--grad-primary)", flexShrink: 0 }}>
              {initials}
            </Avatar>
            <Box sx={{ overflow: "hidden", flex: 1 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#f1f5f9" }} noWrap>
                {user?.full_name || user?.username}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "var(--text-dim)" }} noWrap>
                Settings
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title="Settings" placement="right">
            <Avatar onClick={() => navigate("/preferences")} sx={{ width: 28, height: 28, fontSize: "0.65rem", cursor: "pointer", background: "var(--grad-primary)", mx: "auto", mb: 0.5 }}>
              {initials}
            </Avatar>
          </Tooltip>
        )}

        <Tooltip title={open ? "" : "Logout"} placement="right">
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex", alignItems: "center", gap: open ? 1.25 : 0,
              px: open ? 1.5 : 0, py: 0.75, borderRadius: "var(--r-md)",
              cursor: "pointer", justifyContent: open ? "flex-start" : "center",
              color: "rgba(244,63,94,0.6)", transition: "all 0.15s",
              "&:hover": { bgcolor: "rgba(244,63,94,0.09)", color: "#fb7185" },
            }}
          >
            <Box sx={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoutRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            {open && <Typography sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.815rem", color: "inherit" }}>Logout</Typography>}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Sidebar = ({ open, setOpen, mobileOpen, onMobileClose, width }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const paperSx = { width, bgcolor: "var(--bg-surface)", borderRight: "1px solid var(--border)", overflowX: "hidden", overflowY: "hidden", transition: "width 0.25s ease", boxSizing: "border-box" };

  return (
    <>
      <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { ...paperSx, width: 240 } }}>
        <SidebarContent open={true} setOpen={setOpen} navigate={navigate} location={location} />
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, width, flexShrink: 0, "& .MuiDrawer-paper": paperSx }} open>
        <SidebarContent open={open} setOpen={setOpen} navigate={navigate} location={location} />
      </Drawer>
    </>
  );
};

export default Sidebar;

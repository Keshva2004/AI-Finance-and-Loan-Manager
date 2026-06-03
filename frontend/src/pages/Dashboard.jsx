import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { createTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CalculateIcon from "@mui/icons-material/Calculate";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";

import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider } from "@toolpad/core/internal";

import logo from "../assets/MainLogo.jpg";

const NAVIGATION = [
  { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "dashboard/clients", title: "Clients", icon: <PeopleIcon /> },
  {
    segment: "dashboard/loan-accounts",
    title: "Loan Accounts",
    icon: <AccountBalanceIcon />,
  },
  {
    segment: "dashboard/Calculator",
    title: "Calculator",
    icon: <CalculateIcon />,
  },
  {
    segment: "dashboard/payments",
    title: "Payments",
    icon: <ReceiptLongIcon />,
  },
  {
    segment: "dashboard/documents",
    title: "Documents",
    icon: <DescriptionIcon />,
  },
  {
    segment: "dashboard/nominee-details",
    title: "Nominee Details",
    icon: <PersonIcon />,
  },
  { segment: "dashboard/profile", title: "Profile", icon: <PersonIcon /> },
];

// Dynamic theme depending on mode
const getCustomTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#1976d2" },
      background: {
        default: mode === "light" ? "#f5f7fa" : "#121212",
        paper: mode === "light" ? "#fff" : "#1e1e1e",
      },
      text: {
        primary: mode === "light" ? "#000" : "#fff",
      },
    },
    components: {
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: "4px 8px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(25, 118, 210, 0.08)"
                  : "rgba(144, 202, 249, 0.2)", // lighter blue hover in dark mode
              transform: "scale(1.02)",
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
            color: "inherit",
          },
        },
      },
    },
  });

function DashboardContent({ window }) {
  const [mode, setMode] = React.useState("light"); // Enable dark/light mode toggle
  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const authentication = React.useMemo(() => undefined, []);
  const demoWindow = typeof window !== "undefined" ? window : undefined;

  const theme = React.useMemo(() => getCustomTheme(mode), [mode]);

  // Add toggle button to Sidebar or Header
  // Using DashboardLayout slots to add custom element to header (if supported)
  // If DashboardLayout does not support slots/header, consider placing toggle inside Box here or a custom header component

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
  session={null}
  authentication={authentication}
  theme={theme}
  window={demoWindow}
  navigation={NAVIGATION}
  branding={{
    logo: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 42,          // fixed height container to match logo height
          padding: '0 12px',   // fixed horizontal padding, same for both modes
          borderRadius: 8,
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        <img
          src={logo}
          alt="Main Logo"
          style={{
            height: '100%',     // fill container height exactly
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    title: "",
  }}
>

        <DashboardLayout>
          <Box
            sx={{
              py: 4,
              px: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              boxShadow:
                mode === "light"
                  ? "0 2px 8px rgba(0,0,0,0.05)"
                  : "0 2px 8px rgba(0,0,0,0.7)",
              minHeight: "85vh",
              position: "relative",
            }}
          >
            {/* Dark/light mode toggle button top right */}
            <IconButton
              onClick={toggleMode}
              color="inherit"
              sx={{ position: "absolute", top: 16, right: 16 }}
              aria-label="Toggle light/dark mode"
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            <Outlet />
          </Box>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardContent.propTypes = {
  window: PropTypes.func,
};

function DashboardLayoutAccount(props) {
  return <DashboardContent {...props} />;
}

DashboardLayoutAccount.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutAccount;

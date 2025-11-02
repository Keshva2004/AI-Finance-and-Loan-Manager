import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { Outlet, useLocation, Link } from "react-router-dom"; // Keep Link for custom nav rendering if you decide to keep it in the future

// MUI Components and Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person"; // For profile icon
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalculateIcon from "@mui/icons-material/Calculate";

// Toolpad imports
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider } from "@toolpad/core/internal";

// Local imports
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

// 1. Modified to be a static "light" theme creator
const getCustomTheme = () =>
  createTheme({
    cssVariables: { colorSchemeSelector: "data-toolpad-color-scheme" },
    colorSchemes: { light: true, dark: true },
    palette: {
      mode: "light", // Fixed mode to 'light'
      primary: { main: "#1976d2" },
      background: {
        default: "#f5f7fa",
        paper: "#ffffff",
      },
      text: {
        primary: "#000000",
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
              backgroundColor: "rgba(25, 118, 210, 0.08)", // Light mode hover
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
  // 2. Remove session state - NO LONGER NEEDED as we remove the profile icon
  // const [session, setSession] = React.useState({...});

  // 3. Remove mode state - NO LONGER NEEDED
  // const [mode, setMode] = React.useState("light");

  // Authentication is now null/undefined to remove user icon
  const authentication = React.useMemo(() => undefined, []);

  const demoWindow = typeof window !== "undefined" ? window : undefined;
  // const location = useLocation(); // Not needed if we use Toolpad's default navigation

  // 4. Use a fixed 'light' theme
  const theme = React.useMemo(() => getCustomTheme(), []);

  // 5. Remove the custom renderNavigation function entirely.
  //    By deleting this, we rely on DashboardLayout's internal navigation rendering,
  //    and we also delete the dark/light mode toggle logic that was inside it.

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        // 6. Set session to null or omit to remove the top-right profile icon
        session={null}
        authentication={authentication} // This is now undefined/null
        theme={theme}
        window={demoWindow}
        navigation={NAVIGATION}
        branding={{
          logo: (
            <img
              src={logo}
              alt="Main Logo"
              style={{
                height: 42,
                borderRadius: 8,
                marginRight: 8,
                objectFit: "contain",
              }}
            />
          ),
          title: "",
        }}
      >
        <DashboardLayout
        // 7. Remove the 'slots' prop to use the default sidebar rendering
        // slots={{ sidebar: renderNavigation }}
        >
          {/* Main Content Area Styling - adjust as needed for light mode */}
          <Box
            sx={{
              py: 4,
              px: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              // Fixed light mode box-shadow
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              minHeight: "85vh",
            }}
          >
            <Outlet />
          </Box>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardContent.propTypes = { window: PropTypes.func };

function DashboardLayoutAccount(props) {
  return <DashboardContent {...props} />;
}

DashboardLayoutAccount.propTypes = { window: PropTypes.func };

export default DashboardLayoutAccount;

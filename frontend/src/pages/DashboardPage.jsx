import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { Line, Pie, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title, // Added for chart titles
} from "chart.js";
import axios from "axios";

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title // Registered for titles
);

const teal = "#00bfa5";
const blue = "#2962ff";
const purple = "#aa00ff";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data } = await axios.get(
          "http://localhost:8080/dashboard/summary"
        );
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f2f5",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  if (!summary)
    return (
      <Typography sx={{ m: 4 }} variant="h6" color="text.secondary">
        No data available
      </Typography>
    );

  // Chart data and options
  const pieData = {
    labels: summary.loanStatusCounts.map((s) => s._id || "Unknown"),
    datasets: [
      {
        data: summary.loanStatusCounts.map((s) => s.count),
        backgroundColor: [teal, blue, purple],
        hoverOffset: 20,
      },
    ],
  };

  const doughnutData = {
    labels: summary.loanStatusCounts.map((s) => s._id || "Unknown"),
    datasets: [
      {
        data: summary.loanStatusCounts.map((s) => s.count),
        backgroundColor: [purple, teal, blue],
        hoverOffset: 20,
      },
    ],
  };

  const lineData = {
    labels: [
      "Page A",
      "Page B",
      "Page C",
      "Page D",
      "Page E",
      "Page F",
      "Page G",
    ],
    datasets: [
      {
        label: "pv",
        data: [3000, 4000, 3500, 3200, 5000, 4900, 6000],
        borderColor: teal,
        fill: false,
        tension: 0.3,
      },
      {
        label: "uv",
        data: [2000, 3000, 4000, 4100, 3000, 4200, 5000],
        borderColor: blue,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const barData = {
    labels: [
      "Page A",
      "Page B",
      "Page C",
      "Page D",
      "Page E",
      "Page F",
      "Page G",
    ],
    datasets: [
      {
        label: "pv",
        data: [3000, 2300, 3500, 2700, 4200, 3900, 4000],
        backgroundColor: teal,
      },
      {
        label: "uv",
        data: [2000, 2900, 3000, 3200, 2700, 3600, 4200],
        backgroundColor: blue,
      },
    ],
  };

  // Stat card component for clarity
  const StatCard = ({
    icon,
    value,
    label,
    iconBgColor,
    textAlign = "left",
    currency,
  }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 2,
        bgcolor: "#ffffff",
        minWidth: 250,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Avatar
        sx={{
          bgcolor: iconBgColor,
          width: 52,
          height: 52,
          color: "white",
          fontSize: 28,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flexGrow: 1, textAlign }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {currency ? `₹${value.toLocaleString()}` : value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            value={summary.totalClients}
            label="Clients"
            iconBgColor="#6a1b9a" // Darker purple for more interactive feel
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountBalanceWalletIcon />}
            value={summary.totalLoans}
            label="Loan Accounts"
            iconBgColor="#1565c0" // Darker blue for more interactive feel
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PaidIcon />}
            value={summary.totalLoanAmount}
            label="Loan Distributed"
            iconBgColor="#f57c00" // Darker orange/yellow for more interactive feel
            currency
            textAlign="right"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MonetizationOnIcon />}
            value={summary.totalLoanCollected}
            label="Loan Collected"
            iconBgColor="#c62828" // Darker red for more interactive feel
            currency
            textAlign="right"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
              height: 320,
              bgcolor: "white",
            }}
          >
            <Line
              height={280}
              data={lineData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: "Loan Trends Over Time (PV and UV Metrics)", // Added informative title
                    font: { size: 16, weight: "bold" },
                    color: "#333",
                  },
                  legend: { labels: { color: "#555", font: { size: 14 } } },
                  tooltip: { mode: "index", intersect: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: "#666", font: { size: 13 } },
                    grid: { color: "#eee" },
                  },
                  x: {
                    ticks: { color: "#666", font: { size: 13 } },
                    grid: { color: "#eee" },
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5} container spacing={3} direction="column">
          <Grid item sx={{ height: 160 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                height: "100%",
                bgcolor: "white",
              }}
            >
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: "Comparison of PV and UV Values", // Added informative title
                      font: { size: 14, weight: "bold" },
                      color: "#333",
                    },
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { font: { size: 13 }, color: "#666" },
                      grid: { color: "#eee" },
                    },
                    x: {
                      ticks: { font: { size: 13 }, color: "#666" },
                      grid: { color: "#eee" },
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </Paper>
          </Grid>

          <Grid item container spacing={3} sx={{ height: 160 }}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 1,
                  borderRadius: 2,
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  height: "100%",
                  bgcolor: "white",
                }}
              >
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Loan Status Distribution", // Added informative title
                        font: { size: 12, weight: "bold" },
                        color: "#333",
                      },
                      legend: {
                        position: "bottom",
                        labels: { font: { size: 12 }, color: "#555" },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 1,
                  borderRadius: 2,
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  height: "100%",
                  bgcolor: "white",
                }}
              >
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Loan Status Breakdown", // Added informative title
                        font: { size: 12, weight: "bold" },
                        color: "#333",
                      },
                      legend: {
                        position: "bottom",
                        labels: { font: { size: 12 }, color: "#555" },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

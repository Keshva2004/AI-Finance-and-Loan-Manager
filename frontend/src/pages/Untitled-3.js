import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";

export default function Calculator() {
  const theme = useTheme();

  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [period, setPeriod] = useState("");
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  const formatNumber = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const calculateEMI = () => {
    let P = Number(amount);
    let R = Number(interest) / 100 / 12;
    let N = Number(period) * 12;

    if (!P || !R || !N) {
      alert("Please enter all values before calculating.");
      return;
    }

    let emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) || 0;
    let totalAmt = emiValue * N;
    let totalInt = totalAmt - P;

    setEmi(Math.round(emiValue));
    setTotalInterest(Math.round(totalInt));
    setTotalPayment(Math.round(totalAmt));
  };

  const resetAll = () => {
    setAmount("");
    setInterest("");
    setPeriod("");
    setEmi(0);
    setTotalInterest(0);
    setTotalPayment(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 3,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
      >
        EMI Calculator
      </Typography>

      <Box
        sx={{
          maxWidth: 960,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
        }}
      >
        {/* Left - Form */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            transition: "all 0.3s ease",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
          >
            Enter Loan Details
          </Typography>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Loan Amount"
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "white"
                    : theme.palette.background.default,
                color: theme.palette.text.primary,
              },
            }}
          />

          <TextField
            label="Interest %"
            type="number"
            inputProps={{ step: "0.1" }}
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="Enter Interest Rate"
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "white"
                    : theme.palette.background.default,
                color: theme.palette.text.primary,
              },
            }}
          />

          <TextField
            label="Period (Years)"
            type="number"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Enter Loan Period"
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              sx: {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "white"
                    : theme.palette.background.default,
                color: theme.palette.text.primary,
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={calculateEMI}
              sx={{ px: 4, fontWeight: 600 }}
            >
              Calculate
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={resetAll}
              sx={{ px: 4, fontWeight: 600 }}
            >
              Reset
            </Button>
          </Box>
        </Paper>

        {/* Right - Result */}
        {emi > 0 ? (
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(to bottom right, #e3f2fd, #bbdefb)"
                  : "linear-gradient(to bottom right, #303030, #212121)",
              color: theme.palette.text.primary,
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              EMI Summary
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 3,
              }}
            >
              {[
                { label: "Monthly EMI", value: emi },
                { label: "Total Interest", value: totalInterest },
                {
                  label: "Total Payment (principal + interest)",
                  value: totalPayment,
                },
              ].map(({ label, value }) => (
                <Paper
                  key={label}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: 3,
                    border: `1px solid ${
                      theme.palette.mode === "light"
                        ? "#bbdefb"
                        : theme.palette.grey[700]
                    }`,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "white"
                        : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    transition: "all 0.3s ease",
                  }}
                  elevation={3}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.75rem",
                      color: theme.palette.primary.main,
                    }}
                  >
                    ₹ {formatNumber(value)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.background.paper,
              color: theme.palette.text.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
          >
            <Typography>
              Enter loan details and click <b>Calculate</b> to view your EMI
              summary.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

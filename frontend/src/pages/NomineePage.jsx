import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function NomineeDetails() {
  const theme = useTheme();
  const [nomineeDetails, setNomineeDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch nominee details
  const fetchNomineeDetails = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:8080/documents/nominees",
        {
          withCredentials: true,
        }
      );
      setNomineeDetails(data);
    } catch (error) {
      console.error("Error fetching nominee details:", error);
      setError("Failed to fetch nominee details. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNomineeDetails();
  }, []);

  // Render document cell: Link if URL exists, else "Not Uploaded"
  const renderDocCell = (value) => {
    if (value === "Not Uploaded") {
      return (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          Not Uploaded
        </Typography>
      );
    }
    return (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: theme.palette.primary.main, textDecoration: "underline" }}
      >
        Open Document
      </Link>
    );
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 4 },
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        mb={3}
        sx={{
          color: theme.palette.text.primary,
          fontWeight: "semibold",
          textAlign: "center",
        }}
      >
        Nominee Details
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
          }}
        >
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                }}
              >
                Client Name
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                }}
              >
                PAN Card
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                }}
              >
                Aadhaar Card
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                }}
              >
                Election Card
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                }}
              >
                Photos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : nomineeDetails.map((row) => (
                  <TableRow
                    key={row.clientId}
                    sx={{
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {row.clientName}
                    </TableCell>
                    <TableCell>{renderDocCell(row.panCard)}</TableCell>
                    <TableCell>{renderDocCell(row.aadhaarCard)}</TableCell>
                    <TableCell>{renderDocCell(row.electionCard)}</TableCell>
                    <TableCell>{renderDocCell(row.photos)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

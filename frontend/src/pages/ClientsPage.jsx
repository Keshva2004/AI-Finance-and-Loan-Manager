// Clients.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Button,
  Stack,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // Added for edit functionality
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import { useTheme } from "@mui/material/styles"; // For theme support
import AddClientForm from "./AddClientForm";

export default function Clients() {
  const theme = useTheme(); // For dark mode support
  const navigate = useNavigate(); // For navigation to documents page
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // State for the client being edited
  const [loading, setLoading] = useState(true); // Loading state for table

  // ✅ Fetch Clients (now includes totalLoanAmount)
  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:8080/clients?sort=clientId"
      );
      const clients = (Array.isArray(data) ? data : data.clients).filter(
        (client) => client && (client._id || client.clientId)
      );
      setRows(clients || []);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ✅ Renumber Clients
  const renumberClients = async (clients) => {
    const validClients = clients.filter(
      (client) => client && (client._id || client.clientId)
    );
    const sortedClients = [...validClients].sort(
      (a, b) => (a.clientId || 0) - (b.clientId || 0)
    );
    const updatedClients = sortedClients.map((client, index) => ({
      ...client,
      clientId: index + 1,
    }));

    for (const client of updatedClients) {
      try {
        await axios.put(
          `http://localhost:8080/clients/${client._id || client.clientId}`,
          client
        );
      } catch (err) {
        console.error("❌ Renumber Error:", err);
      }
    }
    return updatedClients;
  };

  // ✅ Delete Client
  const deleteClient = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/clients/${id}`);
      const { data } = await axios.get("http://localhost:8080/clients");
      const clients = (Array.isArray(data) ? data : data.clients).filter(
        (client) => client && (client._id || client.clientId)
      );
      const renumberedClients = await renumberClients(clients || []);
      setRows(renumberedClients);
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("Error deleting client!");
    }
  };

  // ✅ Inline Edit Save
  const handleCellEditCommit = async (params) => {
    try {
      const { id, field, value } = params;
      const currentTime = new Date().toISOString();

      setRows((prev) =>
        prev.map((row) =>
          row._id === id || row.clientId === id
            ? { ...row, [field]: value, updatedAt: currentTime }
            : row
        )
      );

      const updatedClient = rows.find((r) => r._id === id || r.clientId === id);
      if (!updatedClient) return;

      const finalClient = {
        ...updatedClient,
        [field]: value,
        updatedAt: currentTime,
      };
      await axios.put(`http://localhost:8080/clients/${id}`, finalClient);
      console.log(`✅ Updated ${field} of client ${id}`);
    } catch (err) {
      console.error("❌ Update Error:", err);
      alert("Update failed!");
      fetchClients();
    }
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = rows.map(({ ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileBlob, "ClientsData.xlsx");
  };

  // ✅ Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Handle Document Status Click (Navigate to Dashboard Documents Page)
  const handleDocumentStatusClick = (client) => {
    const docCount = client.documentCount || 0;
    if (docCount < 10) {
      // Only navigate if not fully approved
      navigate(`/dashboard/documents?clientId=${client._id}`); // Updated route
    }
  };

  // ✅ Columns (Updated with fixed widths, added Total Loan Amount)
  const columns = [
    { field: "clientId", headerName: "Client ID", width: 80 },
    { field: "full_name", headerName: "Full Name", width: 150, editable: true },
    {
      field: "phone_number",
      headerName: "Phone Number",
      width: 120,
      editable: true,
    },
    {
      field: "employment_status",
      headerName: "Employment Status",
      width: 150,
      editable: true,
    },
    { field: "email", headerName: "Email", width: 200, editable: true },
    {
      field: "credit_score",
      headerName: "Credit Score",
      width: 100,
      editable: true,
    },
    {
      field: "date_of_birth",
      headerName: "DOB",
      width: 100,
      editable: true,
      renderCell: (params) => formatDate(params.value),
    },
    { field: "address", headerName: "Address", width: 200, editable: true },

    // ✅ Updated Document Status as Button with Dynamic Text
    {
      field: "documentStatus",
      headerName: "Document Status",
      width: 150,
      renderCell: (params) => {
        const docCount = params.row.documentCount || 0;
        let statusText = "Pending";
        let isClickable = true;
        let bgColor = "#FF8C00"; // Orange for pending
        let hoverColor = "#E67600";

        if (docCount > 0 && docCount < 10) {
          statusText = `${docCount} documents uploaded`;
          bgColor = "#1976d2"; // Blue for partial
          hoverColor = "#1565c0";
        } else if (docCount >= 10) {
          statusText = "Approved";
          isClickable = false;
          bgColor = "#2e7d32"; // Green for approved
          hoverColor = "#1b5e20";
        }

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => isClickable && handleDocumentStatusClick(params.row)}
            disabled={!isClickable}
            sx={{
              bgcolor: bgColor,
              color: "white",
              textTransform: "none",
              "&:hover": {
                bgcolor: hoverColor,
              },
              "&:disabled": {
                bgcolor: theme.palette.grey[400],
                color: theme.palette.grey[600],
              },
            }}
          >
            {statusText}
          </Button>
        );
      },
    },

    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 120, // Increased width for two icons
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Client">
            <IconButton
              color="primary"
              size="small"
              onClick={() => setEditingClient(params.row)} // Set client for editing
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Client">
            <IconButton
              color="error"
              size="small"
              onClick={() =>
                deleteClient(params.row._id || params.row.clientId)
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: "hidden",
        color: theme.palette.text.primary,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          All Clients
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Add Client
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadOutlinedIcon />}
            onClick={handleExportExcel}
            sx={{
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              "&:hover": { borderColor: theme.palette.success.dark },
            }}
          >
            Download Excel
          </Button>
        </Stack>
      </Box>

      {/* ✅ DataGrid */}
      <Box sx={{ width: "100%", overflow: "auto" }}>
        <Box sx={{ minWidth: "auto", minHeight: "400px" }}>
          <DataGrid
            getRowId={(row) =>
              row?._id || row?.clientId || `temp-${Math.random()}`
            }
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            onCellEditCommit={handleCellEditCommit}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            loading={loading}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              borderRadius: "8px",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.grey[100],
                fontWeight: 600,
                color: theme.palette.text.primary,
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.2rem",
              },
              "& .MuiDataGrid-cell": {
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.5rem",
                p: 1,
                color: theme.palette.text.primary,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>
      </Box>

      {/* Add/Edit Client Dialog */}
      <AddClientForm
        open={openAdd || !!editingClient} // Open for add or edit
        onClose={() => {
          setOpenAdd(false);
          setEditingClient(null); // Reset edit state
        }}
        client={editingClient} // Pass client data for editing
        isEdit={!!editingClient} // Flag to indicate edit mode
        onClientAdded={async () => {
          setOpenAdd(false);
          await fetchClients();
        }}
        onClientUpdated={async () => {
          // New callback for updates
          setEditingClient(null);
          await fetchClients();
        }}
      />
    </Box>
  );
}

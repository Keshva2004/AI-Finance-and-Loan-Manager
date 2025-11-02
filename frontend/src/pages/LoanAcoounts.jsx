// Loans.jsx
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
import AddLoanForm from "./AddLoanForm";

export default function LoanAccount() {
  const theme = useTheme(); // For dark mode support
  const navigate = useNavigate(); // For navigation to EMIs page
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null); // State for the loan being edited
  const [loading, setLoading] = useState(true); // Loading state for table

  // ✅ Fetch Loans (populates borrower)
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:8080/loans");
      const loans = (Array.isArray(data) ? data : data.loans).filter(
        (loan) => loan && loan._id
      );
      setRows(loans || []);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // ✅ Delete Loan
  const deleteLoan = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/loans/${id}`);
      await fetchLoans(); // Refresh after delete
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("Error deleting loan!");
    }
  };

  // ✅ Inline Edit Save with Live Recalculation (Enhanced Debugging and Validation)
  const handleCellEditCommit = async (params) => {
    console.log("🔍 handleCellEditCommit triggered with params:", params); // Confirm event fires

    try {
      const { id, field, value } = params;
      const currentTime = new Date().toISOString();

      console.log(
        "🖊️ Editing field:",
        field,
        "with raw value:",
        value,
        "for loan ID:",
        id
      );

      // Parse and validate value based on schema types to prevent DB save failures
      let parsedValue = value;
      const numericFields = [
        "loanAmount",
        "interestRate",
        "monthlyEMI",
        "loanTermYears",
      ];
      const enumFields = ["loanType", "status"];

      if (numericFields.includes(field)) {
        parsedValue =
          field === "loanTermYears" ? parseInt(value, 10) : parseFloat(value);
        if (isNaN(parsedValue) || parsedValue < 0) {
          // Enforce schema min: 0
          alert(`Invalid value for ${field}: must be a positive number`);
          return;
        }
        if (field === "interestRate" && parsedValue > 100) {
          // Enforce schema max: 100
          alert(`Invalid value for ${field}: must be <= 100`);
          return;
        }
      } else if (enumFields.includes(field)) {
        // For enums, ensure it's a valid string (no parsing needed, but validate against enum)
        const validLoanTypes = [
          "Home",
          "Auto",
          "Personal",
          "Education",
          "Business",
        ];
        const validStatuses = [
          "Pending",
          "Approved",
          "Rejected",
          "Active",
          "Paid Off",
          "Defaulted",
        ];
        const validValues =
          field === "loanType" ? validLoanTypes : validStatuses;
        if (!validValues.includes(value)) {
          alert(
            `Invalid value for ${field}: must be one of ${validValues.join(", ")}`
          );
          return;
        }
      } else if (field === "startDate" || field === "endDate") {
        // Dates: Ensure valid ISO string or Date object
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          alert(`Invalid date for ${field}`);
          return;
        }
        parsedValue = date.toISOString(); // Normalize to ISO for DB
      }
      // For other fields (e.g., collateral), assume string/object as-is (add validation if needed)

      console.log("📤 Sending parsed value to backend:", parsedValue); // Confirm parsing

      // Send update to backend
      const response = await axios.put(`http://localhost:8080/loans/${id}`, {
        [field]: parsedValue,
        updatedAt: currentTime,
      });

      console.log("📨 Backend response received:", response.data); // Confirm response

      // Update local state with the full response (includes recalculated fields)
      setRows((prev) =>
        prev.map((row) => (row._id === id ? { ...response.data } : row))
      );

      console.log(`✅ Successfully updated ${field} for loan ${id}`);
    } catch (err) {
      console.error(
        "❌ Update Error in frontend:",
        err.response?.data || err.message
      ); // Log full error
      alert("Update failed! Check console for details.");
      // Force refresh to show DB state
      await fetchLoans();
    }
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = rows.map(({ borrowerId, ...rest }) => ({
      borrowerName: borrowerId?.full_name || "",
      borrowerEmail: borrowerId?.email || "",
      ...rest,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileBlob, "LoansData.xlsx");
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

  // ✅ Handle Loan Click (Navigate to EMIs Page)
  const handleLoanClick = (loan) => {
    navigate(`/dashboard/emis?loanId=${loan._id}`); // Assumes EMIs page exists
  };

  // ✅ Format Number (for Indian rupees)
  const formatNumber = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ✅ Columns (with editable Monthly EMI and Edit Action)
  const columns = [
    {
      field: "borrower",
      headerName: "Borrower Name",
      width: 150,
      renderCell: (params) => params.row.borrowerId?.full_name || "N/A",
    },
    { field: "loanType", headerName: "Loan Type", width: 120, editable: true },
    {
      field: "loanAmount",
      headerName: "Loan Amount",
      width: 120,
      editable: true,
      renderCell: (params) => `₹${formatNumber(params.value)}`,
    },
    {
      field: "interestRate",
      headerName: "Interest Rate (%)",
      width: 140,
      editable: true, // Triggers recalc
    },
    {
      field: "loanTermYears",
      headerName: "Loan Term (Years)",
      width: 150,
      editable: true, // Triggers recalc
    },
    {
      field: "monthlyEMI",
      headerName: "Monthly EMI Amount",
      width: 160,
      editable: true, // Triggers recalc of totals
      renderCell: (params) => `₹${formatNumber(params.value)}`,
    },
    {
      field: "totalInterest",
      headerName: "Total Interest Amount",
      width: 170,
      renderCell: (params) => `₹${formatNumber(params.value)}`,
    },
    {
      field: "totalPayment",
      headerName: "Total Payment Amount",
      width: 170,
      renderCell: (params) => `₹${formatNumber(params.value)}`,
    },
    {
      field: "status",
      headerName: "Loan Status",
      width: 120,
      editable: true, // Can be updated manually
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 120,
      renderCell: (params) => formatDate(params.value),
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
          <Tooltip title="Edit Loan">
            <IconButton
              color="primary"
              size="small"
              onClick={() => setEditingLoan(params.row)} // Set loan for editing
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Loan">
            <IconButton
              color="error"
              size="small"
              onClick={() => deleteLoan(params.row._id)}
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
          All Loans
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
            Add Loan
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
            getRowId={(row) => row?._id || `temp-${Math.random()}`}
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            editMode="cell" // Enable cell editing
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

      {/* Add/Edit Loan Dialog */}
      <AddLoanForm
        open={openAdd || !!editingLoan} // Open for add or edit
        onClose={() => {
          setOpenAdd(false);
          setEditingLoan(null); // Reset edit state
        }}
        loan={editingLoan} // Pass loan data for editing
        isEdit={!!editingLoan} // Flag to indicate edit mode
        onLoanAdded={async () => {
          setOpenAdd(false);
          await fetchLoans();
        }}
        onLoanUpdated={async () => {
          // New callback for updates
          setEditingLoan(null);
          await fetchLoans();
        }}
      />
    </Box>
  );
}

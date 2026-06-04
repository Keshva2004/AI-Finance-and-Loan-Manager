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
import EditIcon from "@mui/icons-material/Edit";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { formatDateDMY } from "../../../backend/config/dateFormate.js";
import AddPaymentForm from "./AddPaymentForm";

export default function PaymentsPage() {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payments`);
      setRows(data || []);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ✅ Delete Payment
  const deletePayment = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/payments/${id}`);
      await fetchPayments();
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("Error deleting payment!");
    }
  };

  // ✅ Inline Edit Save
  const handleCellEditCommit = async (params) => {
    try {
      const { id, field, value } = params;
      let parsedValue = value;

      if (field === "paymentAmount") {
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue) || parsedValue < 0) {
          alert("Invalid payment amount");
          return;
        }
      } else if (field === "status") {
        const validStatuses = ["Pending", "Completed", "Failed", "Refunded"];
        if (!validStatuses.includes(value)) {
          alert(`Invalid status: must be one of ${validStatuses.join(", ")}`);
          return;
        }
      } else if (field === "paymentDate") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          alert("Invalid date");
          return;
        }
        parsedValue = date.toISOString();
      }

      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/payments/${id}`, {
        [field]: parsedValue,
      });

      setRows((prev) =>
        prev.map((row) => (row._id === id ? { ...response.data } : row))
      );
    } catch (err) {
      console.error("❌ Update Error:", err);
      alert("Update failed!");
      await fetchPayments();
    }
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const exportData = rows.map(({ borrowerId, loanId, ...rest }) => ({
      borrowerName: borrowerId?.full_name || "",
      loanType: loanId?.loanType || "",
      loanAmount: loanId?.loanAmount || "",
      paymentDate: formatDateDMY(rest.paymentDate),
      createdAt: formatDateDMY(rest.createdAt),
      ...rest,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileBlob, "PaymentsData.xlsx");
  };

  // ✅ Format Number
  const formatNumber = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ✅ Columns
  const columns = [
    {
      field: "borrower",
      headerName: "Borrower Name",
      width: 150,
      renderCell: (params) => params.row.borrowerId?.full_name || "N/A",
    },
    {
      field: "loanType",
      headerName: "Loan Type",
      width: 120,
      renderCell: (params) => params.row.loanId?.loanType || "N/A",
    },
    {
      field: "loanAmount",
      headerName: "Loan Amount",
      width: 120,
      renderCell: (params) =>
        `₹${formatNumber(params.row.loanId?.loanAmount || 0)}`,
    },
    {
      field: "paymentAmount",
      headerName: "Payment Amount",
      width: 140,
      editable: true,
      renderCell: (params) => `₹${formatNumber(params.value)}`,
    },
    {
      field: "paymentDate",
      headerName: "Payment Date",
      width: 120,
      editable: true,
      renderCell: (params) => formatDateDMY(params.value),
    },
    { field: "paymentMethod", headerName: "Payment Method", width: 140 },
    { field: "status", headerName: "Status", width: 120, editable: true },
    { field: "notes", headerName: "Notes", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
      renderCell: (params) => formatDateDMY(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Payment">
            <IconButton
              color="primary"
              size="small"
              onClick={() => setEditingPayment(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Payment">
            <IconButton
              color="error"
              size="small"
              onClick={() => deletePayment(params.row._id)}
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
          All Payments
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpenAdd(true)}
          >
            Add Payment
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadOutlinedIcon />}
            onClick={handleExportExcel}
          >
            Download Excel
          </Button>
        </Stack>
      </Box>

      <Box sx={{ width: "100%", overflow: "auto" }}>
        <Box sx={{ minWidth: "auto", minHeight: "400px" }}>
          <DataGrid
            getRowId={(row) => row?._id || `temp-${Math.random()}`}
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            editMode="cell"
            onCellEditCommit={handleCellEditCommit}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            loading={loading}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              borderRadius: "8px",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.grey[100],
                fontWeight: 600,
                color: theme.palette.text.primary,
              },
              "& .MuiDataGrid-cell": {
                color: theme.palette.text.primary,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>
      </Box>

      <AddPaymentForm
        open={openAdd || !!editingPayment}
        onClose={() => {
          setOpenAdd(false);
          setEditingPayment(null);
        }}
        payment={editingPayment}
        isEdit={!!editingPayment}
        onPaymentAdded={async () => {
          setOpenAdd(false);
          await fetchPayments();
        }}
        onPaymentUpdated={async () => {
          setEditingPayment(null);
          await fetchPayments();
        }}
      />
    </Box>
  );
}

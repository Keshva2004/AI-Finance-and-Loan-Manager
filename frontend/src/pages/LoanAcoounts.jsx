import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Sparkles, ShieldCheck, ShieldAlert, Activity, FileText, Check, AlertTriangle, X as CloseLucide } from "lucide-react";
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
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EmailIcon from "@mui/icons-material/Email"; // New icon for reminders
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import AddLoanForm from "./AddLoanForm";

export default function LoanAccount() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false); // New state for button loading
  const [reminderAlert, setReminderAlert] = useState(null); // For success/error messages

  // AI Underwriting Modal States
  const [openUnderwrite, setOpenUnderwrite] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [underwriteData, setUnderwriteData] = useState(null);
  const [underwriteLoading, setUnderwriteLoading] = useState(false);
  const [underwriteError, setUnderwriteError] = useState(null);

  const handleOpenAIUnderwrite = async (loan) => {
    setSelectedLoan(loan);
    setOpenUnderwrite(true);
    setUnderwriteLoading(true);
    setUnderwriteError(null);
    setUnderwriteData(null);

    try {
      const response = await axios.post(`http://localhost:8080/loans/${loan._id}/underwrite`, {}, { withCredentials: true });
      if (response.data.success) {
        setUnderwriteData(response.data);
      } else {
        setUnderwriteError("Failed to perform underwriting analysis.");
      }
    } catch (err) {
      console.error("Underwriting call failed:", err);
      const errMsg = err.response?.data?.error || "Connection failure to Gemini underwriter. Verify GEMINI_KEY is configured in backend env.";
      setUnderwriteError(errMsg);
    } finally {
      setUnderwriteLoading(false);
    }
  };

  const handleApplyAIRecommendation = async () => {
    if (!selectedLoan || !underwriteData) return;

    try {
      setUnderwriteLoading(true);
      // Map AI verdict to Loan status enum
      let statusToSet = "Pending";
      const verdict = underwriteData.verdict;
      if (verdict === "Recommended for Approval") {
        statusToSet = "Approved";
      } else if (verdict === "Recommended for Rejection") {
        statusToSet = "Rejected";
      } else {
        statusToSet = "Pending"; // Leave as Pending for manual review
      }

      await axios.put(`http://localhost:8080/loans/${selectedLoan._id}`, {
        status: statusToSet
      });

      // Refresh table
      await fetchLoans();
      setOpenUnderwrite(false);
      alert(`Successfully updated loan status to "${statusToSet}" based on AI underwriter recommendation.`);
    } catch (err) {
      console.error("Apply AI recommendation failed:", err);
      alert("Failed to apply recommendation.");
    } finally {
      setUnderwriteLoading(false);
    }
  };

  // ✅ Fetch Loans (unchanged)
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

  // ✅ Delete Loan (unchanged)
  const deleteLoan = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/loans/${id}`);
      await fetchLoans();
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("Error deleting loan!");
    }
  };

  // ✅ Handle Cell Edit (unchanged)
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

  // ✅ Export to Excel (unchanged)
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

  // ✅ Format Date (unchanged)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Handle Loan Click (unchanged)
  const handleLoanClick = (loan) => {
    navigate(`/dashboard/emis?loanId=${loan._id}`); // Assumes EMIs page exists
  };

  // ✅ Format Number (unchanged)
  const formatNumber = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ✅ New: Send Loan Reminders
  const handleSendReminders = async () => {
    setSendingReminders(true);
    setReminderAlert(null);
    try {
      const { data } = await axios.post(
        "http://localhost:8080/loans/send-reminders"
      );
      setReminderAlert({ type: "success", message: data.message });
    } catch (err) {
      console.error("❌ Send Reminders Error:", err);
      setReminderAlert({
        type: "error",
        message: "Failed to send reminders. Check console.",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  // ✅ Columns (unchanged)
  const columns = [
    {
      field: "aiUnderwrite",
      headerName: "AI Audit",
      width: 145,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isPending = params.row.status === "Pending";
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenAIUnderwrite(params.row)}
            sx={{
              background: isPending
                ? "linear-gradient(45deg, #1d4ed8, #6d28d9, #be185d)"
                : "rgba(124, 58, 237, 0.15)",
              color: isPending ? "white" : theme.palette.text.primary,
              border: isPending ? "none" : `1px solid ${theme.palette.divider}`,
              fontWeight: 600,
              fontSize: "11px",
              textTransform: "none",
              borderRadius: "20px",
              px: 2.5,
              py: 0.5,
              boxShadow: isPending ? "0 2px 8px rgba(124, 58, 237, 0.3)" : "none",
              "&:hover": {
                background: isPending
                  ? "linear-gradient(45deg, #1e40af, #5b21b6, #9d174d)"
                  : "rgba(124, 58, 237, 0.25)",
                boxShadow: isPending ? "0 4px 12px rgba(124, 58, 237, 0.5)" : "none",
              },
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Underwrite
          </Button>
        );
      }
    },
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
            color="secondary"
            startIcon={<EmailIcon />}
            onClick={handleSendReminders}
            disabled={sendingReminders}
            sx={{
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              "&:hover": { borderColor: theme.palette.secondary.dark },
            }}
          >
            {sendingReminders ? "Sending..." : "Send Loan Reminders"}
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

      {/* AI Underwriter Insights Bar */}
      {rows.filter(r => r.status === "Pending").length > 0 && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 2,
            background: "linear-gradient(45deg, rgba(99, 102, 241, 0.08), rgba(219, 39, 119, 0.08))",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <Typography variant="body2" fontWeight={650} sx={{ color: "indigo.500" }}>
              {rows.filter(r => r.status === "Pending").length} Loan request(s) require automated credit underwriting audits.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Alert for reminder feedback */}
      {reminderAlert && (
        <Alert severity={reminderAlert.type} sx={{ mb: 2 }}>
          {reminderAlert.message}
        </Alert>
      )}

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

      {/* Premium AI Underwriting Report Dialog */}
      <Dialog
        open={openUnderwrite}
        onClose={() => !underwriteLoading && setOpenUnderwrite(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.mode === "light" ? "#f8fafc" : "#0f172a",
            color: theme.palette.text.primary,
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            bgcolor: theme.palette.mode === "light" ? "#ffffff" : "#1e293b",
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <Typography variant="h6" fontWeight={700}>
              Automated Credit Audit Report
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenUnderwrite(false)}
            disabled={underwriteLoading}
            sx={{ color: "grey.500" }}
          >
            <CloseLucide className="w-5 h-5" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, mt: 1 }}>
          {/* Loading Screen */}
          {underwriteLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 3 }}>
              <div className="relative w-14 h-14">
                <span className="absolute inset-0 rounded-full border-4 border-indigo-500/10"></span>
                <span className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></span>
              </div>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "indigo.500" }}>
                  Generating Auditing Context...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gemini is calculating amortization risk & KYC status
                </Typography>
              </Box>
            </Box>
          )}

          {/* Error Screen */}
          {underwriteError && (
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: "error.lighter", border: "1px solid", borderColor: "error.light", display: "flex", gap: 2, alignItems: "flex-start" }}>
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="error">
                  Audit Execution Blocked
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontFamily: "monospace", color: "error.main" }}>
                  {underwriteError}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Report Screen */}
          {!underwriteLoading && !underwriteError && underwriteData && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Verdict Summary Header banner */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  background:
                    underwriteData.verdict === "Recommended for Approval"
                      ? "linear-gradient(45deg, rgba(16,185,129,0.1), rgba(4,120,87,0.15))"
                      : underwriteData.verdict === "Recommended for Rejection"
                      ? "linear-gradient(45deg, rgba(239,68,68,0.1), rgba(185,28,28,0.15))"
                      : "linear-gradient(45deg, rgba(245,158,11,0.1), rgba(180,83,9,0.15))",
                  border: "1px solid",
                  borderColor:
                    underwriteData.verdict === "Recommended for Approval"
                      ? "emerald.300"
                      : underwriteData.verdict === "Recommended for Rejection"
                      ? "error.light"
                      : "warning.light",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", tracking: 1.5 }}>
                    Underwriter Recommendation
                  </Typography>
                  <Typography variant="h5" fontWeight={850} sx={{
                    color:
                      underwriteData.verdict === "Recommended for Approval"
                        ? "success.main"
                        : underwriteData.verdict === "Recommended for Rejection"
                        ? "error.main"
                        : "warning.main",
                    mt: 0.5
                  }}>
                    {underwriteData.verdict}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {/* Risk Level Badge */}
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      RISK CATEGORY
                    </Typography>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                        underwriteData.riskLevel === "Low"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : underwriteData.riskLevel === "High"
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-amber-500/20 text-amber-500"
                      }`}
                    >
                      {underwriteData.riskLevel} Risk
                    </span>
                  </Box>
                </Box>
              </Box>

              {/* Progress Gauges Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                {/* Risk Gauge Card */}
                <Box sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === "light" ? "#fff" : "#1e293b", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                    Risk Coefficient
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            underwriteData.riskLevel === "Low"
                              ? "bg-emerald-500"
                              : underwriteData.riskLevel === "High"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${underwriteData.riskPercentage}%` }}
                        ></div>
                      </div>
                    </Box>
                    <Typography variant="body1" fontWeight={800} color="text.primary">
                      {underwriteData.riskPercentage}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    Evaluates structural debt factors against historical volatility metrics.
                  </Typography>
                </Box>

                {/* Affordability Score Card */}
                <Box sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === "light" ? "#fff" : "#1e293b", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                    Affordability & Debt Service Capacity
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${underwriteData.affordabilityScore}%` }}
                        ></div>
                      </div>
                    </Box>
                    <Typography variant="body1" fontWeight={800} color="text.primary">
                      {underwriteData.affordabilityScore}/100
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    A score of 70+ indicates extremely safe debt serviceability for this borrower status.
                  </Typography>
                </Box>
              </Box>

              {/* KYC Document Checklist */}
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === "light" ? "#fff" : "#1e293b", border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Mandatory KYC Audit Status
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  {/* Uploaded items */}
                  <Box>
                    <Typography variant="caption" color="success.main" fontWeight={700} sx={{ display: "block", mb: 1 }}>
                      Uploaded Documents ({underwriteData.kycCompliance?.uploaded?.length || 0})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {underwriteData.kycCompliance?.uploaded?.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-mono">
                          <Check className="w-3 h-3" /> {doc}
                        </span>
                      ))}
                      {(!underwriteData.kycCompliance?.uploaded || underwriteData.kycCompliance.uploaded.length === 0) && (
                        <Typography variant="caption" color="text.secondary">No uploads detected.</Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Missing items */}
                  <Box>
                    <Typography variant="caption" color="error.main" fontWeight={700} sx={{ display: "block", mb: 1 }}>
                      Missing Documents ({underwriteData.kycCompliance?.missing?.length || 0})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {underwriteData.kycCompliance?.missing?.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-mono">
                          <AlertTriangle className="w-3 h-3" /> {doc}
                        </span>
                      ))}
                      {(!underwriteData.kycCompliance?.missing || underwriteData.kycCompliance.missing.length === 0) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-mono">
                          All KYC Items Uploaded
                        </span>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Bullet reasons list */}
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === "light" ? "#fff" : "#1e293b", border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                  AI Audit Findings & Justification
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 3.5, display: "flex", flexDirection: "column", gap: 1.5, fontSize: "13px", color: "text.primary" }}>
                  {underwriteData.bulletPoints?.map((pt, idx) => (
                    <li key={idx} style={{ lineHeight: "1.45rem" }}>{pt}</li>
                  ))}
                </Box>
              </Box>

              {/* Underwriter qualitative summary */}
              <Box sx={{ p: 3, borderRadius: 2, bg: "action.selected", borderLeft: "4px solid", borderColor: "indigo.500" }}>
                <Typography variant="subtitle2" fontWeight={700} color="indigo.500" mb={1}>
                  Qualitative Summary
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: "1.5rem", fontStyle: "italic" }}>
                  "{underwriteData.underwriterSummary}"
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === "light" ? "#ffffff" : "#1e293b",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOpenUnderwrite(false)}
            disabled={underwriteLoading}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Dismiss
          </Button>

          {!underwriteLoading && !underwriteError && underwriteData && (
            <Button
              variant="contained"
              onClick={handleApplyAIRecommendation}
              disabled={underwriteData.verdict === "Needs Manual Review"}
              sx={{
                fontWeight: 650,
                textTransform: "none",
                background:
                  underwriteData.verdict === "Recommended for Approval"
                    ? "linear-gradient(45deg, #10b981, #059669)"
                    : "linear-gradient(45deg, #ef4444, #dc2626)",
                color: "white",
                "&:hover": {
                  background:
                    underwriteData.verdict === "Recommended for Approval"
                      ? "linear-gradient(45deg, #059669, #047857)"
                      : "linear-gradient(45deg, #dc2626, #b91c1c)",
                },
                "&:disabled": {
                  background: "grey.400",
                  color: "white"
                }
              }}
            >
              Apply AI Recommendation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

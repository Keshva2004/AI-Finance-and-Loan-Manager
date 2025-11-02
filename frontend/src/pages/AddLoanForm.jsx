import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";

export default function AddLoanForm({
  open,
  onClose,
  loan, // Loan object for edit mode
  isEdit, // Boolean: true for edit, false for add
  onLoanAdded, // Callback for add mode
  onLoanUpdated, // Callback for edit mode
}) {
  const [formData, setFormData] = useState({
    borrowerId: "",
    loanType: "",
    loanAmount: "",
    interestRate: "",
    loanTermYears: "",
    startDate: "",
    endDate: "", // <-- Add this line
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && loan) {
      setFormData({
        borrowerId: loan.borrowerId?._id || loan.borrowerId || "",
        loanType: loan.loanType || "",
        loanAmount: loan.loanAmount || "",
        interestRate: loan.interestRate || "",
        loanTermYears: loan.loanTermYears || "",
        startDate: loan.startDate
          ? new Date(loan.startDate).toISOString().split("T")[0]
          : "",
        endDate: loan.endDate
          ? new Date(loan.endDate).toISOString().split("T")[0]
          : "", // <-- Add this line
        status: loan.status || "Pending",
      });
    } else {
      setFormData({
        borrowerId: "",
        loanType: "",
        loanAmount: "",
        interestRate: "",
        loanTermYears: "",
        startDate: "",
        endDate: "", // <-- Add this line
        status: "Pending",
      });
    }
  }, [isEdit, loan]);

  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch clients for borrower dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/clients");
        setClients(data || []);
      } catch (err) {
        console.error("❌ Fetch Clients Error:", err);
      }
    };
    if (open) fetchClients();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        // Edit mode: PUT request to update
        const response = await axios.put(
          `http://localhost:8080/loans/${loan._id}`,
          formData
        );
        console.log("✅ Loan updated:", response.data);
        onLoanUpdated(); // Refresh table
      } else {
        // Add mode: POST request to create
        const response = await axios.post(
          "http://localhost:8080/loans",
          formData
        );
        console.log("✅ Loan added:", response.data);
        onLoanAdded(); // Refresh table
      }
      onClose(); // Close dialog
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Loan" : "Add New Loan"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          <Grid container spacing={3} direction="column" alignItems="stretch">
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Borrower"
                name="borrowerId"
                value={formData.borrowerId}
                onChange={handleChange}
                error={!!errors.borrowerId}
                helperText={errors.borrowerId}
                required
              >
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.full_name} ({client.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Loan Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Loan Type"
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                required
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Auto">Auto</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </TextField>
            </Grid>

            {/* Loan Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Amount"
                name="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Interest Rate - Updated to allow floats */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 100, step: "0.01" }} // Added step for floats
              />
            </Grid>

            {/* Loan Term Years */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Term (Years)"
                name="loanTermYears"
                type="number"
                value={formData.loanTermYears}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Paid Off">Paid Off</MenuItem>
                <MenuItem value="Defaulted">Defaulted</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update Loan" : "Add Loan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

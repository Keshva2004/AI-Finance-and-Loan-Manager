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

export default function AddPaymentForm({
  open,
  onClose,
  payment, // Payment object for edit mode
  isEdit, // Boolean: true for edit, false for add
  onPaymentAdded, // Callback for add mode
  onPaymentUpdated, // Callback for edit mode
}) {
  const [formData, setFormData] = useState({
    borrowerId: "",
    loanId: "",
    paymentAmount: "",
    paymentDate: "",
    paymentMethod: "Online",
    status: "Pending",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);

  // Fetch clients and loans on open
  useEffect(() => {
    if (open) {
      axios
        .get("http://localhost:8080/clients")
        .then((res) => setClients(res.data || []));
      axios
        .get("http://localhost:8080/loans")
        .then((res) => setLoans(res.data || []));
      setFormData({
        borrowerId: "",
        loanId: "",
        paymentAmount: "",
        paymentDate: "",
        paymentMethod: "Online",
        status: "Pending",
        notes: "",
      });
      setError("");
    }
  }, [open]);

  // Pre-fill for edit
  useEffect(() => {
    if (isEdit && payment) {
      setFormData({
        borrowerId: payment.borrowerId?._id || payment.borrowerId,
        loanId: payment.loanId?._id || payment.loanId,
        paymentAmount: payment.paymentAmount || "",
        paymentDate: payment.paymentDate
          ? new Date(payment.paymentDate).toISOString().split("T")[0]
          : "",
        paymentMethod: payment.paymentMethod || "Online",
        status: payment.status || "Pending",
        notes: payment.notes || "",
      });
    }
  }, [isEdit, payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !formData.borrowerId ||
      !formData.loanId ||
      !formData.paymentAmount ||
      !formData.paymentDate
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        // Edit mode: PUT request to update
        const response = await axios.put(
          `http://localhost:8080/payments/${payment._id}`,
          formData
        );
        console.log("✅ Payment updated:", response.data);
        onPaymentUpdated(); // Refresh table
      } else {
        // Add mode: POST request to create
        const response = await axios.post(
          "http://localhost:8080/payments",
          formData
        );
        console.log("✅ Payment added:", response.data);
        onPaymentAdded(); // Refresh table
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
      <DialogTitle>{isEdit ? "Edit Payment" : "Add New Payment"}</DialogTitle>
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
                required
              >
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.full_name} ({client.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Loan"
                name="loanId"
                value={formData.loanId}
                onChange={handleChange}
                required
              >
                {loans.map((loan) => (
                  <MenuItem key={loan._id} value={loan._id}>
                    {loan.loanType} - ₹{loan.loanAmount} (
                    {loan.borrowerId?.full_name || "N/A"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Amount"
                name="paymentAmount"
                type="number"
                value={formData.paymentAmount}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Date"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

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
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Refunded">Refunded</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
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
            {loading ? "Saving..." : isEdit ? "Update Payment" : "Add Payment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

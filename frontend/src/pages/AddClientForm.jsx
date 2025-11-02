// AddClientForm.jsx
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

const AddClientForm = ({
  open,
  onClose,
  client, // Client object for edit mode
  isEdit, // Boolean: true for edit, false for add
  onClientAdded, // Callback for add mode
  onClientUpdated, // Callback for edit mode
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    employment_status: "Salaried",
    credit_score: "",
    date_of_birth: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && client) {
      setFormData({
        full_name: client.full_name || "",
        phone_number: client.phone_number || "",
        email: client.email || "",
        employment_status: client.employment_status || "Salaried",
        credit_score: client.credit_score || "",
        date_of_birth: client.date_of_birth
          ? new Date(client.date_of_birth).toISOString().split("T")[0]
          : "",
        address: client.address || "",
      });
    } else {
      // Reset for add mode
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
        employment_status: "Salaried",
        credit_score: "",
        date_of_birth: "",
        address: "",
      });
    }
  }, [isEdit, client]);

  const validate = () => {
    let temp = {};
    temp.full_name = formData.full_name ? "" : "Full name required";
    temp.phone_number =
      formData.phone_number.length === 10 &&
      /^[0-9]+$/.test(formData.phone_number)
        ? ""
        : "Enter valid 10-digit number";
    temp.email = /\S+@\S+\.\S+/.test(formData.email) ? "" : "Enter valid email";
    temp.address =
      formData.address.length >= 6 ? "" : "Address must be 6+ chars long";

    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        credit_score: formData.credit_score
          ? Number(formData.credit_score)
          : undefined,
      };

      if (isEdit) {
        // Edit mode: PUT request to update
        const response = await axios.put(
          `http://localhost:8080/clients/${client._id || client.clientId}`,
          payload
        );
        console.log("✅ Client updated:", response.data);
        onClientUpdated(); // Refresh table
      } else {
        // Add mode: POST request to create
        const response = await axios.post(
          "http://localhost:8080/clients",
          payload
        );
        console.log("✅ Client added:", response.data);
        onClientAdded(); // Refresh table
      }
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to save client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent
        style={{ backgroundColor: "#f9f9f9", padding: "30px 40px" }}
      >
        <Paper
          elevation={3}
          style={{
            padding: "30px",
            borderRadius: "14px",
            background: "white",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            style={{
              fontWeight: "bold",
              color: "#1976d2",
              textAlign: "center",
            }}
          >
            {isEdit ? "Edit Client" : "Client Information"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} direction="column" alignItems="stretch">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Employment Status"
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                >
                  <MenuItem value="Salaried">Salaried</MenuItem>
                  <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                  <MenuItem value="Freelancer">Freelancer</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credit Score"
                  type="number"
                  name="credit_score"
                  value={formData.credit_score}
                  onChange={handleChange}
                  inputProps={{ min: 300, max: 900 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
              </Grid>

              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 40px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {loading
                    ? "Saving..."
                    : isEdit
                      ? "Update Client"
                      : "Save Client"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </DialogContent>

      <DialogActions
        style={{ justifyContent: "center", paddingBottom: "20px" }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          style={{ padding: "8px 30px", borderRadius: "10px" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClientForm;

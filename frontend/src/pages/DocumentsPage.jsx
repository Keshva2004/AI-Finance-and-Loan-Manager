// src/pages/DocumentsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Paper,
  Tooltip,
  Skeleton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles"; // For theme-aware styling

const docTypeOptions = [
  "PAN Card",
  "Aadhaar Card",
  "Election Card",
  "Driving License",
  "Property Tax",
  "Ration Card",
  "Light Bill",
  "Photo",
  "Bank Statement",
  "Cheque",
];

export default function DocumentsPage() {
  const theme = useTheme(); // Access theme for dynamic styling
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [clientId, setClientId] = useState("");
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterClientId, setFilterClientId] = useState("");
  const [editDialog, setEditDialog] = useState({
    open: false,
    id: null,
    newType: "",
  });
  const [error, setError] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true); // For skeleton loading
  const [loadingClients, setLoadingClients] = useState(true);

  // Fetch docs
  const fetchDocs = async () => {
    try {
      setError("");
      setLoadingDocs(true);
      const { data } = await axios.get("http://localhost:8080/documents", {
        withCredentials: true,
      });
      setDocs(data);
      setFilteredDocs(data);
    } catch (error) {
      console.error("Error fetching docs:", error);
      setError("Failed to fetch documents. Check console.");
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      setError("");
      setLoadingClients(true);
      const { data } = await axios.get(
        "http://localhost:8080/documents/clients/all",
        { withCredentials: true }
      );
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to fetch clients. Check console.");
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchClients();
  }, []);

  // Filter docs by client
  useEffect(() => {
    if (filterClientId) {
      setFilteredDocs(docs.filter((d) => d.clientId?._id === filterClientId));
    } else {
      setFilteredDocs(docs);
    }
  }, [filterClientId, docs]);

  // Upload file
  const upload = async () => {
    if (!file || !clientId || !docType) {
      setError("⚠️ Fill all fields!");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("⚠️ Only images or PDFs allowed!");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("docType", docType);

    try {
      await axios.post("http://localhost:8080/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      await fetchDocs();
      setFile(null);
      setDocType("");
      alert("✅ Document uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      setError("❌ Upload failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  // Delete doc
  const deleteDoc = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      setError("");
      await axios.delete(`http://localhost:8080/documents/${id}`, {
        withCredentials: true,
      });
      fetchDocs();
      alert("🗑️ Document deleted");
    } catch (error) {
      console.error("Delete error:", error);
      setError("❌ Delete failed. Check console.");
    }
  };

  // Update doc type
  const updateDocType = async () => {
    try {
      setError("");
      await axios.put(
        `http://localhost:8080/documents/${editDialog.id}`,
        {
          docType: editDialog.newType,
        },
        { withCredentials: true }
      );
      fetchDocs();
      setEditDialog({ open: false, id: null, newType: "" });
      alert("✏️ Document type updated");
    } catch (error) {
      console.error("Update error:", error);
      setError("❌ Update failed. Check console.");
    }
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
         Manage Documents
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

      {/* Filter Section */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Filter Documents
          </Typography>
        </Box>
        <FormControl
          size="small"
          fullWidth
          variant="outlined" // Better for dark mode
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        >
          <InputLabel sx={{ color: theme.palette.text.secondary }}>
            Filter by Client
          </InputLabel>
          <Select
            value={filterClientId}
            label="Filter by Client"
            onChange={(e) => setFilterClientId(e.target.value)}
            sx={{
              color: theme.palette.text.primary,
              "& .MuiSelect-icon": {
                color: theme.palette.text.secondary,
              },
            }}
          >
            <MenuItem value="">
              <em>All Clients</em>
            </MenuItem>
            {loadingClients ? (
              <MenuItem disabled>
                <Skeleton width={100} />
              </MenuItem>
            ) : (
              clients.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.full_name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Paper>

      {/* Upload Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          mb={2}
          sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
        >
          Upload New Document
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                },
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
              }}
            >
              <InputLabel sx={{ color: theme.palette.text.secondary }}>
                Select Client
              </InputLabel>
              <Select
                value={clientId}
                label="Select Client"
                onChange={(e) => setClientId(e.target.value)}
                sx={{
                  color: theme.palette.text.primary,
                  "& .MuiSelect-icon": {
                    color: theme.palette.text.secondary,
                  },
                }}
              >
                {loadingClients ? (
                  <MenuItem disabled>
                    <Skeleton width={100} />
                  </MenuItem>
                ) : (
                  clients.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.full_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                },
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
              }}
            >
              <InputLabel sx={{ color: theme.palette.text.secondary }}>
                Document Type
              </InputLabel>
              <Select
                value={docType}
                label="Document Type"
                onChange={(e) => setDocType(e.target.value)}
                sx={{
                  color: theme.palette.text.primary,
                  "& .MuiSelect-icon": {
                    color: theme.palette.text.secondary,
                  },
                }}
              >
                {docTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Select an image or PDF file">
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  height: 40,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={upload}
              disabled={loading}
              fullWidth
              sx={{
                height: 40,
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Upload"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents List */}
      <Box>
        {loadingDocs
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={80} sx={{ mb: 2, borderRadius: 2 }} />
            ))
          : filteredDocs.map((d) => {
              const isImage = /\.(jpg|jpeg|png|webp)$/i.test(d.url);

              return (
                <Paper
                  key={d._id}
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {isImage ? (
                      <img
                        src={d.url}
                        alt="file"
                        width="60"
                        style={{
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                    ) : (
                      <PictureAsPdfIcon
                        fontSize="large"
                        sx={{ color: theme.palette.primary.main }}
                      />
                    )}
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: "bold",
                        }}
                      >
                        Client: {d.clientId?.full_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Type: {d.docType}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit Document Type">
                      <IconButton
                        onClick={() =>
                          setEditDialog({
                            open: true,
                            id: d._id,
                            newType: d.docType,
                          })
                        }
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                      <IconButton
                        onClick={() => deleteDoc(d._id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, id: null, newType: "" })}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Edit Document Type
        </DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
              },
            }}
            variant="outlined"
          >
            <InputLabel sx={{ color: theme.palette.text.secondary }}>
              Document Type
            </InputLabel>
            <Select
              value={editDialog.newType}
              label="Document Type"
              onChange={(e) =>
                setEditDialog({ ...editDialog, newType: e.target.value })
              }
              sx={{
                color: theme.palette.text.primary,
                "& .MuiSelect-icon": {
                  color: theme.palette.text.secondary,
                },
              }}
            >
              {docTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEditDialog({ open: false, id: null, newType: "" })
            }
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={updateDocType}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

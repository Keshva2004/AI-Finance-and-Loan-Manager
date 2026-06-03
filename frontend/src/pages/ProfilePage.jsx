import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaSignOutAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:8080";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    username: "",
    contactNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
  const navigate = useNavigate();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setProfile(response.data.user);
        } else {
          alert("Failed to load profile: " + response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Error fetching profile. Please check your authentication.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle form input changes (only in edit mode)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/profile`,
        profile,
        { withCredentials: true }
      );
      if (response.data.success) {
        alert("Profile updated successfully!");
        setProfile(response.data.user); // Update display with new data
        setIsEditing(false); // Switch back to display mode
      } else {
        alert("Failed to update profile: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        alert("Logged out successfully!");
        navigate("/");
      } else {
        alert("Logout failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out.");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            <FaUser size={40} color="#007bff" />
          </div>
          <h2 style={styles.title}>Admin Profile</h2>
          <p style={styles.subtitle}>Manage your finance agent details</p>
        </div>

        {/* Main Content: Two Sides */}
        <div style={styles.content}>
          {/* Left Side: Display Mode */}
          <div style={styles.displaySide}>
            <h3 style={styles.sectionTitle}>Profile Information</h3>
            <div style={styles.infoItem}>
              <FaUser style={styles.infoIcon} />
              <span>
                <strong>Username:</strong> {profile.username}
              </span>
            </div>
            <div style={styles.infoItem}>
              <FaPhone style={styles.infoIcon} />
              <span>
                <strong>Contact Number:</strong> {profile.contactNumber}
              </span>
            </div>
            <div style={styles.infoItem}>
              <FaEnvelope style={styles.infoIcon} />
              <span>
                <strong>Email:</strong> {profile.email}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <FaEdit style={styles.buttonIcon} />
              Edit Profile
            </button>
          </div>

          {/* Right Side: Edit Mode (Conditional) */}
          {isEditing && (
            <div style={styles.editSide}>
              <h3 style={styles.sectionTitle}>Update Profile</h3>
              <form onSubmit={handleUpdate} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaUser style={styles.icon} /> Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaPhone style={styles.icon} /> Contact Number
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={profile.contactNumber}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaEnvelope style={styles.icon} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button
                    type="submit"
                    disabled={updating}
                    style={
                      updating
                        ? { ...styles.saveButton, ...styles.disabledButton }
                        : styles.saveButton
                    }
                  >
                    <FaSave style={styles.buttonIcon} />
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={styles.cancelButton}
                  >
                    <FaTimes style={styles.buttonIcon} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          <FaSignOutAlt style={styles.buttonIcon} />
          Logout
        </button>
      </div>
    </div>
  );
}

// Updated Styles (CSS-in-JS)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    maxWidth: "900px",
    width: "100%",
    textAlign: "center",
  },
  header: {
    marginBottom: "30px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#f0f8ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    border: "3px solid #007bff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  content: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
    "@media (max-width: 768px)": { flexDirection: "column" }, // Stack on mobile
  },
  displaySide: {
    flex: 1,
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  editSide: {
    flex: 1,
    padding: "20px",
    background: "#f0f8ff",
    borderRadius: "8px",
    border: "1px solid #007bff",
    animation: "fadeIn 0.3s ease-in",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    fontSize: "16px",
    color: "#555",
  },
  infoIcon: {
    marginRight: "10px",
    color: "#007bff",
  },
  editButton: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s, transform 0.2s",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "5px",
  },
  icon: {
    marginRight: "10px",
    color: "#007bff",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    background: "#fff",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  saveButton: {
    flex: 1,
    padding: "10px",
    background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s",
  },
  cancelButton: {
    flex: 1,
    padding: "10px",
    background: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s",
  },
  disabledButton: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  logoutButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s",
  },
  buttonIcon: {
    marginRight: "8px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    fontSize: "18px",
    color: "#666",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ddd",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
};

// Add CSS for animations (if not using a global stylesheet)
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(
    `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
    styleSheet.cssRules.length
  );
}

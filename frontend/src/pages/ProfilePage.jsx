import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    contactNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', or ''

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/admin/profile", {
          withCredentials: true,
        });
        console.log("Profile fetch response:", response); // Debug: Check console for response details
        if (response.status === 401) {
          setMessage("Not authenticated. Please log in.");
          setMessageType("error");
        } else if (response.status === 500) {
          setMessage("Server error. Try again later.");
          setMessageType("error");
        } else if (response.data.success) {
          setProfile(response.data.user);
        } else {
          setMessage("Failed to load profile.");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Fetch error:", error); // Debug: Check console for errors
        setMessage("Error fetching profile. Check your connection.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle form submission for updating profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      const response = await axios.put("/api/admin/profile", profile, {
        withCredentials: true,
      });
      if (response.status === 401) {
        setMessage("Not authenticated. Please log in.");
        setMessageType("error");
      } else if (response.status === 400) {
        setMessage("Invalid data. Check your inputs.");
        setMessageType("error");
      } else if (response.data.success) {
        setMessage("Profile updated successfully.");
        setMessageType("success");
        setIsEditing(false);
      } else {
        setMessage("Failed to update profile.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error updating profile. Try again.");
      setMessageType("error");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #007bff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "30px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "20px",
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        Admin Profile
      </h2>

      {message && (
        <div
          style={{
            padding: "10px 15px",
            marginBottom: "20px",
            borderRadius: "8px",
            color: messageType === "success" ? "#155724" : "#721c24",
            backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
            border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`,
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
          }}
        >
          <span style={{ marginRight: "10px" }}>
            {messageType === "success" ? "✅" : "❌"}
          </span>
          {message}
        </div>
      )}

      {!isEditing ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <strong style={{ color: "#555", fontSize: "16px" }}>
              Username:
            </strong>
            <span style={{ color: "#333", fontSize: "16px" }}>
              {profile.username}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <strong style={{ color: "#555", fontSize: "16px" }}>Email:</strong>
            <span style={{ color: "#333", fontSize: "16px" }}>
              {profile.email}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <strong style={{ color: "#555", fontSize: "16px" }}>
              Contact Number:
            </strong>
            <span style={{ color: "#333", fontSize: "16px" }}>
              {profile.contactNumber}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "12px 25px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s, transform 0.2s",
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            ✏️ Edit Profile
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#555",
                fontSize: "16px",
              }}
            >
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#555",
                fontSize: "16px",
              }}
            >
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#555",
                fontSize: "16px",
              }}
            >
              Contact Number:
            </label>
            <input
              type="number"
              name="contactNumber"
              value={profile.contactNumber}
              onChange={handleChange}
              required
              placeholder="Enter your contact number"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "12px 25px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              ✅ Update Profile
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                padding: "12px 25px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s, transform 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;

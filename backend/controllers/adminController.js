import passport from "passport";
import Admin from "../database/models/admin.js";

// Existing login function
export const loginAdmin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: info.message || "Login failed" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ success: true, message: "Login successful", user });
    });
  })(req, res, next);
};

// Existing forgot password function - NOTE: Insecure; add email verification in production
export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and new password required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found with this email" });
    }

    await admin.setPassword(newPassword);
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating password" });
  }
};

// Existing get admin profile
export const getAdminProfile = (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      contactNumber: req.user.contactNumber,
      // Removed 'role' from response
    },
  });
};

// Existing update admin profile (for self)
export const updateAdminProfile = async (req, res) => {
  const { username, email, contactNumber } = req.body;

  if (!username || !email || !contactNumber) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    admin.username = username.trim();
    admin.email = email.trim().toLowerCase();
    admin.contactNumber = contactNumber;

    await admin.save();
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: admin,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

// New: Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, "-salt -hash"); // Exclude password fields
    res.json({ success: true, admins });
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ success: false, message: "Error fetching admins" });
  }
};

// New: Create a new admin
export const createAdmin = async (req, res) => {
  const { username, email, contactNumber, password } = req.body; // Removed 'role'

  if (!username || !email || !contactNumber || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const newAdmin = new Admin({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      contactNumber,
      // Removed 'role'
    });
    await Admin.register(newAdmin, password); // Handles hashing
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ success: false, message: "Error creating admin" });
  }
};

// New: Update any admin by ID
export const updateAdminById = async (req, res) => {
  const { id } = req.params;
  const { username, email, contactNumber } = req.body; // Removed 'role'

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    admin.username = username ? username.trim() : admin.username;
    admin.email = email ? email.trim().toLowerCase() : admin.email;
    admin.contactNumber = contactNumber || admin.contactNumber;
    // Removed 'role' update

    await admin.save();
    res.json({ success: true, message: "Admin updated successfully", admin });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ success: false, message: "Error updating admin" });
  }
};

// New: Delete any admin by ID
export const deleteAdminById = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot delete yourself" });
  }

  try {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ success: false, message: "Error deleting admin" });
  }
};

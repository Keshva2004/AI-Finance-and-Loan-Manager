import express from "express";
import passport from "passport";
import {
  loginAdmin,
  forgotPassword,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  createAdmin,
  updateAdminById,
  deleteAdminById,
} from "../controllers/adminController.js";

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ success: false, message: "Not authenticated" });
};

// Removed isSuperAdmin middleware since roles are gone

// Existing route
router.post("/login", loginAdmin);

// Forgot password (public, but requires email) - NOTE: Insecure; add email verification in production
router.post("/forgot-password", forgotPassword);

// ✅ New: Verify authentication route (checks session validity)
router.get("/verify", isAuthenticated, (req, res) => {
  res.json({ success: true, message: "Authenticated", user: req.user });
});

// Profile routes (for logged-in admin)
router.get("/profile", isAuthenticated, getAdminProfile);
router.put("/profile", isAuthenticated, updateAdminProfile);

// Logout route (new)
router.post("/logout", isAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// CRUD routes (require authentication only; no role checks)
router.get("/", isAuthenticated, getAllAdmins); // List all admins
router.post("/", isAuthenticated, createAdmin); // Create new admin
router.put("/:id", isAuthenticated, updateAdminById); // Update any admin
router.delete("/:id", isAuthenticated, deleteAdminById); // Delete any admin

export default router;

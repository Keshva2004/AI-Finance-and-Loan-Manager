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

// Profile routes (for logged-in admin)
router.get("/profile", isAuthenticated, getAdminProfile);
router.put("/profile", isAuthenticated, updateAdminProfile);

// CRUD routes (require authentication only; no role checks)
router.get("/", isAuthenticated, getAllAdmins); // List all admins
router.post("/", isAuthenticated, createAdmin); // Create new admin
router.put("/:id", isAuthenticated, updateAdminById); // Update any admin
router.delete("/:id", isAuthenticated, deleteAdminById); // Delete any admin

export default router;

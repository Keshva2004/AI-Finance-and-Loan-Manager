// dashboardroute.js
// This file defines the routes for the dashboard API endpoints.
// It uses Express Router to handle GET requests for dashboard summaries.

import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

// Route to fetch dashboard summary data (e.g., totals and counts)
// GET /dashboard/summary
router.get("/summary", getDashboardSummary);

export default router;

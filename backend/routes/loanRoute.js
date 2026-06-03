import express from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} from "../controllers/loanController.js";
import { underwriteLoan } from "../controllers/underwritingController.js";
import { sendLoanReminders } from "../controllers/emailReminder.js"; // Import the new function

const router = express.Router();

router.post("/", createLoan);
router.get("/", getLoans);
router.get("/:id", getLoanById);
router.put("/:id", updateLoan);
router.delete("/:id", deleteLoan);
router.post("/:id/underwrite", underwriteLoan);

// New route for sending loan reminders
router.post("/send-reminders", async (req, res) => {
  try {
    const result = await sendLoanReminders();
    res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;

// routes/contactRoute.js
import express from "express";
import { sendEmail } from "../controllers/contactController.js";

const router = express.Router();

// Route for sending contact form emails
router.post("/send-email", sendEmail);

export default router;

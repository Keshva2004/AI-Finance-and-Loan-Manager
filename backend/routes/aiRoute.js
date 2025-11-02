import express from "express";
import { processCommand } from "../controllers/aiController.js";

const router = express.Router();

router.post("/process-command", processCommand);

export default router;

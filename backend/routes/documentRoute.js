import express from "express";
import upload from "../middleware/multer.js";
import {
  uploadDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  getNomineeDetails, // New import
} from "../controllers/documentController.js";
import Client from "../database/models/client.js"; // For fetching clients

const router = express.Router();

// New route for nominee details (moved to top to avoid conflict with parameterized route)
router.get("/nominees", getNomineeDetails);

router.post("/", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:clientId", getDocuments); // This now comes after specific routes
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// Added for UI client dropdown
router.get("/clients/all", async (req, res) => {
  try {
    const clients = await Client.find({}, "full_name _id");
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

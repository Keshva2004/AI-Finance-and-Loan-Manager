import mongoose from "mongoose";
import Document from "../database/models/document.js";
import Client from "../database/models/client.js";
import cloudinary from "../config/cloudinary.js";

export const uploadDocument = async (req, res) => {
  try {
    console.log("📤 Upload request received:", {
      clientId: req.body.clientId,
      docType: req.body.docType,
      file: req.file ? req.file.originalname : "No file",
    });

    if (!req.file) {
      console.error("❌ No file provided");
      return res.status(400).json({ error: "File is required" });
    }

    // Optional: Check file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }

    const { clientId, docType } = req.body;
    if (!clientId || !docType) {
      console.error("❌ Missing clientId or docType");
      return res
        .status(400)
        .json({ error: "clientId and docType are required" });
    }

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
      console.error("❌ Client not found:", clientId);
      return res.status(404).json({ error: "Client not found" });
    }

    // No need to upload again—CloudinaryStorage already did it. Use req.file data.
    console.log("✅ File already uploaded to Cloudinary via Multer");

    // Create document using correct req.file properties
    const doc = await Document.create({
      clientId,
      docType,
      url: req.file.path, // Correct: Secure URL from Cloudinary
      publicId: req.file.filename, // Correct: Public ID from Cloudinary
    });
    console.log("📄 Document created:", doc._id);

    // Add to client's documents array
    client.documents.push(doc._id);
    await client.save();

    // Auto-update documentStatus based on count
    const totalRequired = 10; // Adjust if different
    if (client.documents.length >= totalRequired) {
      client.documentStatus = "Approved";
      await client.save();
      console.log("✅ Client status updated to Approved");
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error("❌ Upload error:", err); // Log the full error for debugging
    res.status(500).json({ error: "Upload failed. Check server logs." });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const query = {};
    if (req.params.clientId) {
      if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
        console.error("❌ Invalid clientId:", req.params.clientId);
        return res.status(400).json({ error: "Invalid clientId" });
      }
      query.clientId = req.params.clientId;
    }

    const docs = await Document.find(query).populate("clientId", "full_name");
    console.log("📋 Fetched documents:", docs.length);
    res.json(docs);
  } catch (err) {
    console.error("❌ Get documents error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { docType } = req.body;
    if (!docType) {
      console.error("❌ Missing docType for update");
      return res.status(400).json({ error: "docType is required" });
    }

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { docType },
      { new: true }
    ).populate("clientId", "full_name");

    if (!doc) {
      console.error("❌ Document not found for update:", req.params.id);
      return res.status(404).json({ error: "Document not found" });
    }

    console.log("✏️ Document updated:", doc._id);
    res.json(doc);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      console.error("❌ Document not found for delete:", req.params.id);
      return res.status(404).json({ error: "Document not found" });
    }

    // Remove from client's documents array
    await Client.findByIdAndUpdate(doc.clientId, {
      $pull: { documents: doc._id },
    });

    // Auto-update documentStatus based on count
    const updatedClient = await Client.findById(doc.clientId).populate(
      "documents"
    );
    const totalRequired = 10; // Adjust if different
    if (updatedClient.documents.length < totalRequired) {
      updatedClient.documentStatus = "Pending";
      await updatedClient.save();
      console.log("✅ Client status reverted to Pending");
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(doc.publicId);
    console.log("☁️ Deleted from Cloudinary");

    // Delete document
    await doc.deleteOne();
    console.log("🗑️ Document deleted");

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// New controller for nominee details
export const getNomineeDetails = async (req, res) => {
  try {
    // Fetch all clients
    const clients = await Client.find({}, "full_name _id").lean();

    // Define required doc types
    const requiredDocTypes = [
      "PAN Card",
      "Aadhaar Card",
      "Election Card",
      "Photo",
    ];

    // For each client, fetch and map their documents
    const nomineeDetails = await Promise.all(
      clients.map(async (client) => {
        const documents = await Document.find(
          { clientId: client._id, docType: { $in: requiredDocTypes } },
          "docType url"
        ).lean();

        // Map doc types to their URLs or "Not Uploaded"
        const docMap = {};
        requiredDocTypes.forEach((type) => {
          const doc = documents.find((d) => d.docType === type);
          docMap[type] = doc ? doc.url : "Not Uploaded";
        });

        return {
          clientId: client._id,
          clientName: client.full_name,
          panCard: docMap["PAN Card"],
          aadhaarCard: docMap["Aadhaar Card"],
          electionCard: docMap["Election Card"],
          photos: docMap["Photo"], // Assuming "Photo" is for photos
        };
      })
    );

    console.log("📋 Fetched nominee details:", nomineeDetails.length);
    res.json(nomineeDetails);
  } catch (err) {
    console.error("❌ Get nominee details error:", err);
    res.status(500).json({ error: "Failed to fetch nominee details" });
  }
};

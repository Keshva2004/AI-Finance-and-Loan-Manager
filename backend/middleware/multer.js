// middleware/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // Ensure this path matches your Cloudinary config file

// Configure Cloudinary storage for uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "documents", // Optional: Folder in Cloudinary for organization
    allowed_formats: ["jpg", "jpeg", "png", "pdf"], // Matches your frontend validation
    resource_type: "auto", // Handles images and PDFs automatically
  },
});

// Create and export the Multer instance
const upload = multer({ storage });
export default upload;

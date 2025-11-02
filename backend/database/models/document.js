// database/models/document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    docType: {
      type: String,
      required: true,
      enum: [
        "PAN Card",
        "Aadhaar Card",
        "Election Card",
        "Driving License",
        "Property Tax",
        "Ration Card",
        "Light Bill",
        "Photo",
        "Bank Statement",
        "Cheque",
      ],
    },
    url: {
      type: String, // Cloudinary URL
      required: true,
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);

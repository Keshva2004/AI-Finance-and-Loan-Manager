import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  subject: String,
  body: String,
  status: String,
  error: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("EmailLog", emailLogSchema);

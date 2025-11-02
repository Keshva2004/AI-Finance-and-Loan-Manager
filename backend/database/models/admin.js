import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import cors from "cors"; // Install if needed: npm install cors
import express from "express"; // Assuming this is your main app file; adjust if not

const app = express(); // Assuming this is defined here or imported

// CORS setup for frontend (adjust origin to your React app's URL)
app.use(
  cors({
    origin: "http://localhost:3000", // Change to your frontend URL
    credentials: true, // Allow cookies/sessions
  })
);

const URL = "mongodb://127.0.0.1:27017/financeDB";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  // Removed 'role' field as per request
});

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;

async function main() {
  await mongoose.connect(URL);
}

main()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Error:", err));

// Export app if this is your main file
export { app };

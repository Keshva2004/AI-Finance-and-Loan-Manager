// server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./config/passport.js";

import adminRoutes from "./routes/adminRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import documentRoutes from "./routes/documentRoute.js";
import loanRoutes from "./routes/loanRoute.js"; // ✅ Added loan routes
import paymentRoutes from "./routes/paymentRoute.js";
import aiRoutes from "./routes/aiRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";


dotenv.config();

// ✅ Enhanced env checks
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingVars.join(
      ", "
    )}. Please set them in .env.`
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Test DB connection early
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// ✅ CORS must be BEFORE routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());



// ... existing code ...

// ✅ API Routes
app.use("/admin", adminRoutes);
app.use("/clients", clientRoutes);
app.use("/documents", documentRoutes);
app.use("/loans", loanRoutes);
app.use("/dashboard", dashboardRoute);


// ... existing code ...

app.use("/payments", paymentRoutes);
app.use("/ai", aiRoutes);


// ✅ Default route
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

// ✅ Global error handling (prevents uncaught 500s) - Updated for better logging
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Server Error:", err); // Log the full err object
  if (err && err.stack) {
    console.error("Stack trace:", err.stack);
  }
  res
    .status(500)
    .json({ error: "Internal Server Error. Check server logs for details." });
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

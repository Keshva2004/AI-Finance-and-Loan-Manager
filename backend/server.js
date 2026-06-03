// server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./config/passport.js";

import adminRoutes from "./routes/adminRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import documentRoutes from "./routes/documentRoute.js";
import loanRoutes from "./routes/loanRoute.js"; // ✅ Added loan routes
import paymentRoutes from "./routes/paymentRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import contactRoutes from "./routes/contactRoute.js"; // ✅ Added contact routes

dotenv.config();

// ✅ Enhanced env checks (added email vars)
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_USER", // ✅ Added
  "EMAIL_PASS", // ✅ Added
  "SMTP_HOST", // ✅ Added
  "SMTP_PORT", // ✅ Added
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
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Updated: Enhanced session config for production and local dev
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/financeDB",
      collectionName: "sessions",
    }),
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
app.use("/api", contactRoutes); // ✅ Added contact routes under /api

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

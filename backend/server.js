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
import loanRoutes from "./routes/loanRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import contactRoutes from "./routes/contactRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === "production";

// ✅ Allowed origins for both local and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ai-finance-and-loan-manager-mycb.vercel.app",
];

// ✅ Env checks
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "SMTP_HOST",
  "SMTP_PORT",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

// ✅ Connect DB
connectDB()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// ✅ CORS - works for both local and production
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".render.com")
      ) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session - secure in production, normal in local
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // true on Render (https), false on local
      sameSite: isProduction ? "none" : "lax", // "none" needed for cross-site on production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/admin", adminRoutes);
app.use("/clients", clientRoutes);
app.use("/documents", documentRoutes);
app.use("/loans", loanRoutes);
app.use("/dashboard", dashboardRoute);
app.use("/payments", paymentRoutes);
app.use("/api", contactRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error." });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${isProduction ? "Production" : "Development"}`);
});

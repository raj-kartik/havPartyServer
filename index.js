// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { pathToRegexp } from "path-to-regexp";

// Routes and middleware
import userRoute from "./routes/User/index.js";
import employeeRoute from "./routes/Partner/index.js";
import ownerRoute from "./routes/Owner/owner.js";
import { verifyToken } from "./middlewares/middlware.js";

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins, including undefined (Postman, curl)
      callback(null, true);
    },
    credentials: true, // if you ever need to send cookies
  })
);

// Check if required env variables are defined
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL not defined in environment variables");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in environment variables");
  process.exit(1);
}

// Connect to MongoDB with timeout
mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// List of allowed public routes (no token required)
const allowedPaths = [
  "/",
  "/api/v1",
  "/api/v1/admin/signin",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/employee/signup",
  "/api/v1/employee/signin",
  "/api/v1/owner/signup",
  "/api/v1/owner/signin",
  "/api/v1/owner/employees",
  "/api/v1/owner/employee/details",
];

// Check if a path matches a dynamic route
const isDynamicPath = (path) => {
  const dynamicPaths = allowedPaths.filter((p) => p.includes(":"));
  return dynamicPaths.some((dynamicPath) => {
    const regexp = pathToRegexp(dynamicPath);
    return regexp.test(path);
  });
};

// Token verification middleware
app.use((req, res, next) => {
  const cleanedPath = req.path.split("?")[0]; // Strip query strings
  const isAllowed =
    allowedPaths.some((p) => cleanedPath.startsWith(p)) ||
    isDynamicPath(cleanedPath);

  if (isAllowed) {
    return next();
  }

  // For protected routes, verify token
  verifyToken(req, res, next);
});

// Root route
app.get("/api/v1", (req, res) => {
  res.send("🎉 Hav Party API is running!");
});

// Use route files
app.use("/api/v1", userRoute);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/owner", ownerRoute);

// Catch-all for unmatched routes
app.use((req, res) => {
  console.log("Unhandled route:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is listening on PORT ${port}`);
});

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { pathToRegexp } from "path-to-regexp";

import userRoute from "./routes/User/index.js";
import employeeRoute from "./routes/Partner/index.js";
import ownerRoute from "./routes/Owner/owner.js";
import { verifyToken } from "./middlewares/middlware.js";
import { signInClub } from "./controllers/Signin.js";
import bookingRoute from "./routes/Booking/bookingEvent.js";

const app = express();
const port = process.env.PORT || 8000;

// ✅ Parse JSON bodies
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

// ✅ Check required environment variables
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL not defined in .env");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in .env");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ✅ Define public (non-authenticated) routes
const allowedPaths = [
  "/api/v1",
  "/api/v1/admin/signin",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/club/signin",
  "/api/v1/owner/signup",
  "/api/v1/owner/employees",
  "/api/v1/owner/employee/details",
  "/api/v1/booking/event",
  "/api/v1/booking/all-event",
  "/api/v1/booking/event/:eventId",
];

// ✅ Helper to match dynamic paths
const isAllowedPath = (path) => {
  return allowedPaths.some((pattern) => {
    const regex = pathToRegexp(pattern);
    return regex instanceof RegExp && regex.test(path);
  });
};

// ✅ JWT Middleware (for protected routes)
app.use((req, res, next) => {
  const cleanedPath = req.path.split("?")[0];
  if (allowedPaths.includes(cleanedPath) || isAllowedPath(cleanedPath)) {
    return next(); // allow public routes
  }
  verifyToken(req, res, next);
});

// ✅ Root route
app.get("/api/v1", (req, res) => {
  res.send("🎉 Hav Party API is running!");
});

// ✅ Use routes
app.use("/api/v1", userRoute);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/owner", ownerRoute);
app.post("/api/v1/club/signin", signInClub);
app.use("/api/v1/booking", bookingRoute);

// ✅ 404 handler
app.use((req, res) => {
  console.log("Unhandled route:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is listening on PORT ${port}`);
});

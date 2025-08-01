// import 'module-alias/register.js';
// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import modules
// ✅ Correct
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { pathToRegexp } from "path-to-regexp";

// Routes and middleware
import userRoute from "./routes/User/index.js";
import employeeRoute from "./routes/Partner/index.js";
import ownerRoute from "./routes/Owner/owner.js";
import { verifyToken } from "./middlewares/middlware.js";
// import { ownerSignIn } from "./controllers/Owner/Owner.js";
import { signInClub } from "./controllers/Signin.js";
import bookingRoute from "./routes/Booking/bookingEvent.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // allow all origins
    },
    credentials: true,
  })
);

// ✅ Required environment variables check
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL not defined in .env");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in .env");
  process.exit(1);
}

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ✅ Public (non-authenticated) routes
const allowedPaths = [
  "/api/v1",
  "/api/v1/admin/signin",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/club/signin", // club owner or manager signin
  "/api/v1/owner/signup",
  "/api/v1/owner/employees",
  "/api/v1/owner/employee/details",
  "/api/v1/booking/event",
];

// ✅ Allow dynamic route matching using path-to-regexp
const isAllowedPath = (path) => {
  return allowedPaths.some((pattern) => {
    const regex = pathToRegexp(pattern);
    return regex instanceof RegExp && regex.test(path);
  });
};

// ✅ Middleware for verifying JWT unless route is public
app.use((req, res, next) => {
  const cleanedPath = req.path.split("?")[0];

  // console.log("---- isAllowedPath(cleanedPath) in the middleware ----",allowedPaths.includes(cleanedPath));

  if (allowedPaths.includes(cleanedPath)) {
    return next(); // allow without token
  }
  // secure routes
  verifyToken(req, res, next);
});

// ✅ Root route
app.get("/api/v1", (req, res) => {
  res.send("🎉 Hav Party API is running!");
});

// ✅ API route usage
app.use("/api/v1", userRoute);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/owner", ownerRoute);
app.post("/api/v1/club/signin",signInClub);

// booking routes
app.use("/api/v1/booking",bookingRoute)

// ✅ 404 for unmatched routes
app.use((req, res) => {
  console.log("Unhandled route:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is listening on PORT ${port}`);
});

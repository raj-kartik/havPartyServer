import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { match } from "path-to-regexp";

import userRoute from "./routes/User/index.js";
import employeeRoute from "./routes/Partner/index.js";
import ownerRoute from "./routes/Owner/owner.js";
import { verifyToken } from "./middlewares/middlware.js";
import { signInClub } from "./controllers/Signin.js";
import bookingRoute from "./routes/Booking/bookingEvent.js";
import offerRoute from "./routes/Offers/offers.js";
import clubRoute from "./routes/UserClubs/UserClub.js";

const app = express();
const port = process.env.PORT || 8000;

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Setup CORS
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // Allow all origins including Postman/curl (null origin)
    },
    credentials: true,
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
  "/api/v1/booking/book-event",
  "/api/v1/booking/event-detail/:eventId",
  "/api/v1/offers/get-offers", // user offers list
  "/api/v1/offers/offer-details/:offerId", // user offers list
  "/api/v1/clubs/all-clubs",
  "/api/v1/clubs/club-detail/:clubId"
];

// ✅ Helper to match dynamic paths
const isAllowedPath = (path) => {
  return allowedPaths.some((pattern) => {
    try {
      const matcher = match(pattern, { decode: decodeURIComponent });
      const matched = matcher(path);
      return matched !== false;
    } catch (err) {
      console.error(`❌ Error in pattern: ${pattern}`, err);
      return false;
    }
  });
};

// ✅ JWT Middleware (protect routes unless allowed)
app.use((req, res, next) => {
  const cleanedPath = req.path;
  // console.log("🔍 Incoming path:", cleanedPath);

  if (isAllowedPath(cleanedPath)) {
    // console.log("✅ Public route:", cleanedPath);
    return next();
  }

  // console.log("🔐 Protected route:", cleanedPath);
  return verifyToken(req, res, next);
});

// ✅ Root route
app.get("/api/v1", (req, res) => {
  res.send("🎉 Hav Party API is running!");
});

// ✅ Register routes
app.use("/api/v1", userRoute);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/owner", ownerRoute);
app.post("/api/v1/club/signin", signInClub);
app.use("/api/v1/booking", bookingRoute);
app.use("/api/v1/offers", offerRoute);
app.use("/api/v1/clubs", clubRoute);

// ✅ 404 Handler
app.use((req, res) => {
  console.log("❓ Unhandled route:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server is listening on PORT ${port}`);
});

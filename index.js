// Import required modules
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoute from "./routes/User/index.js";
import employeeRoute from "./routes/Partner/index.js";
import ownerRoute from "./routes/Owner/owner.js";
import { pathToRegexp } from "path-to-regexp";
import { verifyToken } from "./middlewares/middlware.js";

// Create an instance of Express
const app = express();
const port = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());

// Log MongoDB connection URL
console.log("MONGO_URL:", process.env.MONGO_URL);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define allowed paths

app.use(cors());
const allowedPaths = [
  // default path
  "/",
  "/api/v1",

  // admin path
  "/api/v1/admin/signin",

  // user path
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",

  // employee path
  "api/v1/employee/signup",
  "/api/v1/employee/signin",

  // owner path
  "/api/v1/owner/employee/details",
  "/api/v1/owner/employees",
  "/api/v1/owner/signup",
  "/api/v1/owner/signin",
];

// Function to check for dynamic path matches
const isDynamicPath = (path) => {
  const dynamicPaths = allowedPaths.filter((p) => p.includes(":"));
  return dynamicPaths.some((dynamicPath) => {
    const regexp = pathToRegexp(dynamicPath);
    return regexp.test(path);
  });
};

// Middleware to handle authentication
app.use((req, res, next) => {
  const isAllowed = allowedPaths.includes(req.path) || isDynamicPath(req.path);

  if (isAllowed) {
    next(); // Allow the request if it's in the allowed paths
  } else {
    verifyToken(req, res, next); // Apply token verification otherwise
  }
});

// Define routes
app.get("/api/v1", (req, res) => {
  res.send("This is hav Party");
});

app.use("/api/v1", userRoute);
app.use("/api/v1/employee", employeeRoute);
app.use("/api/v1/owner", ownerRoute);

// Start the Express server
app.listen(port, () => {
  console.log("-- listening on PORT", port);
});

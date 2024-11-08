// Import required modules
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/User/index.js";
import partnerRoute from "./routes/Partner/index.js";
import { pathToRegexp } from "path-to-regexp";
import { verifyToken } from "./middlewares/middlware.js";

// Create an instance of Express
const app = express();
const port = process.env.PORT || 3000;

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
const allowedPaths = [
  "/",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/admin/signin",
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
app.get("/", (req, res) => {
  res.send("This is hav Party");
});

app.use("/api/v1/", userRoute);
app.use("/api/v1/partner", partnerRoute);

// Start the Express server
app.listen(port, () => {
  console.log("-- listening on PORT", port);
});

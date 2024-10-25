import dotenv from "dotenv";
dotenv.config();
import express from "express";
import userRoute from "./routes/User/Auth/user.js";
import mongoose from "mongoose";
import { verifyToken } from "./middlewares/middlware.js";
import user from './routes/User/index.js'
import partner from './routes/Partner/index.js'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const allowedPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/admin/signin",
];

app.use(express.json());
app.use((req, res, next) => {
  const dynamicPaths = allowedPaths.filter((path) => path.includes(":"));
  const isAllowed = allowedPaths.some(
    (path) =>
      path === req.path ||
      dynamicPaths.some((dynamicPath) => {
        const basePath = dynamicPath.split(":")[0];
        return req.path.startsWith(basePath);
      })
  );

  isAllowed ? next() : verifyToken(req, res, next);
});

// Define routes
app.get("/", (req, res) => {
  res.send("This is hav Party");
});

app.use("/api/v1/user", user);
app.use("/api/v1/partner", partner);

app.listen(port, () => {
  console.log("-- listening on PORT", port);
});

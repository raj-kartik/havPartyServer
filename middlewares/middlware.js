import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).send("Authorization token is missing");
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).send("Token is not provided");
    }

    const decoded = await jsonwebtoken.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      req.user = decoded;
      return next();
    }

    res.status(403).send("Not authorized");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).send("Invalid token");
  }
};
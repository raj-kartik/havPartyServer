import axios from "axios";
import User from "../../../models/User/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthSignIn = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if ((!username && !email) || !password) {
      return res
        .status(400)
        .json({ message: "Username or email and password are required." });
    }
    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "User is blocked or banned." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET
    );

    // Respond with user details and token
    return res.status(200).json({
      message: "Login successful.",
      user,
      token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

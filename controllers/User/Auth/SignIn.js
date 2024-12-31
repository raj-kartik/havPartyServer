import axios from "axios";
import User from "../../../models/User/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthSignIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username or email and password are required." });
    }

    // Determine if the input is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    // Find user by email or username
    const user = await User.findOne(
      isEmail ? { email: username } : { username: username }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user is blocked or banned
    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "User is blocked or banned." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a never-expiring JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET // No 'expiresIn' option means the token will not expire
    );

    // Respond with user details and token
    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
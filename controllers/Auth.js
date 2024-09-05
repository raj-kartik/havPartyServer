import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthSignup = async (req, res) => {
  const { name, username, email, password, isAdult, gender } = req.body;

  // Validate that all required fields are present
  if (!name || !username || !email || !password || isAdult === undefined || !gender) {
    return res.status(400).json({
      message: "All fields are required",
      status: 400,
    });
  }

  try {
    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
        status: 400,
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      isAdult,
      gender,
    });

    // Save the user in the database
    await user.save();

    // Generate a JWT token (no expiration)
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET 
    );

    // Respond with success message and token
    res.status(200).json({
      message: "Welcome to Hook",
      status: 200,
      token, 
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        isAdult: user.isAdult,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

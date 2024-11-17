import User from "../../../models/User/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthSignup = async (req, res) => {
  const { name, username, email, password, isAdult, gender } = req.body;
  if (!name || !username || !email || !password || isAdult === undefined || !gender) {
    return res.status(400).json({
      message: "All fields are required",
      status: 400,
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
        status: 400,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      isAdult,
      gender,
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET 
    );
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

    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

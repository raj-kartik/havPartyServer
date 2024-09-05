import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";

export const AuthSignup = async (req, res) => {
  const { name, username, email, password, isAdult, gender } = req.body;
  
  try {
    const user = new User({ name, username, email, password, isAdult, gender });
    
    if (user) {
      await user.save();
      
      // Generate token without expiration
      const token = jwt.sign(
        { id: user._id, username: user.username }, // Payload
        process.env.JWT_SECRET // Secret key (no expiration)
      );
      
      res.status(200).json({
        message: "Welcome to Hook",
        status: 200,
        token, // Token with no expiration
        user: {
          name,
          username,
          email,
          isAdult,
          gender,
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

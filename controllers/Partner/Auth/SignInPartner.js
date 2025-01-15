import bcrypt from "bcryptjs"; // For password comparison
import jwt from "jsonwebtoken"; // For generating JWT
import Partner from "../../../models/Partner/Partner.js";
export const signInPartner = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email is provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the partner by email
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the authenticated partner
    const token = jwt.sign(
      { partnerId: partner._id, email: partner.email, position: partner.position },
      process.env.JWT_SECRET, // Use your secret key from .env
      { expiresIn: "1h" } // Token expiration time (1 hour)
    );

    // Send the response with the token and partner details
    return res.status(200).json({
      message: "Sign-in successful",
      data: partner,
      token, // Include the generated token in the response
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

import Owner from "../../../models/Owner/owner.js";
import Club from "../../../models/Partner/Club/clubSchema.js";
import Employee from "../../../models/Partner/Partner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createPartner = async (req, res) => {
  const {
    name,
    email,
    mobile,
    position,
    club,
    address,
    profilePicture,
    password,
  } = req.body;

  try {
    // Validate if position is not "Owner" and club is provided
    if (position !== "Owner" && !club) {
      return res
        .status(400)
        .json({ message: "Club is required for this position" });
    }

    // If club is provided, validate its existence
    if (club) {
      const existingClub = await Club.findById(club);
      if (!existingClub) {
        return res.status(404).json({ message: "Club not found" });
      }
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let clubUser;

    if (position.toLowerCase() === "owner") {
      clubUser = new Owner({
        name,
        email,
        mobile,
        position,
        address,
        profilePicture,
        password: hashedPassword, 
      });
    }

    if (position.toLowerCase() !== "owner") {
      clubUser = new Employee({
        name,
        email,
        mobile,
        position,
        club,
        address,
        profilePicture,
        password: hashedPassword, // Save the hashed password
      });
    }

    await clubUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        partnerId: partner._id,
        email: partner.email,
        position: partner.position,
      },
      process.env.JWT_SECRET, // Use your secret key from .env
      { expiresIn: "1h" } // Set expiration time for the token (e.g., 1 hour)
    );

    return res.status(201).json({
      message: "Partner created successfully",
      data: partner,
      token, // Include the generated token in the response
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

import Club from "../../../models/Partner/Club/clubSchema.js";
import Partner from "../../../models/Partner/Partner.js";

export const createPartner = async (req, res) => {
  const { name, email, mobile, position, club, address, profilePicture } = req.body;

  try {
    // Validate if position is not "Owner" and club is provided
    if (position !== "Owner" && !club) {
      return res.status(400).json({ message: "Club is required for this position" });
    }

    // If club is provided, validate its existence
    if (club) {
      const existingClub = await Club.findById(club);
      if (!existingClub) {
        return res.status(404).json({ message: "Club not found" });
      }
    }

    // Create a new Partner
    const partner = new Partner({
      name,
      email,
      mobile,
      position,
      club,
      address,
      profilePicture,
    });

    await partner.save();

    return res.status(201).json({
      message: "Partner created successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

import Club from "../../../models/Partner/Club/clubSchema.js";
import Owner from "../../../models/Owner/owner.js";

export const createClub = async (req, res) => {
  const {
    name,
    manager,
    location,
    photos,
    menu,
    price,
    pincode,
    license,
    coordinates,
    ownerId,
  } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  if (!ownerId) {
    return res.status(400).json({ message: "Owner Id is required." });
  }

  if (!license) {
    return res.status(400).json({ message: "License is required." });
  }

  if (!manager) {
    return res.status(400).json({ message: "Manager name is required." });
  }

  if (!location || !location.address1 || !location.city || !location.state) {
    return res
      .status(400)
      .json({ message: "Address, City, and State are required." });
  }
  if (!pincode) {
    return res.status(400).json({ message: "Pincode is required." });
  }

  try {
    // Check if a club with the same name and address already exists
    const existingClub = await Club.findOne({
      name,
      "location.address1": location.address1,
    });
    if (existingClub) {
      return res.status(409).json({ message: "Club already exists." });
    }

    // Create a new club
    const club = new Club({
      name,
      manager, 
      license,
      location: {
        address1: location.address1,
        address2: location.address2 || "",
        city: location.city,
        state: location.state,
        pincode,
        coordinates: {
          type: "Point",
          coordinates: coordinates || [],
        },
      },
      photos: photos || [],
      menu: {
        drinks: menu?.drinks || [],
        foods: menu?.foods || [],
        beverages: menu?.beverages || [],
      },
      price: {
        single: price?.single || 0,
        couple: price?.couple || 0,
      },
      owner: ownerId,
    });

    // Save the club
    await club.save();

    // Update the Owner document by adding the club ID to the clubs_owned array
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // Add the club to the owner's clubs_owned array
    owner.clubs_owned.push(club._id);
    await owner.save();

    res.status(200).json({
      message: "Welcome to VIV",
      state: 200,
      club,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

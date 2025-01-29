import Club from "../../../models/Partner/Club/clubSchema.js";
import Partner from "../../../models/Partner/Employee.js";

export const createClub = async (req, res) => {
  const {
    name,
    manager,
    location,
    photos,
    menu,
    price,
    pincode,
    coordinates,
    partnerId,
    license, // Added license
  } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: "Club name is required." });
  }

  if (!partnerId) {
    return res.status(400).json({ message: "Partner ID is required." });
  }

  if (!manager) {
    return res.status(400).json({ message: "Manager name is required." });
  }

  if (!license) {
    return res.status(400).json({ message: "License is required." });
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
      return res.status(409).json({ message: "Club with this name and address already exists." });
    }

    // Check if the partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // Create a new club
    const club = new Club({
      name,
      manager,
      license, // Added license to the club data
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
      owner: partnerId,
    });

    // Save the club
    await club.save();

    // Add the club to the partner's clubs_owned array
    partner.clubs_owned.push(club._id);
    await partner.save();

    // Respond with success
    res.status(201).json({
      message: "Club created successfully.",
      state: 201,
      club,
    });
  } catch (err) {
    console.error("Error creating club:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to add an offer to a specific club
export const addOfferToClub = async (req, res) => {
  const { clubId, title, description, discount, validFrom, validUntil, terms } = req.body;

  // Validate required fields
  if (!clubId) {
    return res.status(400).json({ message: "Club ID is required." });
  }

  if (!title || !description || !discount || !validFrom || !validUntil) {
    return res.status(400).json({ message: "All offer fields are required." });
  }

  try {
    // Find the club by ID
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Create the new offer
    const newOffer = {
      title,
      description,
      discount,
      validFrom,
      validUntil,
      terms: terms || "",
    };

    // Add the offer to the club's offers array
    club.offers.push(newOffer);

    // Save the club with the new offer
    await club.save();

    res.status(201).json({
      message: "Offer added successfully.",
      state: 201,
      club,
    });
  } catch (err) {
    console.error("Error adding offer:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

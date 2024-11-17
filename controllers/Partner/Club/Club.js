import Club from "../../../models/Partner/Club/clubSchema.js";

export const createClub = async (req, res) => {
  const { name, owner, location, city, state, photos, menu, price, pincode, license, coordinates } = req.body;

  // Validate required fields
  if (!name || !location) {
    return res.status(400).json({ message: "Name and Location are required." });
  }
  if (!pincode) {
    return res.status(400).json({ message: "Pincode is required." });
  }

  try {
    // Check if a club with the same name and location already exists
    const existingClub = await Club.findOne({ name, location });
    if (existingClub) {
      return res.status(409).json({ message: "Club already exists." });
    }

    // Create a new club
    const club = new Club({
      name,
      owner,
      location,
      city,
      state,
      photos,
      menu,
      price,
      pincode,
      license,
    });

    // Save the club and respond
    await club.save();
    res.status(200).json({
      message: "Welcome to VIV",
      state: 200,
      club: {
        name,
        location,
        city,
        state,
        photos,
        menu,
        price,
        pincode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

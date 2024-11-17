import Club from "../../../models/Partner/Club/clubSchema.js";
import User from "../../../models/User/userSchema.js";

export const getNearByClub = async (req, res) => {
  const { id, location } = req.body;

  if (!id)
    return res.status(400).json({
      message: "Please Provide User id",
    });

  if (!location || !location.coordinates || location.coordinates.length !== 2)
    return res.status(400).json({
      message:
        "Please Provide valid User location coordinates (longitude and latitude)",
    });

  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    // Finding nearby clubs using $near
    const clubs = await Club.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location.coordinates, // [longitude, latitude]
          },
          $maxDistance: 5000, // Specify the maximum distance in meters (e.g., 5000m = 5km)
        },
      },
    });

    return res.status(200).json({ clubs });
  } catch (error) {
    console.error("Error during fetching clubs:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const popularClubs = async (req, res) => {
  const { city, state } = req.body;

  if (!city && !state)
    return res.status(500).json({
      message: "Please provide the city or state",
    });

  try {
    const clubs = await Club.find({
      "location.city": city,
      "location.state": state,
    });

    if (!clubs || clubs.length === 0)
      return res.status(204).json({ message: "No data found" });

    return res.status(200).json({
      message: "Clubs are available",
      data: clubs,
    });
  } catch (error) {
    console.error("Error during fetching clubs:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

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

  if (!city && !state) {
    return res.status(400).json({
      message: "Please provide the city or state",
    });
  }

  try {
    const query = {};
    if (city) query["location.city"] = { $regex: city, $options: "i" }; // Case-insensitive for city
    if (state) query["location.state"] = { $regex: state, $options: "i" }; // Case-insensitive for state

    const clubs = await Club.find(query);

    if (!clubs || clubs.length === 0) {
      return res.status(204).json({ message: "No data found" });
    }

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

// export const popularClubs = async (req, res) => {
//   // Extract city and state from the request body
//   const { city, state } = req.body;

//   // Check if neither city nor state is provided
//   if (!city && !state)
//     return res.status(400).json({
//       message: "Please provide the city or state",
//     });

//   try {
//     const query = {};
    
//     // If city is provided, add it to the query
//     if (city) {
//       query["location.city"] = { $regex: city, $options: "i" }; // Case-insensitive regex for city
//     }
    
//     // If state is provided, add it to the query
//     if (state) {
//       query["location.state"] = { $regex: state, $options: "i" }; // Case-insensitive regex for state
//     }

//     // Query the database for clubs matching the location criteria
//     const clubs = await Club.find(query);

//     // If no clubs are found, return a 204 response
//     if (!clubs || clubs.length === 0)
//       return res.status(204).json({ message: "No data found" });

//     // Return the list of clubs if found
//     return res.status(200).json({
//       message: "Clubs are available",
//       data: clubs,
//     });
//   } catch (error) {
//     console.error("Error during fetching clubs:", error);
//     return res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

export const getClubDetails = async (req, res) => {

  const {id} = req.body;
  try {
    const data = Club.find({where:{id}})
  } catch (error) {
    console.error("Error during fetching clubs:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

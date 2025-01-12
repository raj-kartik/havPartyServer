import Club from "../../../models/Partner/Club/clubSchema.js";
import Booking from "../../../models/User/Booking/userBookingHistory.model.js";
import User from "../../../models/User/userSchema.js";

export const createBooking = async (req, res) => {
  const { userId, clubId, numberOfPeople, date, time } = req.body;

  try {
    // Validate required fields
    if (!userId) return res.status(400).json({ message: "Invalid User ID" });
    if (!clubId) return res.status(400).json({ message: "Invalid Club ID" });
    if (!date) return res.status(400).json({ message: "Invalid Date" });
    if (!time) return res.status(400).json({ message: "Invalid Time" });

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the club exists
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Create and save the booking
    const book = new Booking({
      userId,
      clubId,
      numberOfPeople,
      date,
      time,
    });

    await book.save();

    return res
      .status(200)
      .json({ message: "Booking Successful", data: { book } });
  } catch (error) {
    console.error("Error during booking creation:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

import DailyBooking from "../../models/Booking/DailyBooking.js";
import Club from "../../models/Partner/Club/clubSchema.js";
import User from "../../models/User/userSchema.js";

export const postBookDailyClub = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      gender,
      isAdult,
      clubId,
      numOfCustomer,
      promotorName,
      specialNotes,
      promotorId,
      timing,
    } = req.body;

    if (!name || !email || !mobile || !gender || isAdult !== true || !clubId || !timing || !numOfCustomer) {
      return res.status(400).json({ message: "Missing required fields or isAdult must be true" });
    }

    // 1️⃣ Check if club exists
    const club = await Club.findOne({ _id: clubId, isDelete: false });
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // 2️⃣ Check if user exists by email or mobile
    let user = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    // 3️⃣ If not found → create user
    if (!user) {
      user = new User({
        name,
        email,
        mobile,
        gender,
        isAdult,
      });
      await user.save();
    }

    // 4️⃣ Create DailyBooking
    const booking = new DailyBooking({
      clubId,
      userId: user._id,
      date: new Date(timing),
      numOfCustomer,
      promotorName: promotorName || null,
      promotorId: promotorId || null,
      specialNotes: specialNotes || null,
      bookingType: "online",
      bookingStatus: "pending",
    });

    await booking.save();

    // 5️⃣ Optionally, push booking to user's dailyBookings array
    user.dailyBookings.push(booking._id);
    await user.save();

    return res.status(201).json({
      message: "Daily club booking created successfully",
      booking,
      status:200
    });
  } catch (error) {
    console.error("Error booking daily club:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
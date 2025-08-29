import DailyBooking from "../../models/Booking/DailyBooking.js";
import Owner from "../../models/Owner/owner.js";
import Club from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";
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

    if (
      !name ||
      !email ||
      !mobile ||
      !gender ||
      isAdult !== true ||
      !clubId ||
      !timing ||
      !numOfCustomer
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or isAdult must be true" });
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
      status: 200,
    });
  } catch (error) {
    console.error("Error booking daily club:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// club controllers
export const getDailyCrowdState = async (req, res) => {
  const { id, type } = req.user;
  const { date, month, year } = req.query; // 👈 coming from query params

  try {
    let clubIds = [];

    if (type === "owner") {
      const owner = await Owner.findById(id).select("clubs_owned");
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }
      clubIds = owner.clubs_owned;
    } else if (type === "manager") {
      const employee = await Employee.findById(id).select("club");
      if (!employee) {
        return res.status(404).json({ message: "Manager not found" });
      }
      clubIds = [employee.club];
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // 🔎 Date filtering logic
    let dateFilter = {};
    if (date) {
      // Filter exact day
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      dateFilter.date = { $gte: start, $lte: end };
    } else if (month && year) {
      // Filter by month
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
      dateFilter.date = { $gte: start, $lte: end };
    } else if (year) {
      // Filter whole year
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter.date = { $gte: start, $lte: end };
    }

    // fetch daily bookings for the clubs
    const dailyBookings = await DailyBooking.find({
      clubId: { $in: clubIds },
      ...dateFilter,
    })
      .populate("clubId", "name")
      .populate("userId", "name email mobile");

    res.status(200).json({ success: true, data: dailyBookings, status: 200 });
  } catch (err) {
    console.error("Error in getDailyCrowdState:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const patchDailyStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const { id, type } = req.user;

    if (!bookingId || !status) {
      return res
        .status(400)
        .json({ message: "BookingId and status are required" });
    }

    // Find the booking
    const booking = await DailyBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (type.toLowerCase() === "owner") {
      // get owner and verify club ownership
      const owner = await Owner.findById(id).select("clubs_owned");
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      const ownsClub = owner.clubs_owned.some(
        (clubId) => clubId.toString() === booking.clubId.toString()
      );

      if (!ownsClub) {
        return res.status(403).json({ message: "You don't own this club" });
      }
    } else if (type.toLowerCase() === "manager") {
      // get employee and verify assigned club
      const employee = await Employee.findById(id).select("club");
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // console.log("---- employee ----", employee)

      if (employee?.club.toString() !== booking.clubId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not assigned to this club" });
      }
    } else {
      return res.status(403).json({ message: "Invalid user type" });
    }

    // Update status
    booking.bookingStatus = status;
    await booking.save();

    return res.status(201).json({ message: "Booking status updated", booking, status:201 });
  } catch (error) {
    console.error("Error patching booking status:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

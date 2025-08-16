import EventBooking from "../../models/Booking/EventBooking.js";
import { Event } from "../../models/Event/EventSchema.js";
import Owner from "../../models/Owner/owner.js";
import Club from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";
import User from "../../models/User/userSchema.js";

// CLUB
export const getBookingOfEventToClub = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      message: "Please provide the user id (owner or employee)",
    });
  }

  try {
    let clubIds = [];

    // Check if ID is for Owner
    const owner = await Owner.findById(id);
    if (owner) {
      if (!owner.club_owned || owner.club_owned.length === 0) {
        return res.status(404).json({
          message: "Owner does not own any clubs",
        });
      }

      clubIds = owner.club_owned; // array of ObjectIds
    } else {
      // Check if ID is for Employee
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({
          message: "User not found as Owner or Employee",
        });
      }

      clubIds = [employee.clubId]; // single clubId
    }

    // Fetch event bookings for those clubIds
    const bookings = await EventBooking.find({ clubId: { $in: clubIds } })
      .populate("clubId", "name") // get club name
      .populate("eventId", "title date")
      .populate("userId", "name email")
      .populate("promoterId", "name");

    return res.status(200).json({
      message: "Event bookings fetched successfully",
      total: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("Error in getBookingOfEventToClub:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// CLUB + USER
export const postUserBookingEvent = async (req, res) => {
  const {
    clubId,
    eventId,
    entryType = "stag",
    numberOfPeople = 1,
    date,
    timeSlot,
    promoterId,
    promoterName,
    bookingDate,
    user: { name, mobile, email, gender, isAdult = true },
  } = req.body;

  // Sanitize mobile number
  const actualMobile = mobile.replace(/\D/g, "").slice(-10);
  const normalizedGender = gender?.toLowerCase();

  if (
    !clubId ||
    !eventId ||
    !name ||
    !actualMobile ||
    !gender ||
    !email ||
    !bookingDate ||
    !date ||
    !timeSlot?.startTime ||
    !timeSlot?.endTime
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate mobile format (Indian 10-digit)
  if (!/^[6-9]\d{9}$/.test(actualMobile)) {
    return res.status(400).json({ message: "Invalid mobile number format" });
  }

  // Validate gender
  if (!["male", "female", "other"].includes(normalizedGender)) {
    return res.status(400).json({ message: "Invalid gender value" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];
    const dateEntry = event.dates.find((dateObj) => {
      const eventDate = new Date(dateObj.date).toISOString().split("T")[0];
      return eventDate === formattedDate;
    });

    if (!dateEntry) {
      return res.status(400).json({ message: "No event on selected date." });
    }

    const slotExists = dateEntry.timeSlots.some(
      (slot) =>
        slot.startTime === timeSlot.startTime &&
        slot.endTime === timeSlot.endTime
    );

    if (!slotExists) {
      return res
        .status(400)
        .json({ message: "Invalid time slot for the selected date." });
    }

    // Find or create user
    let existingUser = await User.findOne({
      $or: [{ email }, { mobile: actualMobile }],
    });

    if (!existingUser) {
      existingUser = new User({
        name,
        email,
        mobile: actualMobile,
        gender: normalizedGender,
        isAdult,
        password: "", // guest user
      });
      await existingUser.save();
    }

    // Create booking
    const booking = new EventBooking({
      clubId,
      userId: existingUser._id,
      eventId,
      amountPaid: 0,
      paymentStatus: "unpaid",
      entryType,
      numberOfPeople,
      promoterId,
      promoterName,
      date: new Date(date),
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      },
    });

    await booking.save();

    // Add booking ID to user
    if (!existingUser.eventsBookings.includes(booking._id)) {
      existingUser.eventsBookings.push(booking._id);
      await existingUser.save();
    }

    return res.status(201).json({
      message: "Booking created successfully (Unpaid)",
      data: booking,
      status: 200,
    });
  } catch (err) {
    console.error("Error posting booking:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// CLUB + USER
export const updateUserBookingEvent = async (req, res) => {
  const { bookingId } = req.params;
  const updateFields = req.body;

  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID is required" });
  }

  try {
    const existingBooking = await EventBooking.findById(bookingId);

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update only the fields provided in the request body
    Object.keys(updateFields).forEach((key) => {
      existingBooking[key] = updateFields[key];
    });

    const updatedBooking = await existingBooking.save();

    return res.status(200).json({
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (err) {
    console.error("Error updating booking:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// USER
export const getBookingEventListToUser = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Please provide the userId" });
  }

  try {
    const bookings = await EventBooking.find({ userId })
      .populate("clubId", "name location")
      .populate("eventId", "title date")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User's event bookings fetched successfully",
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching user's bookings:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// CLUB
export const getBookingListOfEventToClub = async (req, res) => {
  const { eventId } = req.params;
  const { id, type } = req.user;

  if (!eventId) {
    return res.status(400).json({ message: "Please provide eventId" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventClubId = event.clubId?.toString();
    let isAuthorized = false;

    if (type === "owner") {
      const owner = await Owner.findById(id);
      if (owner?.clubs_owned?.some((club) => club.toString() === eventClubId)) {
        isAuthorized = true;
      }
    } else {
      const employee = await Employee.findById(id);
      if (employee?.club?.toString() === eventClubId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied for this event" });
    }

    const bookings = await EventBooking.find({ eventId })
      .populate("clubId", "name")
      .populate("eventId", "title date")
      .populate("userId", "name email mobile");

    return res.status(200).json({
      message: "Bookings fetched successfully",
      total: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const patchUpdateBookingByClub = async (req, res) => {
  const { bookingId } = req.params;
  const { id, type } = req.user; // logged in user (owner or employee)
  const updateData = req.body; // fields to patch

  console.log("----- update data -----", updateData);

  try {
    // Find booking
    const booking = await EventBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Find club for this booking
    const club = await Club.findById(booking?.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Authorization check
    let isAuthorized = false;

    if (type === "owner" && String(club?.owner) === String(id)) {
      isAuthorized = true;
    } else if (type !== "owner") {
      const employee = await Employee.findById(id);
      if (employee && String(employee?.club) === String(club?._id)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update booking with partial fields (PATCH)
    const updatedBooking = await EventBooking.findByIdAndUpdate(
      bookingId,
      { $set: updateData },
      { new: true } // return updated doc
    );

    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (err) {
    console.error("Error in patchUpdateBookingByClub:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lcklkIjoiNjg2ZmI3Mjg5MTI4Y2NlMDdmYTQ4ODFmIiwiZW1haWwiOiJyYWprYXJ0aWsxNTlAZ21haWwuY29tIiwiaWF0IjoxNzUzNjg3ODQ4fQ.0l1oA9I8FlH-lueuOjFes69EUra7GWM5bhWP3txXPFE

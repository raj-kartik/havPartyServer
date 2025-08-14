import DailyBooking from "../../models/Booking/DailyBooking.js";
import EventBooking from "../../models/Booking/EventBooking.js";
import { Event } from "../../models/Event/EventSchema.js";
import Club from "../../models/Partner/Club/clubSchema.js";
import User from "../../models/User/userSchema.js";
import Employee from "../../models/Partner/Employee.js";
import mongoose from "mongoose";
import Owner from "../../models/Owner/owner.js";

export const getListUserToOwner = async (req, res) => {
  const { type, id } = req.user;

  if (!id) {
    return res.status(400).json({
      message: "Invalid User ID",
      status: 400,
    });
  }

  if (type !== "owner" && type !== "manager") {
    return res.status(403).json({
      message: "Access denied",
      status: 403,
    });
  }

  try {
    let clubIds = [];

    if (type === "owner") {
      const clubs = await Club.find({ owner: id }).select("_id");
      clubIds = clubs.map((club) => club._id);
    } else if (type === "manager") {
      const employee = await Employee.findById(id).select("club");
      if (!employee || !employee.club) {
        return res.status(404).json({
          message: "No club assigned to this manager",
          status: 404,
        });
      }
      clubIds = [employee.club];
    }

    if (clubIds.length === 0) {
      return res.status(404).json({
        message: "No clubs found",
        status: 404,
      });
    }

    // Get events in these clubs
    const events = await Event.find({ clubId: { $in: clubIds } }).select("_id");
    const eventIds = events.map((event) => event._id);

    // Get bookings for those events/clubs
    const [eventBookings, dailyBookings] = await Promise.all([
      EventBooking.find({ eventId: { $in: eventIds } }).select("userId"),
      DailyBooking.find({ clubId: { $in: clubIds } }).select("userId"),
    ]);

    const allUserIds = [
      ...eventBookings.map((b) => b.userId?.toString()),
      ...dailyBookings.map((b) => b.userId?.toString()),
    ].filter(Boolean); // Remove null/undefined

    const uniqueUserIds = [...new Set(allUserIds)];

    // Fetch user details
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select(
      "name email mobile gender isAdult"
    );

    return res.status(200).json({
      message: "Users fetched successfully",
      status: 200,
      total: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Error in getListUserToOwner:", err);
    return res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

export const getUserDetailForClub = async (req, res) => {
  const { userId } = req.query;
  const { id, type } = req.user;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      status: 400,
    });
  }

  try {
    let clubIds = [];

    // Step 1: Determine allowed clubs based on role
    if (type === "owner") {
      const owner = await Owner.findById(id).select("clubs_owned");
      if (!owner || !owner.clubs_owned?.length) {
        return res.status(404).json({
          message: "No clubs found for this owner",
          status: 404,
        });
      }
      clubIds = owner.clubs_owned.map(c => c.toString());
    } else if (type === "manager" || type === "employee") {
      const employee = await Employee.findById(id).select("club");
      if (!employee || !employee.club) {
        return res.status(404).json({
          message: "No club assigned to this manager/employee",
          status: 404,
        });
      }
      clubIds = [employee.club.toString()];
    } else {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
      });
    }

    // Step 2: Get event bookings & populate event data
    const eventBookings = await EventBooking.find({
      userId,
      clubId: { $in: clubIds }
    })
      .populate({
        path: "eventId",
        match: { clubId: { $in: clubIds }, isDelete: false },
        select: "title"
      })
      .lean();

    const attendedEvents = eventBookings
      .filter(b => b.eventId) // keep only matched events
      .map(b => ({
        eventTitle: b.eventId.title,
        bookingTime: b.createdAt,
        numberOfPeople: b.numberOfPeople || 1
      }));

    // Step 3: Get daily bookings & populate club data
    const dailyBookings = await DailyBooking.find({
      userId,
      clubId: { $in: clubIds }
    })
      .populate({ path: "clubId", select: "name" })
      .lean();

    const dailyBookingDetails = dailyBookings.map(b => ({
      clubId: b.clubId?._id,
      clubName: b.clubId?.name,
      timing: b.timing,
      numOfCustomer: b.numOfCustomer,
      bookingStatus: b.bookingStatus,
      bookingType: b.bookingType
    }));

    // Step 4: Fetch user details
    const user = await User.findById(userId).select(
      "name email mobile gender isAdult"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    // Step 5: Return data
    return res.status(200).json({
      message: "User details fetched successfully",
      status: 200,
      data: {
        user,
        attendedEvents,
        dailyBookings: dailyBookingDetails
      }
    });
  } catch (err) {
    console.error("Error in getUserDetailForClub:", err);
    return res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmZiNzI4OTEyOGNjZTA3ZmE0ODgxZiIsInR5cGUiOiJvd25lciIsImlhdCI6MTc1NTA4NDIxNH0.wK0teA_OjG_WGosSaOdseRg5o7SYt_4y4l1JUYCx35o

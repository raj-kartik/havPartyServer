import mongoose from "mongoose";
import Owner from "../../models/Owner/owner.js";
import ClubReach from "../../models/Partner/Club/clubReach.js";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";
import DailyRegistration from "../../models/Partner/Club/DailyRegistration.js";
import Employee from "../../models/Partner/Employee.js";
import Partner from "../../models/Partner/Employee.js";
import EventBooking from "../../models/Booking/EventBooking.js";
import { getS3ObjectUrl } from "../../utils/awsFunction.js";
import { Event } from "../../models/Event/EventSchema.js";
// Controller to create a new club
// This function assumes that the owner is an Owner and the manager is a Partner
export const createClub = async (req, res) => {
  const {
    id, // Owner ID
    name,
    manager,
    location,
    photos,
    menu,
    price,
    pincode,
    coordinates,
    license,
    openTiming,
    closeTiming,
    mobile,
  } = req.body;

  // Validate required fields
  if (!name) return res.status(400).json({ message: "Club name is required." });
  if (!id) return res.status(400).json({ message: "Owner ID is required." });
  if (!manager)
    return res.status(400).json({ message: "Manager name is required." });
  // if (!license)
  //   return res.status(400).json({ message: "License is required." });
  if (!location?.address1 || !location?.city || !location?.state) {
    return res
      .status(400)
      .json({ message: "Address, City, and State are required." });
  }
  if (!pincode)
    return res.status(400).json({ message: "Pincode is required." });

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ message: "Valid coordinates are required." });
  }

  if (!openTiming || !closeTiming) {
    return res
      .status(400)
      .json({ message: "Open and close timings are required." });
  }

  try {
    // Check for duplicate club
    const existingClub = await Club.findOne({
      name,
      "location.address1": location.address1,
    });
    if (existingClub) {
      return res
        .status(409)
        .json({ message: "Club with this name and address already exists." });
    }

    // Validate owner
    const owner = await Owner.findById(id);
    if (!owner) return res.status(404).json({ message: "Owner not found." });

    // Create new club
    const club = new Club({
      name,
      manager,
      license,
      openTiming,
      closeTiming,
      mobile: mobile || [],
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
      owner: id,
      // offers: offers, // array of Offer ObjectIds
    });

    // Save club
    await club.save();

    // Add club to owner's clubs_owned list
    owner.clubs_owned.push(club._id);
    await owner.save();

    return res.status(201).json({
      message: "Club created successfully.",
      state: 201,
      club,
    });
  } catch (err) {
    console.error("Error creating club:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// get club
export const getAllClub = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Try finding user as Owner
    const owner = await Owner.findById(userId);

    if (owner) {
      // If Owner found, return all clubs owned by them
      const clubs = await Club.find({ owner: userId, isDelete: { $ne: true } });
      return res.status(200).json({ clubs });
    }

    // Try finding user as Employee
    const employee = await Employee.findById(userId);

    if (employee) {
      const club = await Club.findById(employee.club);
      return res.status(200).json({ clubs: club ? [club] : [] });
    }

    return res.status(404).json({ message: "User not found." });
  } catch (err) {
    console.error("Error fetching clubs:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const ownerClubDetails = async (req, res) => {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({ message: "Club ID is required." });
  }

  try {
    const club = await Club.findById(clubId).populate("owner", "name email");

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Convert club photo keys to signed URLs
    const photoKeys = club.photos || [];
    const signedPhotoUrls = await Promise.all(
      photoKeys.map((key) => getS3ObjectUrl(key))
    );

    // Replace the photo keys with signed URLs (or add a new field if you want to keep both)
    club.photos = signedPhotoUrls;

    // Get club reach analytics
    const clubReach = await ClubReach.findOne({ clubId });

    // Get employees for this club
    const employees = await Partner.find({ club: clubId })
      .select("name email mobile position profilePicture club")
      .populate("club", "name");

    const manager = employees.filter(
      (emp) => emp.position?.toLowerCase() === "manager"
    );

    // Get all offers for this club with full detail and club name
    const offers = await Offer.find({ club: clubId, isDelete: false }).populate(
      "club",
      "name"
    );

    // ✅ Get all events for the club
    const rawEvents = await Event.find({ clubId, isDelete: false }).populate(
      "clubId",
      "name"
    );

    const events = await Promise.all(
      rawEvents.map(async (event) => {
        const signedImages = await Promise.all(
          (event.images || []).map((key) => getS3ObjectUrl(key))
        );
        return {
          ...event.toObject(),
          images: signedImages,
        };
      })
    );

    return res.status(200).json({
      message: "Club details fetched successfully.",
      status: 200,
      club,
      clubReach,
      employees,
      manager,
      offers,
      events,
    });
  } catch (err) {
    console.error("Error fetching club details:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to update the manager of a specific club
// This function assumes that the manager is a Partner and the owner is an Owner
export const updateManager = async (req, res) => {
  const { clubId, employeeId, ownerId } = req.body;

  // Validate required fields
  if (!clubId || !employeeId || !ownerId) {
    return res.status(400).json({
      message: "Club ID, Employee ID, and Owner ID are all required.",
    });
  }

  try {
    // Find the club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Find the owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // Verify that the club belongs to the owner
    const ownsClub = owner.clubs_owned.some(
      (ownedClubId) => ownedClubId.toString() === clubId
    );

    if (!ownsClub) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this club." });
    }

    // Find the manager
    const manager = await Partner.findById(employeeId);
    if (!manager) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Update manager
    club.manager = employeeId;
    await club.save();

    return res.status(200).json({
      message: "Employee updated successfully.",
      club,
    });
  } catch (err) {
    console.error("Error updating Employee:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to add an offer to a specific club
// This function assumes that the offer is added by a Partner and the club belongs to an Owner
export const addOfferToClub = async (req, res) => {
  const { clubId, title, description, discount, validFrom, validUntil, terms } =
    req.body;

  // Validate required fields
  if (!clubId) {
    return res.status(400).json({ message: "Club ID is required." });
  }

  if (!title || !description || !discount || !validFrom || !validUntil) {
    return res.status(400).json({ message: "All offer fields are required." });
  }

  try {
    // Find the club by ID only if it is not deleted
    const club = await Club.findOne({ _id: clubId, isDelete: { $ne: true } });
    if (!club) {
      return res
        .status(404)
        .json({ message: "Club not found or has been deleted." });
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

// Controller to handle booking a club
// This function assumes that the booking is made by a user and the club has a bookings array
export const bookingClub = async (req, res) => {
  const { userId, clubId, bookingDate, bookingTime, numberOfPeople } = req.body;

  // Validate required fields
  if (!userId || !clubId || !bookingDate || !bookingTime) {
    return res
      .status(400)
      .json({ message: "All booking fields are required." });
  }

  if (numberOfPeople <= 0) {
    return res
      .status(400)
      .json({ message: "Number of people must be greater than zero." });
  }

  try {
    // Find the club by ID
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Prevent booking if the club is marked as deleted
    if (club.isDelete) {
      return res
        .status(403)
        .json({ message: "This club is no longer available for booking." });
    }

    // Create the new booking
    const newBooking = {
      userId,
      bookingDate,
      bookingTime,
      numberOfPeople,
      clubId,
    };

    // Add the booking to the club's bookings array
    club.bookings.push(newBooking);

    // Save the updated club document
    await club.save();

    res.status(201).json({
      message: "Booking created successfully.",
      state: 201,
      club,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ------------------- CLUBS REACH -------------------

export const updateDeleteClub = async (req, res) => {
  const { clubId } = req.params;
  const { id } = req.user;

  if (!clubId) {
    return res.status(400).json({ message: "Club ID is required." });
  }

  try {
    // Find the club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Find the owner
    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // Verify that the club belongs to the owner
    const ownsClub = owner.clubs_owned.some(
      (ownedClubId) => ownedClubId.toString() === clubId
    );

    if (!ownsClub) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update or delete this club." });
    }

    // Update the isDelete field to true
    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { isDelete: true },
      { new: true }
    );

    return res.status(200).json({
      message: "Club deleted successfully.",
      updatedClub,
    });
  } catch (err) {
    console.error("Error updating or deleting club:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getClubStats = async (req, res) => {
  try {
    let { clubId, year, month } = req.query;
    const { type, id } = req.user;

    const currentDate = new Date();
    year = parseInt(year) || currentDate.getFullYear();
    month = parseInt(month) || currentDate.getMonth() + 1;

    // Determine clubId
    if (!clubId) {
      if (type === "owner") {
        const owner = await Owner.findById(id);
        if (!owner || !owner.clubs_owned.length) {
          return res
            .status(404)
            .json({ message: "Owner or owned clubs not found" });
        }
        clubId = owner.clubs_owned[0]; // First club owned
      } else if (type === "manager") {
        const employee = await Employee.findById(id);
        if (!employee || !employee.club) {
          return res
            .status(404)
            .json({ message: "Employee or assigned club not found" });
        }
        clubId = employee.club;
      } else {
        return res.status(400).json({ message: "Invalid user type" });
      }
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubId);

    // ----------------------
    // Monthly Bookings
    // ----------------------
    const monthlyBookings = await EventBooking.aggregate([
      {
        $match: {
          clubId: clubObjectId,
          $expr: { $eq: [{ $year: "$date" }, year] },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          bookingCount: { $sum: 1 },
          totalPeople: { $sum: "$numberOfPeople" },
        },
      },
    ]);

    // ----------------------
    // Monthly Registrations
    // ----------------------
    const monthlyRegistrations = await DailyRegistration.aggregate([
      {
        $match: {
          clubId: clubObjectId,
          year,
        },
      },
      {
        $group: {
          _id: { month: "$month" },
          totalRegistrations: { $sum: "$count" },
        },
      },
    ]);

    // ----------------------
    // Weekly Bookings
    // ----------------------
    const weeklyBookings = await EventBooking.aggregate([
      {
        $match: {
          clubId: clubObjectId,
          $expr: { $eq: [{ $year: "$date" }, year] },
        },
      },
      {
        $project: {
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
          numberOfPeople: 1,
        },
      },
      {
        $addFields: {
          week: {
            $switch: {
              branches: [
                { case: { $lte: ["$day", 7] }, then: 1 },
                { case: { $lte: ["$day", 14] }, then: 2 },
                { case: { $lte: ["$day", 21] }, then: 3 },
                { case: { $lte: ["$day", 28] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $group: {
          _id: { month: "$month", week: "$week" },
          bookingCount: { $sum: 1 },
          totalPeople: { $sum: "$numberOfPeople" },
        },
      },
    ]);

    // ----------------------
    // Weekly Registrations
    // ----------------------
    const weeklyRegistrations = await DailyRegistration.aggregate([
      {
        $match: {
          clubId: clubObjectId,
          year,
        },
      },
      {
        $addFields: {
          week: {
            $switch: {
              branches: [
                { case: { $lte: ["$day", 7] }, then: 1 },
                { case: { $lte: ["$day", 14] }, then: 2 },
                { case: { $lte: ["$day", 21] }, then: 3 },
                { case: { $lte: ["$day", 28] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $group: {
          _id: { month: "$month", week: "$week" },
          totalRegistrations: { $sum: "$count" },
        },
      },
    ]);

    // ----------------------
    // Helpers
    // ----------------------
    const fillMonthlyData = (dataArray, key) =>
      Array.from({ length: 12 }, (_, index) => {
        const found = dataArray.find((d) => d._id.month === index + 1);
        return {
          month: index + 1,
          [key]: found?.[key] || 0,
        };
      });

    const getWeeklyStructure = () => ({
      week1: 0,
      week2: 0,
      week3: 0,
      week4: 0,
      week5: 0,
    });

    const fillWeeklyData = (weeklyData, key) =>
      Array.from({ length: 12 }, (_, monthIndex) => {
        const result = getWeeklyStructure();
        for (let week = 1; week <= 5; week++) {
          const match = weeklyData.find(
            (d) => d._id.month === monthIndex + 1 && d._id.week === week
          );
          result[`week${week}`] = match?.[key] || 0;
        }
        return {
          month: monthIndex + 1,
          ...result,
        };
      });

    // ----------------------
    // Final Structured Data
    // ----------------------
    const bookings = fillMonthlyData(monthlyBookings, "bookingCount").map(
      (b, i) => ({
        ...b,
        totalPeople:
          monthlyBookings.find((x) => x._id.month === i + 1)?.totalPeople || 0,
      })
    );

    const registrations = fillMonthlyData(
      monthlyRegistrations,
      "totalRegistrations"
    );

    const weeklyBookingStats = fillWeeklyData(weeklyBookings, "bookingCount");
    const weeklyPeopleStats = fillWeeklyData(weeklyBookings, "totalPeople");
    const weeklyRegistrationStats = fillWeeklyData(
      weeklyRegistrations,
      "totalRegistrations"
    );

    const totalBookings = bookings.reduce((sum, b) => sum + b.bookingCount, 0);
    const totalPeople = bookings.reduce((sum, b) => sum + b.totalPeople, 0);
    const totalRegistrations = registrations.reduce(
      (sum, r) => sum + r.totalRegistrations,
      0
    );

    return res.status(200).json({
      clubId,
      year,
      month,
      totalBookings,
      totalPeople,
      totalRegistrations,
      monthly: {
        bookings,
        registrations,
      },
      weekly: {
        bookings: weeklyBookingStats,
        totalPeople: weeklyPeopleStats,
        registrations: weeklyRegistrationStats,
      },
    });
  } catch (error) {
    console.error("Error in getClubStats:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

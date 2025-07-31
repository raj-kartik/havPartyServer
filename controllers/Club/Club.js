import Owner from "../../models/Owner/owner.js";
import ClubReach from "../../models/Partner/Club/clubReach.js";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";
import Partner from "../../models/Partner/Employee.js";
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
  // const { id} = req.user;
  if (!clubId) {
    return res.status(400).json({ message: "Club ID is required." });
  }

  try {
    // Get club with owner info
    const club = await Club.findById(clubId).populate("owner", "name email");

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Get club reach analytics
    const clubReach = await ClubReach.findOne({ clubId });

    // Get employees for this club
    const employees = await Partner.find({ club: clubId })
      .select("name email mobile position profilePicture club")
      .populate("club", "name");

    // Get the partner manager(s)
    const manager = employees.filter(
      (emp) => emp.position?.toLowerCase() === "manager"
    );

    // Get all offers for this club with full detail and club name
    const offers = await Offer.find({ club: clubId }).populate("club", "name");

    return res.status(200).json({
      message: "Club details fetched successfully.",
      status: 200,
      club,
      clubReach,
      employees,
      manager,
      offers, // contains full offer details including populated club name
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
  const { clubId, title, description, discount, validFrom, validUntil, terms } = req.body;

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
      return res.status(404).json({ message: "Club not found or has been deleted." });
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
    return res.status(400).json({ message: "All booking fields are required." });
  }

  if (numberOfPeople <= 0) {
    return res.status(400).json({ message: "Number of people must be greater than zero." });
  }

  try {
    // Find the club by ID
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Prevent booking if the club is marked as deleted
    if (club.isDelete) {
      return res.status(403).json({ message: "This club is no longer available for booking." });
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
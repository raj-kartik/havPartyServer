import EventBooking from "../../models/Booking/EventBooking.js";
import { Event } from "../../models/Event/EventSchema.js";
import Owner from "../../models/Owner/owner.js";
import Club from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";
import User from "../../models/User/userSchema.js";
import { getS3ObjectUrl } from "../../utils/awsFunction.js";

export const getAllEvents = async (req, res) => {
  const { id } = req.user;

  try {
    // Check if user is Owner
    const owner = await Owner.findById(id).populate("clubs_owned", "_id name");

    let events = [];
    let role = "";

    if (owner && owner.clubs_owned.length > 0) {
      const clubIds = owner.clubs_owned.map((club) => club._id);

      events = await Event.find({
        clubId: { $in: clubIds },
        isDelete: false,
      }).populate("clubId", "name");

      role = "owner";
    } else {
      // Try Employee
      const employee = await Employee.findById(id).populate("club", "_id name");

      if (!employee) {
        return res
          .status(404)
          .json({ message: "User not found as Owner or Employee" });
      }

      if (employee.position !== "Manager") {
        return res.status(403).json({
          message: "Only Managers can fetch events",
        });
      }

      events = await Event.find({
        clubId: employee.club._id,
        isDelete: false,
      }).populate("clubId", "name");

      role = "employee";
    }

    // Generate signed URL for first image of each event
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();

        if (eventObj.images && eventObj.images.length > 0) {
          // console.log("---- seventObj.images[0] -----", eventObj.images[0]);
          try {
            const signedUrl = await getS3ObjectUrl(eventObj.images[0]);

            eventObj.imageUrl = signedUrl;
            // console.log("---- eventObj.imageUrl -----", eventObj.imageUrl);
          } catch (err) {
            console.error("Error generating image URL", err);
            eventObj.imageUrl = null;
          }
        } else {
          eventObj.imageUrl = null;
        }

        return eventObj;
      })
    );

    return res.status(200).json({
      role,
      events: enrichedEvents,
      count: enrichedEvents.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getEventDetails = async (req, res) => {
  const { eventId } = req.params;
  const { id, type } = req.user;
  const { clubId } = req.query;

  try {
    // Check if user is authorized (Owner or Manager)
    let isAuthorized = false;

    if (type === "owner") {
      const owner = await Owner.findById(id);
      if (owner) isAuthorized = true;
    } else if (type === "manager") {
      const employee = await Employee.findById(id);
      if (employee && employee.position.toLowerCase() === "manager")
        isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    // Validate event existence in club
    const club = await Club.findById(clubId);
    if (!club || !club.events.includes(eventId)) {
      return res.status(404).json({ message: "Event not found in this club" });
    }

    // Get event details
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Generate signed image URLs
    const eventObj = event.toObject();
    if (eventObj.images && eventObj.images.length > 0) {
      try {
        const signedImageUrls = await Promise.all(
          eventObj.images.map(async (key) => {
            try {
              return await getS3ObjectUrl(key);
            } catch (err) {
              console.error("Error generating signed URL for image:", key);
              return null;
            }
          })
        );
        eventObj.signedImages = signedImageUrls;
      } catch (error) {
        console.error("Failed to generate signed URLs for images", error);
        eventObj.signedImages = [];
      }
    } else {
      eventObj.signedImages = [];
    }

    // Get all event bookings
    const bookings = await EventBooking.find({ eventId });

    // Enrich each booking with user details
    const bookingsWithUser = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId).select("-password");
        return {
          ...booking.toObject(),
          user,
        };
      })
    );

    return res.status(200).json({
      event: eventObj,
      bookings: bookingsWithUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const postCreateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      limits,
      clubId,
      dates,
      instruction,
      images,
      organizer,
      createdBy,
      createdByModel,
    } = req.body;

    // Validate creator identity
    if (createdByModel.toLowerCase() === "owner") {
      const owner = await Owner.findById(createdBy);
      if (!owner) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
    } else if (createdByModel === "employee") {
      const employee = await Employee.findById(createdBy);
      if (!employee || employee.position.toLowerCase() !== "manager") {
        return res
          .status(403)
          .json({ message: "Only Managers can create events." });
      }
    } else {
      return res.status(400).json({ message: "Invalid creator type" });
    }

    // Create event with updated structure
    const event = new Event({
      title,
      description,
      limits,
      clubId,
      dates, // includes { date, entry: [{type, price}], timeSlots }
      instruction: Array.isArray(instruction) ? instruction : [instruction], // normalize to array
      images,
      organizer,
      createdBy,
      createdByModel,
    });

    await event.save();

    await Club.findByIdAndUpdate(
      clubId,
      { $push: { events: event._id } },
      { new: true, useFindAndModify: false }
    );

    res
      .status(200)
      .json({ message: "Event created successfully", event, status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const user = req.user;

  // Ensure user is authenticated and has the correct role
  if (!user || (user.type !== "owner" && user.type !== "manager")) {
    return res.status(403).json({
      message: "Unauthorized. Only owners or managers can delete events.",
    });
  }

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // If already deleted
    if (event.isDelete) {
      return res.status(400).json({ message: "Event is already deleted." });
    }

    // Soft delete
    event.isDelete = true;
    await event.save();

    return res.status(200).json({
      message: "Event deleted successfully (soft delete).",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

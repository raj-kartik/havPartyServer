import { Event } from "../../models/Event/Event.model.js";
import Owner from "../../models/Owner/owner.js";
import Employee from "../../models/Partner/Employee.js";
export const getAllEvents = async (req, res) => {
  const { ownerId, partnerId } = req.query;

  try {
    if (!ownerId && !partnerId) {
      return res.status(400).json({
        message: "Either ownerId or partnerId is required",
      });
    }

    let clubIds = [];

    if (ownerId) {
      const owner = await Owner.findById(ownerId).populate(
        "clubs_owned",
        "_id name"
      );
      if (!owner || !owner.clubs_owned.length) {
        return res
          .status(404)
          .json({ message: "Owner not found or no clubs found" });
      }
      clubIds = owner.clubs_owned.map((club) => club._id);
    }

    if (partnerId) {
      const employee = await Employee.findById(partnerId).populate(
        "club",
        "_id name position"
      );
      if (!employee || !employee.club) {
        return res
          .status(404)
          .json({ message: "Employee not found or not assigned to a club" });
      }

      if (employee.position !== "Manager") {
        return res
          .status(403)
          .json({ message: "Only Managers can fetch events" });
      }

      // Employee club can be one or an array
      clubIds = [employee.club._id];
    }

    console.log("--- clubIds ----", clubIds);

    const events = await Event.find({ clubId: { $in: clubIds } }).populate(
      "clubId",
      "name"
    );

    return res.status(200).json({
      events,
      count: events.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const getEventDetails = async (req, res) => {};

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
    if (createdByModel === "Owner") {
      const owner = await Owner.findById(createdBy);
      if (!owner) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
    } else if (createdByModel === "Employee") {
      const employee = await Employee.findById(createdBy);
      if (!employee || employee.position !== "Manager") {
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

    res
      .status(200)
      .json({ message: "Event created successfully", event, status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

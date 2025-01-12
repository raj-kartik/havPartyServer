import Club from "../../../models/Partner/Club/clubSchema.js";
import Event from "../../../models/Partner/Event/Event.model.js";
export const createEvent = async (req, res) => {
    const { clubId, title, description, instructions, photos, dates, timings } = req.body;
  
    try {
      // Validate required fields
      if (!clubId) return res.status(400).json({ message: "Club ID is required" });
      if (!title) return res.status(400).json({ message: "Event title is required" });
      if (!description) return res.status(400).json({ message: "Event description is required" });
      if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ message: "At least one event date is required" });
      }
      if (!timings || !Array.isArray(timings) || timings.length === 0) {
        return res.status(400).json({ message: "At least one event timing is required" });
      }
  
      // Check if the club exists
      const club = await Club.findById(clubId);
      if (!club) return res.status(404).json({ message: "Club not found" });
  
      // Construct the event object
      const eventData = {
        clubId,
        title,
        description,
        instruction: instructions || [], // Default to empty array if not provided
        images: photos || [], // Default to empty array if not provided
        dates: dates.map((date) => ({
          date: new Date(date),
          timeSlots: timings.map((timing) => ({
            startTime: timing.startTime,
            endTime: timing.endTime,
          })),
        })),
      };
  
      // Create and save the event
      const newEvent = new Event(eventData);
      await newEvent.save();
  
      return res.status(201).json({
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      return res.status(500).json({
        message: "Server error. Please try again later.",
      });
    }
  };
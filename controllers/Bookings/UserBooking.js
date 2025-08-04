import EventBooking from "../../models/Booking/EventBooking.js";
import { Event } from "../../models/Event/EventSchema.js";
import { Offer } from "../../models/Partner/Club/clubSchema.js";

// offer
export const getAllOfferToUser = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    const offers = await Offer.find({
      isDelete: false,
      validUntil: { $gte: today }, // only valid today or in future
    })
      .sort({ validFrom: 1 }) // sort by nearest upcoming
      .populate("club", "name location photos") // if you want to show club details
      .lean();

    res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOfferDetailsToUser = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required",
      });
    }

    const offer = await Offer.findOne({
      _id: offerId,
      isDelete: false,
    })
      .populate("club", "name location photos")
      .lean();

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or has been deleted",
      });
    }

    res.status(200).json({
      success: true,
      offer,
    });
  } catch (err) {
    console.error("Error fetching offer details:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// events
export const getAllEventsForUser = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allEvents = await Event.find({
      isDelete: false,
    })
      .populate("clubId", "name location photos")
      .sort({ "dates.date": 1 })
      .select("title description clubId dates images")
      .lean();

    // Filter to include only events that have at least one date >= today
    const filteredEvents = allEvents
      .map((event) => {
        const validDates = event.dates.filter((d) => {
          const dateOnly = new Date(d.date);
          dateOnly.setHours(0, 0, 0, 0);
          return dateOnly >= today;
        });

        // If no upcoming/today dates, skip the event
        if (validDates.length === 0) return null;

        return {
          ...event,
          dates: validDates, // Only show future/today dates
        };
      })
      .filter((e) => e !== null);

    res.status(200).json({
      status: 200,
      count: filteredEvents.length,
      events: filteredEvents,
    });
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getEventDetailsForUser = async (req, res) => {

    // console.log("Fetching event details for user...");
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
      isDelete: false,
    })
      .populate("clubId", "name location photos")
      .lean();

    if (!event) {
      return res.status(404).json({
        status: 404,
        message: "Event not found or has been deleted",
      });
    }

    res.status(200).json({
      status: 200,
      event,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// daily resgistration
export const getAllClubsForUser = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clubs = await Club.find({ isDelete: false }).lean();

    const enrichedClubs = await Promise.all(
      clubs.map(async (club) => {
        const [offerCount, eventCount] = await Promise.all([
          Offer.countDocuments({
            club: club._id,
            isDelete: false,
            validUntil: { $gte: today },
          }),
          Event.countDocuments({
            clubId: club._id,
            isDelete: false,
            "dates.date": { $gte: today },
          }),
        ]);

        // Calculate distance if user location is provided
        let distance = null;
        if (lat && lng && club.location?.coordinates?.coordinates?.length === 2) {
          const [clubLng, clubLat] = club.location.coordinates.coordinates;
          const toRad = (val) => (val * Math.PI) / 180;

          const earthRadiusKm = 6371;
          const dLat = toRad(clubLat - lat);
          const dLng = toRad(clubLng - lng);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) *
              Math.cos(toRad(clubLat)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = +(earthRadiusKm * c).toFixed(2); // in KM
        }

        return {
          _id: club._id,
          name: club.name,
          photos: club.photos,
          mobile: club.mobile,
          location: club.location,
          openTiming: club.openTiming,
          closeTiming: club.closeTiming,
          activeOfferCount: offerCount,
          upcomingEventCount: eventCount,
          distanceInKm: distance,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedClubs.length,
      clubs: enrichedClubs,
    });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getClubDetailsForUser = async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({ success: false, message: "Club ID is required" });
    }

    const club = await Club.findOne({ _id: clubId, isDelete: false })
      .select("name photos location mobile license")
      .lean();

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offers = await Offer.find({
      club: clubId,
      isDelete: false,
      validUntil: { $gte: today },
    })
      .select("title description discount validFrom validUntil terms")
      .lean();

    const events = await Event.find({
      clubId,
      isDelete: false,
      "dates.date": { $gte: today },
    })
      .select("title description images dates")
      .sort({ "dates.date": 1 })
      .lean();

    res.status(200).json({
      success: true,
      club,
      offers,
      upcomingEvents: events,
    });
  } catch (error) {
    console.error("Error fetching club details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

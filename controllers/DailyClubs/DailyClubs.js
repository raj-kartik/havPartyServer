import { Event } from "../../models/Event/EventSchema.js";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";

export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({
      isDelete: false,
    })
      .select("name location photos openTiming closeTiming price likes offers")
      .populate({
        path: "offers",
        match: {
          isDelete: false,
          isEnable: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() },
        },
        select: "title description discount validFrom validUntil",
      });

    const formattedClubs = clubs.map((club) => ({
      _id: club._id,
      name: club.name,
      location: club.location,
      photos: club.photos,
      openTiming: club.openTiming,
      closeTiming: club.closeTiming,
      price: club.price,
      likesCount: club.likes.length,
      offers: club.offers,
    }));

    return res.status(200).json({ clubs: formattedClubs, status:200 });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getClubDetails = async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }

    // 1. Fetch club details
    const club = await Club.findOne({
      _id: clubId,
      isDelete: false,
    }).populate({
      path: "offers",
      match: {
        isDelete: false,
        isEnable: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      },
      select: "title description discount validFrom validUntil terms",
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // 2. Fetch upcoming events
    const events = await Event.find({
      clubId,
      isDelete: false,
      "dates.date": { $gte: new Date() },
    }).select(
      "title description dates images organizer createdBy createdByModel"
    );

    return res.status(200).json({
      status: 200,
      club: {
        _id: club._id,
        name: club.name,
        location: club.location,
        openTiming: club.openTiming,
        closeTiming: club.closeTiming,
        photos: club.photos,
        price: club.price,
        mobile: club.mobile,
        maxClubCapacity: club.maxClubCapacity,
        clubCapacity: club.clubCapacity,
        license: club.license,
        menu: club.menu,
        likesCount: club.likes.length,
        offers: club.offers,
      },
      events,
    });
  } catch (error) {
    console.error("Error fetching club details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

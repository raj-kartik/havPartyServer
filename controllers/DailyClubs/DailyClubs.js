import { Event } from "../../models/Event/EventSchema.js";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";
import { getS3ObjectUrl } from "../../utils/awsFunction.js";

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

    // Generate signed URL for first photo only
    const formattedClubs = await Promise.all(
      clubs.map(async (club) => {
        let firstPhotoUrl = null;
        if (club.photos && club.photos.length > 0) {
          try {
            firstPhotoUrl = await getS3ObjectUrl(club.photos[0]);
          } catch (err) {
            console.error(`Error generating signed URL for ${club.name}:`, err);
          }
        }

        return {
          _id: club._id,
          name: club.name,
          location: club.location,
          photo: firstPhotoUrl, // only first photo
          openTiming: club.openTiming,
          closeTiming: club.closeTiming,
          price: club.price,
          likesCount: club.likes.length,
          offers: club.offers,
        };
      })
    );

    return res.status(200).json({ clubs: formattedClubs, status: 200 });
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

    // Helper to map keys to signed URLs
    const mapImagesToUrls = async (images) =>
      Promise.all(images.map(async (img) => await getS3ObjectUrl(img)));

    // Convert club photos to signed URLs
    const clubPhotos = club.photos?.length
      ? await mapImagesToUrls(club.photos)
      : [];

    // Convert event images to signed URLs & attach clubId object
    const eventsWithSignedUrls = await Promise.all(
      events.map(async (event) => ({
        ...event.toObject(),
        images: event.images?.length
          ? await mapImagesToUrls(event.images)
          : [],
        clubId: {
          clubId: club._id,
          name: club.name,
          location: club.location,
          photos: clubPhotos,
        },
      }))
    );

    return res.status(200).json({
      status: 200,
      club: {
        _id: club._id,
        name: club.name,
        location: club.location,
        openTiming: club.openTiming,
        closeTiming: club.closeTiming,
        photos: clubPhotos,
        price: club.price,
        mobile: club.mobile,
        maxClubCapacity: club.maxClubCapacity,
        clubCapacity: club.clubCapacity,
        license: club.license,
        menu: club.menu, // menu images can be signed the same way if needed
        likesCount: club.likes?.length || 0,
        offers: club.offers,
      },
      events: eventsWithSignedUrls,
    });
  } catch (error) {
    console.error("Error fetching club details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

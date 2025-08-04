import { Offer } from "../../models/Partner/Club/clubSchema.js";

export const UserClubOfferByViv = async () => {};

// offer list
export const getCurrentOffers = async (req, res) => {
  try {
    const currentDate = new Date();

    // console.log("---- current date -----", currentDate);
    const offers = await Offer.find({
      isDelete: false,
      isEnable: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
    }).populate("club", "name location photos"); // populate club if needed

    // console.log("Current offers:", offers);

    res.status(200).json({ status: 200, offers });
  } catch (error) {
    console.error("Error fetching current offers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// offer details
export const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!offerId) {
      return res.status(400).json({ message: "Offer ID is required." });
    }

    const offer = await Offer.findOne({
      _id: offerId,
      isDelete: false,
    }).populate("club", "name location photos");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    return res.status(200).json({ offer, status: 200 });
  } catch (error) {
    console.error("Error getting offer by ID:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

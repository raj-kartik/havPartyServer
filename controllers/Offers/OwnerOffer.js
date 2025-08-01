import mongoose from "mongoose";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";
import { validateRequiredFields } from "../../utils/validRequirements.js";
import Owner from "../../models/Owner/owner.js";

export const OwnerClubOfferByViv = async (req, res) => {};

export const OfferCreatedByClubers = async (req, res) => {
  try {
    const { clubId, offerDetails, ownerId, managerId } = req.body;

    // Validate top-level fields
    const missingTopFields = validateRequiredFields(["clubId"], req.body);
    if (missingTopFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingTopFields.join(", ")}`,
      });
    }

    // Validate identity
    if (!ownerId && !managerId) {
      return res
        .status(400)
        .json({ message: "Owner ID or Manager ID is required." });
    }

    // Validate offer details
    const missingOfferFields = validateRequiredFields(
      [
        "offerDetails.title",
        "offerDetails.description",
        "offerDetails.discount",
        "offerDetails.validFrom",
        "offerDetails.validUntil",
      ],
      req.body
    );
    if (missingOfferFields.length) {
      return res.status(400).json({
        message: `Missing offer details: ${missingOfferFields.join(", ")}`,
      });
    }

    // Fetch and verify club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Ownership and manager validation
    if (ownerId && club.owner.toString() === ownerId) {
      // Authorized
    } else if (managerId) {
      const manager = await Employee.findById(managerId);

      if (!manager || manager.position?.toLowerCase() !== "manager") {
        return res
          .status(404)
          .json({ message: "Manager not found or invalid." });
      }

      if (manager.club.toString() !== clubId) {
        return res
          .status(403)
          .json({ message: "Manager does not belong to this club." });
      }
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to create offer for this club." });
    }

    // Create offer
    const newOffer = await Offer.create({
      ...offerDetails,
      club: clubId,
    });

    // Link to club
    club.offers.push(newOffer._id);
    await club.save();

    return res.status(201).json({
      message: "Offer created successfully.",
      status: 200,
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getOffersByClub = async (req, res) => {
  try {
    const { id } = req.user; // Authenticated user ID

    const owner = await Owner.findById(id);
    const employee = await Employee.findById(id);

    // If the user is an owner
    if (owner) {
      const clubs = await Club.find({ owner: id }).populate({
        path: "offers",
        match: { isDelete: false }, // ✅ Exclude deleted offers
      });

      if (!clubs || clubs.length === 0) {
        return res.status(404).json({ message: "No clubs found for this owner." });
      }

      const allOffers = clubs.flatMap((club) =>
        club.offers.map((offer) => ({
          ...offer.toObject(),
          clubName: club.name,
          clubId: club._id,
        }))
      );

      return res.status(200).json({
        message: "Offers retrieved successfully.",
        data: allOffers,
      });
    }

    // If the user is an employee
    if (employee) {
      const club = await Club.findOne({ employees: id }).populate({
        path: "offers",
        match: { isDelete: false }, // ✅ Exclude deleted offers
      });

      if (!club) {
        return res.status(404).json({ message: "No club found for this employee." });
      }

      const offers = club.offers.map((offer) => ({
        ...offer.toObject(),
        clubName: club.name,
        clubId: club._id,
      }));

      return res.status(200).json({
        message: "Offers retrieved successfully.",
        data: offers,
      });
    }

    return res.status(403).json({ message: "Unauthorized user role." });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const putDeleteOffer = async (req, res) => {
  const { offerId, isDelete } = req.body;

  if (!offerId || typeof isDelete !== "boolean") {
    return res
      .status(400)
      .json({ message: "offerId and isDelete(boolean) are required" });
  }

  try {
    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { isDelete },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: `Offer ${isDelete ? "deleted" : "restored"} successfully`,
      offer,
      status: 200,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updateData = req.body;

    if (!offerId) {
      return res.status(400).json({ message: "Offer ID is required." });
    }

    const offer = await Offer.findById(offerId);

    if (!offer || offer.isDelete) {
      return res.status(404).json({ message: "Offer not found." });
    }

    // Update only provided fields
    Object.keys(updateData).forEach((key) => {
      offer[key] = updateData[key];
    });

    const updatedOffer = await offer.save();

    return res.status(200).json({
      message: "Offer updated successfully.",
      data: updatedOffer,
      status:200
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const OwnerOfferDetails = async (res, req) => {};

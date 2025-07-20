import mongoose from "mongoose";
import Club, { Offer } from "../../models/Partner/Club/clubSchema.js";
import Employee from "../../models/Partner/Employee.js";

export const OwnerClubOfferByViv = async (req, res) => {};

export const OfferCreatedByClubers = async (req, res) => {
  try {
    const { clubId, offerDetails, ownerId, managerId } = req.body;

    // Validate required fields
    if (!clubId) {
      return res.status(400).json({
        message: "Club ID is required.",
      });
    }

    if (!ownerId && !managerId) {
      return res.status(400).json({
        message: "Owner ID or Manager ID is required.",
      });
    }

    if (!offerDetails || !offerDetails.title || !offerDetails.description || !offerDetails.discount || !offerDetails.validFrom || !offerDetails.validUntil) {
      return res.status(400).json({
        message: "Incomplete offer details. Title, description, discount, validFrom, and validUntil are required.",
      });
    }

    // Fetch club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // Check ownership if ownerId is provided
    if (ownerId && club.owner.toString() === ownerId) {
      // Proceed
    } 
    // Check manager permission if managerId is provided
    else if (managerId) {
      const manager = await Employee.findById(managerId);

      if (!manager || manager.position?.toLowerCase() !== "manager") {
        return res.status(404).json({ message: "Manager not found or invalid." });
      }

      if (manager.club.toString() !== clubId) {
        return res.status(403).json({ message: "Manager does not belong to this club." });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized to create offer for this club." });
    }

    // Create the offer with club reference
    const newOffer = await Offer.create({
      ...offerDetails,
      club: clubId,
    });

    // Link offer to club
    club.offers.push(newOffer._id);
    await club.save();

    return res.status(201).json({
      message: "Offer created successfully.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const OwnerOfferDetails = async (res, req) => {};

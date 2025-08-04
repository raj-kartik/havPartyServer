import express from "express";
import { getCurrentOffers, getOfferById } from "../../controllers/Offers/UserOffer.js";

const router = express.Router();

router.get("/get-offers", getCurrentOffers);
router.get("/offer-details/:offerId", getOfferById);


export default router;

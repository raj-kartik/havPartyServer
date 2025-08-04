import express from "express";
import { postUserBookingEvent } from "../../controllers/Bookings/EventBooking.js";
import { getAllClubsForUser, getAllEventsForUser, getAllOfferToUser, getClubDetailsForUser, getEventDetailsForUser, getOfferDetailsToUser } from "../../controllers/Bookings/UserBooking.js";
const router = express.Router();

// users offers
router.get("/all-offers",getAllOfferToUser);
router.get("/all-offer/:offerId",getOfferDetailsToUser)

// user events
router.post("/book-event",postUserBookingEvent);
router.get("/all-event",getAllEventsForUser);
router.get("/event-detail/:eventId",getEventDetailsForUser);

// users daily event
router.get("/all-clubs",getAllClubsForUser);
router.get("/clubs/details/:clubId",getClubDetailsForUser);



export default router;
import express from "express"
import { getAllEvents, postCreateEvent } from "../../controllers/Events/ClubEvents.js";
import { getBookingListOfEventToClub } from "../../controllers/Bookings/EventBooking.js";

const router = express.Router();

router.post("/create-event",postCreateEvent)
router.get("/get-event-list",getAllEvents)

// club
router.get("/booking-event-user/:eventId",getBookingListOfEventToClub)

export default router;
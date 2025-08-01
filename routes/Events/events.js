import express from "express"
import { deleteEvent, getAllEvents, getEventDetails, postCreateEvent } from "../../controllers/Events/ClubEvents.js";
import { getBookingListOfEventToClub } from "../../controllers/Bookings/EventBooking.js";

const router = express.Router();

router.post("/create-event",postCreateEvent)
router.get("/get-event-list",getAllEvents)
router.put("/delete-event/:eventId",deleteEvent) // Assuming deleteEvent is defined in the controller

router.get("/get-event-details/:eventId", getEventDetails);

// club
router.get("/booking-event-user/:eventId",getBookingListOfEventToClub)

export default router;
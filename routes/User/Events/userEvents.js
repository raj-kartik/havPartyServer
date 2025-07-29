import express from "express";
import { postUserBookingEvent } from "../../../controllers/Bookings/EventBooking.js";

const router = express.Router();

router.post("/book-event", postUserBookingEvent);

export default router;

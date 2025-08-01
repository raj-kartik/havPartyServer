import { postUserBookingEvent } from "../../controllers/Bookings/EventBooking.js";

import express from "express";
const router = express.Router();

router.post("/event",postUserBookingEvent);
export default router;
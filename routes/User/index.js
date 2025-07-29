import express from "express";
import userRoute from "./Auth/user.js";
import transactionsRoute from "./Transactions/transactions.js";
import clubRoute from "./Club/club.js";
import BookingRouter from "./Bookings/booking.js";
import eventRouter from './Events/userEvents.js';


const router = express.Router();

router.use("/auth", userRoute); // Note: added "/" in front
router.use("/transaction", transactionsRoute);
router.use("/club", clubRoute);
router.use("/booking", BookingRouter);
router.use("/events",eventRouter)

export default router;

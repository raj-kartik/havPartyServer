import express from "express";
import { bookingClub } from "../../../controllers/Club/Club.js";

const router = express.Router();

// booking club
router.post("/club", bookingClub);


export default router;

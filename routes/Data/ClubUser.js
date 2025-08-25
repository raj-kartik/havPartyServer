import express from "express";
import {
  getListUserToOwner,
  getUserDetailForClub,
} from "../../controllers/Data/ClubUserData.js";
import {
  getDailyCrowdState,
  patchDailyStatus,
} from "../../controllers/Bookings/DailyBooking.js";

const router = express.Router();

router.get("/stats", getListUserToOwner);
router.get("/stats-details", getUserDetailForClub);
router.get("/daily-crowd", getDailyCrowdState);
router.patch("/update-daily-booking", patchDailyStatus);

export default router;

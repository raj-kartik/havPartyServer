import express from 'express'
import { getAllClubs, getClubDetails } from '../../controllers/DailyClubs/DailyClubs.js';
import { postBookDailyClub } from '../../controllers/Bookings/DailyBooking.js';

const router = express.Router();

router.get("/all-clubs",getAllClubs);
router.get("/club-detail/:clubId",getClubDetails);


// post club
router.post("/daily-booking",postBookDailyClub);

export default router;
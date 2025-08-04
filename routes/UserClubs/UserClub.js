import express from 'express'
import { getAllClubs } from '../../controllers/DailyClubs/DailyClubs.js';

const router = express.Router();

router.get("/all-clubs",getAllClubs);
router.get("/club-detail/:clubId",getAllClubs);

export default router;
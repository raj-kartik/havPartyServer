import express from "express";
import {
  getNearByClub,
  popularClubs,
} from "../../../controllers/User/Club/ClubControllers.js";
const router = express();

router.post("/near-by-club", getNearByClub);
router.post("/popular-club", popularClubs);

export default router;

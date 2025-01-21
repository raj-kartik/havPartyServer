import express from "express";
import {
  getClubDetails,
  getNearByClub,
  popularClubs,
} from "../../../controllers/User/Club/ClubControllers.js";
import { likeClub } from "../../../controllers/User/Club/ClubLikeControllers.js";
const router = express();

router.post("/near-by-club", getNearByClub);
router.post("/popular-club", popularClubs);
router.post("/like-club",likeClub);
router.get("/:id",getClubDetails);

export default router;

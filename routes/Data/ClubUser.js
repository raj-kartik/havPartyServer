import express from "express";
import {
  getListUserToOwner,
  getUserDetailForClub,
} from "../../controllers/Data/ClubUserData.js";

const router = express.Router();

router.get("/stats", getListUserToOwner);
router.get("/stats-details", getUserDetailForClub);

export default router;

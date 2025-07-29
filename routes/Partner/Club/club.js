import express from 'express'
// import {addOfferToClub, createClub} from '../../../controllers/Club/Club.js';
import { OfferCreatedByClubers } from '../../../controllers/Offers/OwnerOffer.js';
import { getAllClub, ownerClubDetails } from '../../../controllers/Club/Club.js';

const router = express.Router();

router.get("/all-clubs", getAllClub);
router.post('/add-offers',OfferCreatedByClubers)

export default router;
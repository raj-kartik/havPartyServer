import express from 'express'
// import {addOfferToClub, createClub} from '../../../controllers/Club/Club.js';
import { getOffersByClub, OfferCreatedByClubers } from '../../../controllers/Offers/OwnerOffer.js';
import { getAllClub, ownerClubDetails } from '../../../controllers/Club/Club.js';

const router = express.Router();

router.get("/all-clubs", getAllClub);
router.post('/add-offers',OfferCreatedByClubers);
router.get('/offers', getOffersByClub); // can use for partner as well

export default router;
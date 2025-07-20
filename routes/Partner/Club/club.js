import express from 'express'
import {addOfferToClub, createClub} from '../../../controllers/Club/Club.js';
import { OfferCreatedByClubers } from '../../../controllers/Offers/OwnerOffer.js';

const router = express.Router();

// post
router.post('/create',createClub)
router.post('/add-offers',OfferCreatedByClubers)

export default router;
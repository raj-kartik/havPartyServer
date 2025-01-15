import express from 'express'
import {addOfferToClub, createClub} from '../../../controllers/Partner/Club/Club.js';
import { partnerClub } from '../../../controllers/Partner/PartnerController.js';

const router = express.Router();

// post
router.post('/create',createClub)
router.post('/add-offers',addOfferToClub)
router.post('/position',partnerClub)

export default router;
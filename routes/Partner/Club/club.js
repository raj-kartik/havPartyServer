import express from 'express'
import {addOfferToClub, createClub} from '../../../controllers/Club/Club.js';

const router = express.Router();

// post
router.post('/create',createClub)
router.post('/add-offers',addOfferToClub)

export default router;
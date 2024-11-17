import express from 'express'
import {createClub} from '../../../controllers/Partner/Club/Club.js';
import { partnerClub } from '../../../controllers/Partner/PartnerController.js';

const router = express.Router();

// post
router.post('/create',createClub)
router.post('/position',partnerClub)

export default router;
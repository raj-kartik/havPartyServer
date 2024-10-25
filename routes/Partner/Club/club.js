import express from 'express'
import {createClub} from '../../../controllers/Partner/Club/Club.js';

const router = express.Router();

router.post('/create',createClub)

export default router;
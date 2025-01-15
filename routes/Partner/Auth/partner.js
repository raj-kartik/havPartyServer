import express from 'express'
import { createPartner } from '../../../controllers/Partner/Auth/SignUpPartner.js';
import { signInPartner } from '../../../controllers/Partner/Auth/SignInPartner.js';

const router = express.Router();


router.post('/signup',createPartner)
router.post('/signin',signInPartner)

export default router;
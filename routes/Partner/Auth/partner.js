import express from 'express'
// import { createPartner } from '../../../controllers/Partner/Auth/SignUpPartner.js';
// import { signInEmployee } from '../../../controllers/Partner/Auth/SignInPartner.js';
import events from '../../Events/events.js'
import club from '../Club/club.js'
import { addEmployee } from '../../../controllers/Partner/PartnerController.js';
const router = express.Router();


// router.post('/signup',createPartner)
// router.post('/signin',signInEmployee)
// change password --> 

export default router;
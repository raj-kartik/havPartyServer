import express from 'express'
import User from '../models/userSchema.js'
import { AuthSignup } from '../controllers/Auth.js';

const router  = express();

router.post('/signup',AuthSignup);

export default router;
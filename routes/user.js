import express from 'express'
import { AuthSignup } from '../controllers/Auth/SignUp.js';
import { AuthSignIn } from '../controllers/Auth/SignIn.js';

const router  = express();

router.post('/signup',AuthSignup);
router.post('/signin',AuthSignIn);

export default router;
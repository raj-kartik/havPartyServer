import express from 'express'
import { Club } from '../../controllers/Partner/Club/Club.js';

const router = express.Router();

router.post('/club',Club)
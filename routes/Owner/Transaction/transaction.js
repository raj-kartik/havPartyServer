
import express from 'express'
import { getAllClubTransactions } from '../../../controllers/Transactions/ClubTransaction.js';

const router = express();

router.get("/all-clubs",getAllClubTransactions)

export default router;
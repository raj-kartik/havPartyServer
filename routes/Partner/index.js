import express from "express";
import club from "./Club/club.js";
import transactions from "./Transactions/transactions.js";
import auth from './Auth/partner.js'

const router = express();

router.use("/club", club);
router.use("/transaction", transactions);
router.use("/auth", auth);

// offers

export default router;
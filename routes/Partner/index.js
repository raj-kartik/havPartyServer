import express from "express";
import club from "./Club/club.js";
import transactions from "./Transactions/transactions.js";

const router = express();

router.use("/club", club);
router.use("/transaction", transactions);

export default router;

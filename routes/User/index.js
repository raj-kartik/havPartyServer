import express from "express";
import UserRoute from "./Auth/user.js";
import transactionsRoute from "./Transactions/transactions.js";
import clubRoute from "./Club/club.js";

const router = express();

router.use("auth/", UserRoute);
router.use("transaction/", transactionsRoute);
router.use("club/", clubRoute);

export default router;

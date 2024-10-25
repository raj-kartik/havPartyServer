import express from "express";
import {
  cancelPayment,
  payToClub,
} from "../../../controllers/User/Transactions/transactions.js";
const router = express();

router.post("/pay-online", payToClub);
router.post("/pay-cancel", cancelPayment);

export default router;

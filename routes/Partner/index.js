import express from "express";
import club from "./Club/club.js";
import transactions from "./Transactions/transactions.js";
import auth from './Auth/partner.js'
import events from "../Events/events.js"
import { addEmployee } from "../../controllers/Partner/PartnerController.js";
import { employeeDetails } from "../../controllers/Partner/Auth/SignInPartner.js";
const router = express();

router.use("/club", club);
router.use("/transaction", transactions);
router.use("/auth", auth);

router.use("/details",employeeDetails);

// employee
router.post("/add-employee",addEmployee)

// events
router.use("/events",events)

// offers

export default router;
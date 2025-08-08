import express from "express";
import club from "./Club/club.js";
import transactions from "./Transactions/transactions.js";
import auth from './Auth/partner.js'
import events from "../Events/events.js"
import { addEmployee } from "../../controllers/Partner/PartnerController.js";
import { employeeDetails } from "../../controllers/Partner/Auth/SignInPartner.js";
import { getEmployeesListToManager } from "./Club/clubEmployee.js";
import awsRoute from "../aws/aws.js"
const router = express();

router.use("/club", club);
router.use("/transaction", transactions);
router.use("/auth", auth);

router.use("/details",employeeDetails);

// employee
router.post("/add-employee",addEmployee)
router.get("/all-employees",getEmployeesListToManager)

// events
router.use("/events",events)
router.use("/aws",awsRoute);

// offers

export default router;
import express from "express";
import club from "./Club/club.js";
import transactions from "./Transactions/transactions.js";
import auth from './Auth/partner.js'
import events from "../Events/events.js"
import { addEmployee, employeeLoginDetails } from "../../controllers/Partner/PartnerController.js";
import { employeeDetails } from "../../controllers/Partner/Auth/SignInPartner.js";
import { getEmployeesListToManager } from "./Club/clubEmployee.js";
import awsRoute from "../aws/aws.js"
import userDataRoute from "../Data/ClubUser.js"

const router = express();

// auth
router.use("/auth", auth);
router.get("/details",employeeLoginDetails)
// -----------------------------------------------------------

// employee
router.post("/add-employee",addEmployee)
// all employee
router.get("/all-employees",getEmployeesListToManager)
// employee details
router.get("/employee-details",employeeDetails);

// -----------------------------------------------------------

// club
router.use("/club", club);

// transactions
router.use("/transaction", transactions); // phase II


// events
router.use("/events",events)

// aws uploading
router.use("/aws",awsRoute);


// user data
router.use("/club-user",userDataRoute);

export default router;
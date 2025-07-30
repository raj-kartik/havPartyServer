import express from "express";
import { ownerDetails, ownerSignIn, ownerSignUp } from "../../controllers/Owner/Owner.js";
import { addEmployee, getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";
import { createClub, getAllClub, ownerClubDetails, updateManager } from "../../controllers/Club/Club.js";
import { getOffersByClub, OfferCreatedByClubers } from "../../controllers/Offers/OwnerOffer.js";
import transactions from './Transaction/transaction.js'
import events from '../Events/events.js'
const router = express.Router();

// post
router.post("/signup", ownerSignUp);
router.post("/signin", ownerSignIn);

// owner details
router.get("/details", ownerDetails);

// employee
router.get("/all-employees", getEmployee);
router.get("/employee/details", getEmployeeDetails);
router.post("/add-employee",addEmployee)

// router.put("/update-manager", updateManager);
// club
router.get("/club/all-clubs", getAllClub);
router.post("/create-club", createClub);
router.get("/club/club-details/:clubId", ownerClubDetails); // can use for partner as well

// offer 
router.post("/club/add-offer", OfferCreatedByClubers); // Assuming addOfferToClub is defined in the controller
router.get("/club/offers",getOffersByClub)
// update offer
// disable offer
// delete offers

// transactions
router.use("/transaction", transactions);
router.use("/events",events)


export default router;

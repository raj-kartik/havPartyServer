import express from "express";
import { ownerDetails, ownerSignIn, ownerSignUp } from "../../controllers/Owner/Owner.js";
import { addEmployee, getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";
import { createClub, getAllClub, getClubStats, ownerClubDetails, updateDeleteClub, updateManager } from "../../controllers/Club/Club.js";
import { getOffersByClub, OfferCreatedByClubers, putDeleteOffer, updateOffer } from "../../controllers/Offers/OwnerOffer.js";
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
router.put("/club/delete/:clubId",updateDeleteClub ); // Update manager for a club
router.get("/club/club-stats",getClubStats)

// offer 
router.post("/club/add-offers", OfferCreatedByClubers); // Assuming addOfferToClub is defined in the controller
router.get("/club/offers",getOffersByClub)
// update offer
router.put("/club/offers/:offerId",updateOffer)
router.put("/club/delete-offer", putDeleteOffer); // Assuming updateOffer is defined in the controller
// disable offer
// delete offers

// transactions
router.use("/transaction", transactions);
router.use("/events",events)


export default router;

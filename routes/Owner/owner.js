import express from "express";
import { ownerDetails, ownerSignIn, ownerSignUp } from "../../controllers/Owner/Owner.js";
import { addEmployee, getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";
import { createClub, getAllClub, ownerClubDetails, updateManager } from "../../controllers/Club/Club.js";
import { OfferCreatedByClubers } from "../../controllers/Offers/OwnerOffer.js";

const router = express.Router();

// post
router.post("/signup", ownerSignUp);
router.post("/signin", ownerSignIn);

// owner details
router.get("/details", ownerDetails);

// employee
router.get("/employees", getEmployee);
router.get("/employee/details", getEmployeeDetails);
router.post("/add-employee",addEmployee)

// club
router.get("/all-clubs", getAllClub);
router.post("/create-club", createClub);
router.put("/update-club", updateManager);
router.get("/club-details/:clubId", ownerClubDetails);

// offer 
router.post("/add-offer", OfferCreatedByClubers); // Assuming addOfferToClub is defined in the controller

export default router;

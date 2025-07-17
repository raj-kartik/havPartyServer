import express from "express";
import { ownerDetails, ownerSignIn, ownerSignUp } from "../../controllers/Partner/Owner/Owner.js";
import { getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";
import { createClub, getAllClub, updateManager } from "../../controllers/Partner/Club/Club.js";

const router = express.Router();

// post
router.post("/signup", ownerSignUp);
router.post("/signin", ownerSignIn);

// owner details
router.get("/details", ownerDetails);

// employee
router.get("/employees", getEmployee);
router.get("/employee/details", getEmployeeDetails);

// club
router.get("/all-clubs", getAllClub);
router.post("/create-club", createClub);
router.put("/update-club", updateManager);

export default router;

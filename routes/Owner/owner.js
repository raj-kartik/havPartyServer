import express from "express";
import { ownerSignIn, ownerSignUp } from "../../controllers/Partner/Owner/Owner.js";
import { getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";

const router = express.Router();

// post
router.post("/signup", ownerSignUp);
router.post("/signin", ownerSignIn);
// get
router.get("/employees", getEmployee);
// get 
router.get("/employee/details", getEmployeeDetails);

export default router;

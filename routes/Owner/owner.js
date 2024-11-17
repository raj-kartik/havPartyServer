import express from "express";
import { ownerSignUp } from "../../controllers/Partner/Owner/Owner.js";
import { getEmployee, getEmployeeDetails } from "../../controllers/Partner/PartnerController.js";

const router = express.Router();

// post
router.post("/sign-up", ownerSignUp);

// get
router.get("/employee", getEmployee);

// get
router.get("/employee/details", getEmployeeDetails);

export default router;

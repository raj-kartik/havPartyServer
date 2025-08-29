import express from "express";
import {
  ownerDetails,
  ownerSignIn,
  ownerSignUp,
} from "../../controllers/Owner/Owner.js";
import {
  addEmployee,
  getEmployee,
  getEmployeeDetails,
} from "../../controllers/Partner/PartnerController.js";
import {
  createClub,
  getAllClub,
  getClubStats,
  ownerClubDetails,
  updateDeleteClub,
  updateManager,
} from "../../controllers/Club/Club.js";
import {
  getOffersByClub,
  OfferCreatedByClubers,
  putDeleteOffer,
  updateOffer,
} from "../../controllers/Offers/OwnerOffer.js";
import transactions from "./Transaction/transaction.js";
import awsRoute from "../aws/aws.js";
import events from "../Events/events.js";
import userDataRoute from "../Data/ClubUser.js";

const router = express.Router();

// post
router.post("/signup", ownerSignUp);
router.post("/signin", ownerSignIn);

// owner details
router.get("/details", ownerDetails);

// ---------------------------------------------------------------------

// employee
router.get("/all-employees", getEmployee);

// employee details
router.get("/employee-details", getEmployeeDetails);

// add employee
router.post("/add-employee", addEmployee);

// ---------------------------------------------------------------------

// router.put("/update-manager", updateManager);
// club
router.post("/create-club", createClub);
router.get("/club/club-details/:clubId", ownerClubDetails); // can use for partner as well
router.put("/club/delete/:clubId", updateDeleteClub); // Update manager for a club

// common routes --> owner + employee --------------------------------
router.get("/club/all-clubs", getAllClub);
router.post("/club/add-offers", OfferCreatedByClubers); // Assuming addOfferToClub is defined in the controller
router.get("/club/offers", getOffersByClub);
router.put("/club/delete-offer", putDeleteOffer); // Assuming updateOffer is defined in the controller
router.put("/club/offers/:offerId", updateOffer);
router.get("/club/club-stats", getClubStats);
// --------------------------------------------------------------------

// transactions
router.use("/transaction", transactions); // phase II

// events
router.use("/events", events);

// aws uploading
router.use("/aws", awsRoute);

// user data
router.use("/club-user", userDataRoute);

export default router;

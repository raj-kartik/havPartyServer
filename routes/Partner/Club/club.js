import express from 'express'
// import {addOfferToClub, createClub} from '../../../controllers/Club/Club.js';
import { getOffersByClub, OfferCreatedByClubers, putDeleteOffer } from '../../../controllers/Offers/OwnerOffer.js';
import { getAllClub, ownerClubDetails } from '../../../controllers/Club/Club.js';

const router = express.Router();

router.get("/all-clubs", getAllClub);
router.post('/add-offers',OfferCreatedByClubers);
router.get('/offers', getOffersByClub); // can use for partner as well
router.put('/delete-offer', putDeleteOffer); // Assuming updateOffer is defined in the controller
router.put('/offers/:offerId', putDeleteOffer); // Assuming updateOffer is defined in the controller
export default router;
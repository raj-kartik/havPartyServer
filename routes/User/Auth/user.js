import express from "express";
import { AuthSignup } from "../../../controllers/User/Auth/SignUp.js";
import { AuthSignIn } from "../../../controllers/User/Auth/SignIn.js";
import { updateUser } from "../../../controllers/User/Auth/Update.js";
import { deleteUser } from "../../../controllers/User/Auth/Delete.js";

const router = express.Router();

router.post("/signup", AuthSignup);
router.post("/signin", AuthSignIn);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);


export default router;
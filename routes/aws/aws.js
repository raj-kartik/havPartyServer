import express from "express";
import { getUploadUrl } from "../../controllers/aws/awsController.js";
const router = express.Router();

router.post("/get-upload-url", getUploadUrl);

export default router;

import express from "express";
import { removeImage, uploadImage } from "../controllers/course";

const router = express.Router();

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);

module.exports = router;

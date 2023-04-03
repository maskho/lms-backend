import express from "express";
import {
  addModule,
  create,
  read,
  removeImage,
  removeModule,
  removeVideo,
  update,
  updateModule,
  uploadImage,
  uploadVideo,
} from "../controllers/course";
import { isProvider, requireSignIn } from "../middlewares";
import ExpressFormidable from "express-formidable";

const router = express.Router();

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);

router.post("/course", requireSignIn, isProvider, create);
router.put("/course/:slug", requireSignIn, update);
router.get("/course/:slug", read);
router.post(
  "/course/video-upload/:providerId",
  requireSignIn,
  ExpressFormidable(),
  uploadVideo
);
router.post("/course/video-remove/:providerId", requireSignIn, removeVideo);
router.post("/course/module/:slug/:providerId", requireSignIn, addModule);
router.put("/course/module/:slug/:providerId", requireSignIn, updateModule);
router.put("/course/:slug/:moduleId", requireSignIn, removeModule);

module.exports = router;

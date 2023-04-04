import express from "express";
import {
  addModule,
  checkEnrollment,
  courses,
  create,
  freeEnrollment,
  listCompleted,
  markCompleted,
  markIncomplete,
  paidEnrollment,
  publish,
  read,
  removeImage,
  removeModule,
  removeVideo,
  unpublish,
  update,
  updateModule,
  uploadImage,
  uploadVideo,
  userCourses,
} from "../controllers/course";
import { isEnrolled, isProvider, requireSignIn } from "../middlewares";
import ExpressFormidable from "express-formidable";

const router = express.Router();

router.get("/courses", courses);

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
router.put("/course/publish/:courseId", requireSignIn, publish);
router.put("/course/unpublish/:courseId", requireSignIn, unpublish);
router.post("/course/module/:slug/:providerId", requireSignIn, addModule);
router.put("/course/module/:slug/:providerId", requireSignIn, updateModule);
router.put("/course/:slug/:moduleId", requireSignIn, removeModule);

router.get("/check-enrollment/:courseId", requireSignIn, checkEnrollment);
router.post("/free-enrollment/:courseId", requireSignIn, freeEnrollment);
router.post("/paid-enrollment/:courseId", requireSignIn, paidEnrollment);

router.get("/user-courses", requireSignIn, userCourses);
router.get("/user/course/:slug", requireSignIn, isEnrolled, read);

router.post("/mark-completed", requireSignIn, markCompleted);
router.post("/list-completed", requireSignIn, listCompleted);
router.post("/mark-incomplete", requireSignIn, markIncomplete);

module.exports = router;

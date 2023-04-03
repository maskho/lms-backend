import express from "express";
import { requireSignIn } from "../middlewares";
import {
  currentProvider,
  makeProvider,
  providerCourses,
} from "../controllers/provider";

const router = express.Router();

router.post("/make-provider", requireSignIn, makeProvider);
router.get("/current-provider", requireSignIn, currentProvider);

router.get("/provider-courses", requireSignIn, providerCourses);
module.exports = router;

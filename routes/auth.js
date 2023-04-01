import express from "express";
import {
  currentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  sendTestEmail,
} from "../controllers/auth";
import { requireSignIn } from "../middlewares";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignIn, currentUser);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;

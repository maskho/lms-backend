import express from "express";
import { requireSignIn } from "../middlewares";
import { currentProvider, makeProvider } from "../controllers/provider";

const router = express.Router();

router.post("/make-provider", requireSignIn, makeProvider);
router.get("/current-provider", requireSignIn, currentProvider);

module.exports = router;

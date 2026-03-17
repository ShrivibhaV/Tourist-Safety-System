import express from "express";
import {
  createProfile, getProfile, updateProfile, downloadProfile 
} from "../controllers/tourist_profile.controller.js";

const router = express.Router();

router.post("/", createProfile);
router.get("/", getProfile);
router.get("/download/:id", downloadProfile);
router.put("/:id", updateProfile);

export default router;

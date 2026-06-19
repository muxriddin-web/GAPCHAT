import express from "express";

import multer from "multer";

import {
  uploadVoice,
} from "../controllers/uploadController.js";

const router =
  express.Router();

const storage =
  multer.memoryStorage();

const upload =
  multer({ storage });

router.post(

  "/voice",

  upload.single("audio"),

  uploadVoice

);

export default router;
import express from "express";

import {

  getUsers,

  addContact,

  deleteChat,

} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);

router.post(
  "/add-contact",
  addContact
);

router.post(
  "/delete-chat",
  deleteChat
);

export default router;
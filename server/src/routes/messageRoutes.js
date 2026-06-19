import express from "express";
import {
  sendMessage,
  getMessages,
  getChats,
  deleteMessage, // <-- Nomlanishi tepadagi controller bilan bir xil bo'lishi shart
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/chats/:userId", getChats); 
router.get("/:senderId/:receiverId", getMessages);
router.delete("/:id", deleteMessage);

export default router;
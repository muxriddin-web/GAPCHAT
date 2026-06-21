import express from "express";
import {
  sendMessage,
  getMessages,
  getChats,
  deleteMessage,
  searchUsers, // 1️⃣ Controllerdan qidiruv funksiyasini import qilamiz
} from "../controllers/messageController.js";

const router = express.Router();

// 2️⃣ JUDA MUHIM: Qidiruv yo'lagini dinamik id li (:senderId) yo'laklardan TEPADA yozamiz!
router.get("/search", searchUsers); 

router.post("/", sendMessage);
router.get("/chats/:userId", getChats); 
router.get("/:senderId/:receiverId", getMessages);
router.delete("/:id", deleteMessage);

export default router;
import Message from "../models/Message.js";
import User from "../models/User.js";
import { getAllReceiverSocketIds, getIO } from "../socket/socket.js";

// SEND MESSAGE
// server/controllers/messageControllers.js

export const sendMessage = async (req, res) => {
  try {
    const { receiver } = req.body;
    
    // 1. Bazaga saqlash
    const message = await Message.create(req.body);

    // 2. Global Express'dan io-ni olamiz
    const io = req.app.get("io");
    
    if (io) {
      // 🔥 Qabul qiluvchining shaxsiy ID-Xonasiga xabarni otamiz
      io.to(receiver).emit("receiveMessage", message);
      console.log(`Xabar ${receiver} xonasiga muvaffaqiyatli yuborildi.`);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getMessages va boshqa funksiyalar o'zgarishsiz qoladi...

// GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CHATS
export const getChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const userMap = {};
    messages.forEach((msg) => {
      const otherUser =
        msg.sender.toString() === userId
          ? msg.receiver.toString()
          : msg.sender.toString();
      userMap[otherUser] = true;
    });

    const chatUserIds = Object.keys(userMap);
    const chatUsers = await User.find({ _id: { $in: chatUserIds } }).select(
      "username profilePic isOnline"
    );
    res.json(chatUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH USERS
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.query || req.query.search;
    if (!keyword) return res.status(200).json([]);

    const users = await User.find({
      username: { $regex: keyword, $options: "i" },
    }).select("username profilePic isOnline");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import Message from "../models/Message.js";
import User from "../models/User.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      const otherUser = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      userMap[otherUser] = true;
    });

    const chatUserIds = Object.keys(userMap);

    const chatUsers = await User.find({ _id: { $in: chatUserIds } })
      .select("username profilePic isOnline");

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

// ✅ YANGI QO'SHILGAN QIDIRUV FUNKSIYASI (GLOBAL SEARCH)
export const searchUsers = async (req, res) => {
  try {
    // Frontenddan 'query' yoki 'search' bo'lib kelgan so'zni ushlaymiz
    const keyword = req.query.query || req.query.search;

    if (!keyword) {
      return res.status(200).json([]);
    }

    // $regex yordamida ism ichida qidirilayotgan harflar borligini tekshiramiz
    // $options: "i" -> Katta-kichik harflarni farqlamaydi (masalan: Asilbek va asilbek bir xil topiladi)
    const users = await User.find({
      username: { $regex: keyword, $options: "i" }
    }).select("username profilePic isOnline"); // Faqat kerakli ma'lumotlarni yuboramiz, parolni yashiramiz

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
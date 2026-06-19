import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

// Ma'lumotlar bazasiga ulanish
connectDB();

const app = express();
const httpServer = createServer(app);

// EXPRESS CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// SOCKET CORS VA ALOQANI USHLAB TURISH SOZLAMALARI
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,  // Aloqa uzilib qolmasligi uchun kutish vaqti (60 sek)
  pingInterval: 25000  // Har 25 soniyada brauzer onlaynligini tekshiradi
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// SOCKET FOYDALANUVCHILARI
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  // Foydalanuvchi ulanganda (client/src/Socket.js avtomatik query'da userId yuboradi)
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    const exists = onlineUsers.find((u) => u.userId === userId);
    if (!exists) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit("getUsers", onlineUsers);
    console.log("Hozirgi onlayn foydalanuvchilar:", onlineUsers);
  }

  // Muqobil ravishda eski "addUser" hodisasi ham ishlayveradi
  socket.on("addUser", (id) => {
    if (id) {
      const exists = onlineUsers.find((u) => u.userId === id);
      if (!exists) {
        onlineUsers.push({ userId: id, socketId: socket.id });
      }
      io.emit("getUsers", onlineUsers);
    }
  });

  // XABAR YUBORISH
  socket.on("sendMessage", (data) => {
    const user = onlineUsers.find((u) => u.userId === data.receiver);
    if (user) {
      io.to(user.socketId).emit("receiveMessage", data);
    }
  });

  // DISCONNECT
  socket.on("disconnect", (reason) => {
    console.log("USER DISCONNECTED. Sababi:", reason);
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

// PORT
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
// server/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import messageRoutes from "./routes/messageRoutes.js"; // qolgan routerlar ham shu yerda bo'ladi

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const ALLOWED_ORIGINS = ["http://localhost:5173", "https://gapchat.netlify.app"];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET", "POST"], credentials: true }
});

// 🔥 IO ob'ektini controllerlar ishlata olishi uchun Express'ga bezaymiz
app.set("io", io);

app.use("/api/messages", messageRoutes);

// SOCKET ULANISHI
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== "undefined") {
    // Foydalanuvchini o'zining userId nomli shaxsiy xonasiga kiritamiz
    socket.join(userId);
    console.log(`Foydalanuvchi o'z xonasiga kirdi: ${userId}`);
    
    // Kim onlaynligini bildirish uchun (ixtiyoriy)
    io.emit("userOnlineStatus", { userId, isOnline: true });
  }

  socket.on("disconnect", () => {
    if (userId) {
      io.emit("userOnlineStatus", { userId, isOnline: false });
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config(); // .env faylni o'qish uchun

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Statik "http://localhost:5173" o'rniga dinamik havolani qo'yamiz:
    origin: [process.env.CLIENT_URL, "http://localhost:5173"], 
    methods: ["GET", "POST"],
    credentials: true
  },
});

const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
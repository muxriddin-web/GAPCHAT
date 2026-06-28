import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://gapchat.onrender.com";

const getFreshUserId = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    return currentUser?._id || currentUser?.user?._id || "";
  } catch (e) {
    return "";
  }
};

const socket = io(BACKEND_URL, {
  autoConnect: true,
  // 🚀 RENDER HOSTINGI UCHUN: Faqat websocket emas, polling ham qo'shildi (Barqarorlik uchun)
  transports: ["websocket", "polling"], 
  query: { userId: getFreshUserId() },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  timeout: 30000,
});

socket.on("connect", () => {
  const currentId = getFreshUserId();
  console.log("[Socket] Ulandi. socketId:", socket.id, "| userId:", currentId);
  if (currentId) {
    // 🚀 Kafolat: Ikkala ehtimoliy signalni ham yuboramiz
    socket.emit("addUser", currentId);
    socket.emit("join", currentId);
  }
});

socket.on("connect_error", (err) => {
  console.error("[Socket] Ulanish xatosi:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Uzildi:", reason);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log("[Socket] Qayta ulanish urinishi:", attempt);
  socket.io.opts.query = { userId: getFreshUserId() };
});

// 🚀 ENGl MUHIM FUNKSIYA: Login bo'lganda context buni srazi chaqirishi shart!
export const refreshSocketConnection = () => {
  const currentId = getFreshUserId();
  socket.io.opts.query = { userId: currentId };
  
  if (socket.connected) {
    socket.emit("addUser", currentId);
    socket.emit("join", currentId);
    console.log("[Socket] Yangi ulanish parametrlari yuborildi:", currentId);
  } else {
    socket.connect();
  }
};

export default socket;
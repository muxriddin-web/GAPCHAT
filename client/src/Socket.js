// import { io } from "socket.io-client";

// const currentUser = JSON.parse(localStorage.getItem("userInfo")) || {};
// const userId = currentUser?._id;

// const socket = io("http://localhost:5000", {
//   autoConnect: true,
//   transports: ["websocket"], // <-- Faqat websocket ishlashini majburlaymiz
//   query: { userId: userId || "" },
// });

// export default socket;





import { io } from "socket.io-client";

// 1. HOSTING UCHUN URL DINAMIKLASHTIRISH
// Loyihani Render/VPS-ga qo'yganingizda .env faylidagi VITE_BACKEND_URL ni o'qiydi.
// Agar u topilmasa (mahalliy kompyuterda) localhost:5000 da ishlayveradi.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const currentUser = JSON.parse(localStorage.getItem("userInfo")) || {};
const userId = currentUser?._id;

// 2. SOCKET INSTANSIYASINI OPTIMALLASHTIRISH
const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["websocket"], // WebSocket majburlash (HTTP polling'ga vaqt ketkazmaydi)
  query: { userId: userId || "" },
  
  // Production barqarorlik sozlamalari:
  reconnection: true,            // Internet uzilsa avtomatik qayta ulanish
  reconnectionAttempts: 10,      // Server o'chib yonsa, ketma-ket 10 marta ulanishga urinadi
  reconnectionDelay: 2000,       // Har bir urinish orasida 2 soniya kutadi (serverni charchatmaydi)
  timeout: 10000,                // 10 soniyada javob bo'lmasa ulanishni uzib qayta urinadi
});

// 3. DINAMIK USER ID YANGILASH (Lifehack)
// Foydalanuvchi yangi login qilganida socket ulanishini eng oxirgi ID bilan yangilash mexanizmi
socket.on("connect_error", () => {
  const freshUser = JSON.parse(localStorage.getItem("userInfo"));
  if (freshUser?._id) {
    socket.io.opts.query = { userId: freshUser._id };
  }
});

export default socket;
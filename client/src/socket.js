import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://gapchat.onrender.com";

const getFreshUserId = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    return currentUser?._id || "";
  } catch (e) {
    return "";
  }
};

const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["websocket"],
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
    socket.emit("addUser", currentId);
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

export const refreshSocketConnection = () => {
  const currentId = getFreshUserId();
  socket.io.opts.query = { userId: currentId };
  if (socket.connected) {
    socket.emit("addUser", currentId);
  } else {
    socket.connect();
  }
};

export default socket;
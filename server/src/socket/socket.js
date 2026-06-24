let _io = null;

// userId -> Set of socketIds (bir user bir nechta tab/qurilmada bo'lishi mumkin)
const userSocketMap = {};

export const initIO = (ioInstance) => {
  _io = ioInstance;
};

export const getIO = () => _io;

export const getReceiverSocketId = (receiverId) => {
  const id = receiverId?.toString();
  const sockets = userSocketMap[id];
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0];
};

export const getAllReceiverSocketIds = (receiverId) => {
  const id = receiverId?.toString();
  const sockets = userSocketMap[id];
  if (!sockets || sockets.size === 0) return [];
  return [...sockets];
};

export const setUserSocket = (userId, socketId) => {
  if (!userId || userId === "undefined" || !socketId) return;
  const id = userId.toString();
  if (!userSocketMap[id]) {
    userSocketMap[id] = new Set();
  }
  userSocketMap[id].add(socketId);
  console.log(`[Socket] User ${id} socketlari:`, [...userSocketMap[id]]);
};

export const removeUserSocket = (socketId) => {
  for (const uid in userSocketMap) {
    userSocketMap[uid].delete(socketId);
    if (userSocketMap[uid].size === 0) {
      delete userSocketMap[uid];
    }
  }
};

export const getOnlineUserIds = () => Object.keys(userSocketMap);
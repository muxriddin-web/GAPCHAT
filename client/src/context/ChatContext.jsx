import { createContext, useContext, useState, useEffect, useRef } from "react";
import socket, { refreshSocketConnection } from "../socket"; 
import API from "../api/axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState({});

  // Reaktiv foydalanuvchi holati
  const [currentUser, setCurrentUser] = useState(() => 
    JSON.parse(localStorage.getItem("userInfo")) || null
  );

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // 🚀 LOGIN BO'LGANDA TOKEn VA SOCKETNI F5'SIZ ZUDRLIK BILAN UYG'OTISH
  const loginUser = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setCurrentUser(userData);

    // Axios tokenini zudlik bilan yangilash (Global qidiruv srazi ishlashi uchun)
    const token = userData.token || userData.user?.token;
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // 🚀 SIZNING SOCKETINGIZNI REAL VAQTDA YANGILASH TUGMASINI BOSAMIZ!
    refreshSocketConnection();
  };

  // LOGOUT (Tizimdan chiqish)
  const logoutUser = () => {
    localStorage.removeItem("userInfo");
    setCurrentUser(null);
    setSelectedUser(null);
    setMessages([]);
    setNotifications({});
    socket.disconnect();
  };

  // 🚀 REAL VAQTDA XABARLARNI BAZAGA VA SOCKETGA YUBORISH FUNKSIYASI
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedUser?._id || !currentUser?._id) return;

    try {
      // 1. Backend API ga post so'rov yuboramiz
      const { data } = await API.post("/messages", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: messageText.trim()
      });

      // 2. O'zimiz yuborgan xabarni srazi ekranga reaktiv qo'shamiz (F5 shart emas)
      setMessages((prev) => [...prev, data]);

      // 3. Socket orqali sherigimizga real vaqtda uchiramiz
      socket.emit("sendMessage", data);
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);
    }
  };

  // Global socket tinglovchisi
  useEffect(() => {
    if (!currentUser?._id) return;

    // Har ehtimolga qarshi context yoqilganda ham socketni tekshirib qo'yamiz
    refreshSocketConnection();

    const handleReceiveMessage = (newMessage) => {
      const incomingSenderId = newMessage.sender?._id || newMessage.sender;
      const activeChatUser = selectedUserRef.current;

      // Bildirishnoma ovozi
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Ovoz cheklovi:", e));
      } catch (err) {
        console.error("Audio xatosi:", err);
      }

      // Notification va Badge hisoblash
      setNotifications((prev) => {
        const current = prev[incomingSenderId] || { count: 0, time: 0 };
        const isCurrentActive = activeChatUser && String(incomingSenderId) === String(activeChatUser._id);
        
        return {
          ...prev,
          [incomingSenderId]: {
            count: isCurrentActive ? 0 : current.count + 1,
            time: Date.now(),
          },
        };
      });

      // Aktiv chat ochiq bo'lsa, xabarni ekranga chiqarish
      if (activeChatUser && String(incomingSenderId) === String(activeChatUser._id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(newMessage._id))) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUser?._id]);

  // Chat ochilganda eski xabarlarni yuklash
  useEffect(() => {
    if (!selectedUser?._id || !currentUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${currentUser._id}/${selectedUser._id}`);
        setMessages(data);
      } catch (error) {
        console.error("Xabarlarni yuklashda xatolik:", error);
      }
    };
    fetchMessages();
  }, [selectedUser?._id, currentUser?._id]);

  return (
    <ChatContext.Provider value={{
      messages, setMessages,
      notifications, setNotifications,
      selectedUser, setSelectedUser,
      currentUser, loginUser, logoutUser, sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
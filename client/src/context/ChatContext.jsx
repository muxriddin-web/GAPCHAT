import { createContext, useContext, useState, useEffect, useRef } from "react";
import socket from "../socket"; 
import API from "../api/axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // 🚀 SIDEBAR KUTGANDEK: Notifications mantiqan Obyekt {} shaklida bo'lishi shart!
  const [notifications, setNotifications] = useState({});

  // Reaktiv foydalanuvchi holati
  const [currentUser, setCurrentUser] = useState(() => 
    JSON.parse(localStorage.getItem("userInfo")) || null
  );

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Login bo'lganda context'ni uyg'otish funksiyasi
  const loginUser = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setCurrentUser(userData);
  };

  // Global socket tinglovchisi
  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    // Serverga onlayn bo'lganimizni bildiramiz
    socket.emit("join", currentUser._id);

    const handleReceiveMessage = (newMessage) => {
      const incomingSenderId = newMessage.sender?._id || newMessage.sender;
      const activeChatUser = selectedUserRef.current;

      // 🔊 BILDIRISHNOMA OVOZI: Har qanday yangi xabar kelganda crisp ovoz chalish
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
        audio.volume = 0.6;
        audio.play().catch(e => console.log("Ovoz chalish cheklovi:", e));
      } catch (err) {
        console.error("Audio xatosi:", err);
      }

      // 🔄 AVTOMATIK TEPAGA KO'TARISH & BADGE HISOBLASH:
      // Sidebar notifications[id].time orqali saralaganligi uchun obyektni mukammal yangilaymiz
      setNotifications((prev) => {
        const current = prev[incomingSenderId] || { count: 0, time: 0 };
        const isCurrentActive = activeChatUser && String(incomingSenderId) === String(activeChatUser._id);
        
        return {
          ...prev,
          [incomingSenderId]: {
            count: isCurrentActive ? 0 : current.count + 1,
            time: Date.now(), // Hozirgi vaqtni uramiz, bu Sidebar'da avtomatik uni eng tepaga chiqaradi!
          },
        };
      });

      // Aktiv chat ochiq bo'lsa, xabarni ekranga qo'shish
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

  // Chat ochilganda xabarlarni yuklash
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
      currentUser, loginUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
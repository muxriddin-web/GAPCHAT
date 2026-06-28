import { createContext, useContext, useState, useEffect, useRef } from "react";
import socket from "../socket"; 
import API from "../api/axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // 1. CHATLAR RO'YXATI STATE: Sidebar chatlarini shu yerda saqlab, saralaymiz
  const [chats, setChats] = useState([]);

  // 2. REAKTIV FOYDALANUVCHI: Login bo'lishi bilan tizim srazi tanishi uchun state qildik
  const [currentUser, setCurrentUser] = useState(() => 
    JSON.parse(localStorage.getItem("userInfo"))
  );

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Login bo'lganda foydalanuvchini yangilash funksiyasi
  const loginUser = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setCurrentUser(userData);
  };

  // Foydalanuvchilar/Chatlar ro'yxatini yuklash (Sidebar uchun)
  useEffect(() => {
    if (!currentUser?._id) return;
    
    const fetchChats = async () => {
      try {
        const { data } = await API.get(`/users/${currentUser._id}`); // Backenddagi foydalanuvchilar yo'li
        setChats(data);
      } catch (error) {
        console.error("Chatlarni yuklashda xatolik:", error);
      }
    };
    fetchChats();
  }, [currentUser?._id]);

  // Global socket tinglovchisi
  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    // Smeshni ulash (Soket serverga foydalanuvchi ID sini bildirish)
    socket.emit("join", currentUser._id);

    const handleReceiveMessage = (newMessage) => {
      const incomingSenderId = newMessage.sender?._id || newMessage.sender;
      const activeChatUser = selectedUserRef.current;

      // 🔊 BILDIRISHNOMA OVOZI: Har qanday yangi xabar kelganda ovoz chalish
      try {
        const audio = new Audio("/notification.mp3"); // public/notification.mp3 fayli bo'lishi kerak
        audio.play().catch(e => console.log("Ovoz chalishda xatolik:", e));
      } catch (err) {
        console.error(err);
      }

      // 🔄 CHATNI ENGP TEPAGA KO'TARISH (SORTING LOGIKASI)
      setChats((prevChats) => {
        const filtered = prevChats.filter(c => String(c._id) !== String(incomingSenderId));
        const targetChat = prevChats.find(c => String(c._id) === String(incomingSenderId));
        
        if (targetChat) {
          // Xabar kelgan chatni ro'yxat boshiga qo'yamiz
          return [targetChat, ...filtered];
        }
        return prevChats;
      });

      // 💬 XABAR VA BILDIRISHLARNI TAQSIMLASH
      if (activeChatUser && String(incomingSenderId) === String(activeChatUser._id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(newMessage._id))) return prev;
          return [...prev, newMessage];
        });
      } else {
        setNotifications((prev) => {
          if (prev.some((n) => String(n._id) === String(newMessage._id))) return prev;
          return [newMessage, ...prev];
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
        
        // O'qilgan chat bildirishnomalarini o'chirib tashlash
        setNotifications((prev) => prev.filter(n => String(n.sender?._id || n.sender) !== String(selectedUser._id)));
      } catch (error) {
        console.error("Xabarlarni yuklashda xatolik:", error);
      }
    };
    fetchMessages();
  }, [selectedUser?._id]);

  return (
    <ChatContext.Provider value={{
      messages, setMessages,
      notifications, setNotifications,
      selectedUser, setSelectedUser,
      chats, setChats,
      currentUser, loginUser // Login uchun kerakli funksiyalar
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
import { createContext, useContext, useState, useEffect, useRef } from "react";
import socket from "../socket"; // mavjud socket instansingiz
import API from "../api/axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));

  // Stale closure (eski yopilish) muammosini ref orqali hal qilamiz
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Global socket tinglovchisi (Ilova ochiq tursa doim ishlaydi)
  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    const handleReceiveMessage = (newMessage) => {
      const incomingSenderId = newMessage.sender?._id || newMessage.sender;
      const activeChatUser = selectedUserRef.current;

      // 1. Agar xabar kelgan paytda aynan o'sha odam bilan chat ochiq bo'lsa
      if (activeChatUser && String(incomingSenderId) === String(activeChatUser._id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(newMessage._id))) return prev;
          return [...prev, newMessage];
        });
      } else {
        // 2. Agar chat yopiq bo'lsa yoki boshqa odam yozgan bo'lsa (Unga sahifani refresh qilish shart emas!)
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

  // Chat ochilganda xabarlarni bazadan yuklash funksiyasi
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
  }, [selectedUser?._id]);

  return (
    <ChatContext.Provider value={{
      messages, setMessages,
      notifications, setNotifications,
      selectedUser, setSelectedUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
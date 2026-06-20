import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; 
import ChatArea from "../components/ChatArea"; 
import socket from "../socket.js";

function Home() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [messages, setMessages] = useState([]); 

  // 1. LOGIKA: Foydalanuvchi tizimga kirganda socketda O'ZINI FAQAT BIR MARTA ro'yxatdan o'tkazadi
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("userInfo"));
    if (currentUser?._id) {
      socket.emit("addUser", currentUser._id);
    }
  }, []); // Bo'sh massiv — faqat sahifa ilk bor yuklanganda ishlaydi

  // 2. LOGIKA: Yangi kelgan xabarlarni real-time eshitish (Tinglovchi)
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      // Kelgan xabar hozirgi ochiq turgan chat egasiga tegishlimi?
      const isCurrentChat = 
        selectedUser && 
        (newMessage.sender === selectedUser._id || newMessage.receiver === selectedUser._id);

      if (isCurrentChat) {
        // Agar suhbat ochiq bo'lsa, xabarni silliqgina ekranga qo'shamiz
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // Agar xabar boshqa yopiq chatdan kelgan bo'lsa -> Notification (Xabarnoma) qo'shish logikasi
        setNotifications((prev) => {
          const currentCount = prev[newMessage.sender]?.count || 0;
          return {
            ...prev,
            [newMessage.sender]: {
              count: currentCount + 1,
              time: Date.now(),
            },
          };
        });
      }
    };

    // Socket tinglovchisini yoqamiz
    socket.on("receiveMessage", handleReceiveMessage);

    // Xotirani tozalash (Memory leak va dublikat xabarlarni oldini oladi)
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser]); // Har safar chat almashganda tinglovchi eng oxirgi tanlangan foydalanuvchini ko'ra oladi

  return (
    <div className="flex h-screen bg-[#0f1722] text-white overflow-hidden">
      {/* SIDEBAR */}
      <div className={`w-full md:w-[360px] shrink-0 ${selectedUser ? "max-md:hidden" : "flex"}`}>
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 h-full ${!selectedUser ? "max-md:hidden" : "flex"}`}>
        <ChatArea
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          notifications={notifications}
          setNotifications={setNotifications}
          messages={messages}       
          setMessages={setMessages} 
        />
      </div>
    </div>
  );
}

export default Home;
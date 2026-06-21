import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import socket from "../socket";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import UserProfileModal from "./UserProfileModal";
import TypingIndicator from "./TypingIndicator";
import axios from "axios";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

function ChatArea({ selectedUser, setSelectedUser, notifications, setNotifications, messages, setMessages }) {
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));
  const [openUserProfile, setOpenUserProfile] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Har gal yangi xabar kelganda pastga skroll qilish
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // SOCKET CONNECT
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("addUser", currentUser._id);
    }
  }, []);

  // NOTIFICATION PERMISSION
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((err) => console.log("Audio play error:", err));

      if (Notification.permission === "granted") {
        new Notification(data.senderName, {
          body: data.sticker ? "Sizga stiker yubordi 🎭" : data.text || "Yangi xabar",
          icon: "https://telegram.org/img/t_logo.png",
        });
      }

      if (data.sender !== currentUser?._id) {
        setNotifications((prev) => ({
          ...prev,
          [data.sender]: {
            count: (prev[data.sender]?.count || 0) + 1,
            time: Date.now(),
          },
        }));
      }

      if (selectedUser && selectedUser._id === data.sender) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser]);

  // FETCH MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !currentUser?._id) return;
      try {
        const { data } = await API.get(`/messages/${currentUser._id}/${selectedUser._id}`);
        setMessages(data);
      } catch (error) {
        console.error("Xabarlarni yuklashda xatolik:", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // SEND TEXT MESSAGE
  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    const messageData = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      text: text.trim(),
      senderName: currentUser.username,
    };

    try {
      const { data } = await API.post("/messages", messageData);
      socket.emit("sendMessage", data);
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);
    }
  };

  // SEND STICKER
  const sendStickerHandler = async (sticker) => {
    try {
      const messageData = {
        sender: currentUser._id,
        receiver: selectedUser._id,
        sticker: sticker,
        senderName: currentUser.username,
      };

      const { data } = await API.post("/messages", messageData);
      socket.emit("sendMessage", data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Sticker yuborishda xatolik:", error);
    }
  };

  // SEND IMAGE
  const sendImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data: imageData } = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
        formData
      );

      const messageData = {
        sender: currentUser._id,
        receiver: selectedUser._id,
        image: imageData.data.url,
        senderName: currentUser.username,
      };

      const { data } = await API.post("/messages", messageData);
      socket.emit("sendMessage", data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Rasm yuklashda xatolik:", error);
    }
  };

  // SEND VOICE (Tuzatilgan qism: localhost olib tashlandi, umumiy API ulandi)
  const sendVoiceHandler = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      const { data: uploadData } = await API.post(
        "/upload/voice",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const messageData = {
        sender: currentUser._id,
        receiver: selectedUser._id,
        voice: uploadData.url,
        senderName: currentUser.username,
      };

      const { data } = await API.post("/messages", messageData);
      socket.emit("sendMessage", data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Ovozli xabar yuborishda xatolik:", error);
    }
  };

  // TYPING EFFECT
  useEffect(() => {
    if (!text.trim()) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const timeout = setTimeout(() => {
      setTyping(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [text]);

  // EMPTY CHAT (📱 KLAS QO'SHILDI: max-md:hidden qo'shildi, mobil ekranda siqilishni oldini oladi)
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#071018] max-md:hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="relative z-10 text-center">
          <div className="w-28 h-28 rounded-[35px] bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto flex items-center justify-center text-5xl font-black shadow-2xl shadow-cyan-500/30">
            N
          </div>
          <h1 className="mt-8 text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            NexChat
          </h1>
          <p className="mt-4 text-slate-400 text-lg">
            Suhbatni boshlash uchun chatni tanlang
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Asosiy chat maydoni */}
      <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden bg-[#071018] text-white h-screen">
        
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[140px]" />
          <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full bg-cyan-400/5 blur-[140px]" />
        </div>

        {/* TOPBAR */}
        <div className="w-full h-[70px] md:h-[85px] border-b border-white/5 bg-[#0e1621]/80 backdrop-blur-md flex items-center justify-between px-6 relative z-10">
          
          {/* Chap tomon: Profil qismi */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#17212b] flex items-center justify-center hover:bg-[#223040] transition"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <div
              onClick={() => setOpenUserProfile(true)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <img
                src={selectedUser?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
                alt=""
                className="w-12 h-12 md:w-13 md:h-13 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition"
              />
              <div>
                <h2 className="font-bold text-base md:text-lg group-hover:text-blue-400 transition">{selectedUser.username}</h2>
                <p className="text-xs md:text-sm text-green-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Onlayn
                </p>
              </div>
            </div>
          </div>

          {/* O'ng tomon: Chatdan chiqish tugmasi */}
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium text-sm border border-red-500/10 active:scale-95 shadow-sm"
            title="Chatdan chiqish"
          >
            <FiLogOut className="text-base md:text-lg" />
            <span className="hidden sm:inline">Chatdan chiqish</span>
          </button>

        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative z-10 flex flex-col gap-6 scrollbar-thin">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentUser={currentUser}
              setMessages={setMessages}
            />
          ))}
          {typing && (
            <div className="transition-all animate-fade-in">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT PANELS */}
        <div className="w-full relative z-10 border-t border-white/5 bg-[#0e1621]">
          <ChatInput
            text={text}
            setText={setText}
            sendMessageHandler={sendMessageHandler}
            sendImageHandler={sendImageHandler}
            sendStickerHandler={sendStickerHandler}
            sendVoiceHandler={sendVoiceHandler}
          />
        </div>
      </div>

      {/* USER PROFILE MODAL */}
      <UserProfileModal
        open={openUserProfile}
        setOpen={setOpenUserProfile}
        user={selectedUser}
      />
    </>
  );
}

export default ChatArea;
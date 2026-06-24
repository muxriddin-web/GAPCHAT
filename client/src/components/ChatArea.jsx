import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useChat } from "../context/ChatContext"; 
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import UserProfileModal from "./UserProfileModal";
import TypingIndicator from "./TypingIndicator";
import axios from "axios";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

function ChatArea() {
  const { selectedUser, setSelectedUser, messages, setMessages } = useChat();
  
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));
  const [openUserProfile, setOpenUserProfile] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Push Notification
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Typing effect logic
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

  // 1. SEND TEXT MESSAGE
  const sendMessageHandler = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSendingRef.current || !selectedUser?._id) return;

    const currentText = text.trim();
    setText(""); 

    const messageData = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      text: currentText,
      senderName: currentUser.username,
    };

    try {
      isSendingRef.current = true;
      const { data } = await API.post("/messages", messageData);
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(data._id))) return prev;
        return [...prev, data];
      });
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);
      setText(currentText);
    } finally {
      isSendingRef.current = false;
    }
  };

  // 2. SEND STICKER
  const sendStickerHandler = async (sticker) => {
    if (isSendingRef.current || !selectedUser?._id) return;
    try {
      isSendingRef.current = true;
      const messageData = {
        sender: currentUser._id,
        receiver: selectedUser._id,
        sticker: sticker,
        senderName: currentUser.username,
      };

      const { data } = await API.post("/messages", messageData);
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(data._id))) return prev;
        return [...prev, data];
      });
    } catch (error) {
      console.error("Sticker yuborishda xatolik:", error);
    } finally {
      isSendingRef.current = false;
    }
  };

  // 3. SEND IMAGE (ImgBB)
  const sendImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file || isSendingRef.current || !selectedUser?._id) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      isSendingRef.current = true;
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
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(data._id))) return prev;
        return [...prev, data];
      });
    } catch (error) {
      console.error("Rasm yuklashda xatolik:", error);
    } finally {
      isSendingRef.current = false;
    }
  };

  // 4. SEND VOICE
  const sendVoiceHandler = async (audioBlob) => {
    if (isSendingRef.current || !selectedUser?._id) return;
    try {
      isSendingRef.current = true;
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
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(data._id))) return prev;
        return [...prev, data];
      });
    } catch (error) {
      console.error("Ovozli xabar yuborishda xatolik:", error);
    } finally {
      isSendingRef.current = false;
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#071018] text-white/40">
        <p className="text-lg">Yozishishni boshlash uchun chatni tanlang</p>
      </div>
    );
  }

  return (
    <>
      {/* 🚀 MD:H-SCREEN VA H-[100DVH] -> Mobil brauzer panellari ostida qolib ketishni oldini oladi */}
      <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden bg-[#071018] text-white h-[100dvh] md:h-screen">
        
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[140px]" />
          <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full bg-cyan-400/5 blur-[140px]" />
        </div>

        {/* 🚀 TOPBAR: "shrink-0" qo'shildi (Hech qachon siqilib yo'q bo'lmaydi) va qat'iy joylashdi */}
        <div className="w-full h-[70px] md:h-[85px] shrink-0 border-b border-white/5 bg-[#0e1621] flex items-center justify-between px-4 md:px-6 relative z-20 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            {/* 🚀 ORQAGA QAYTISH TUGMASI: Mobilda bosh sahifaga (chatlar ro'yxatiga) qaytaradi */}
            <button
              onClick={() => setSelectedUser(null)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#17212b] flex items-center justify-center hover:bg-[#223040] transition active:scale-95 shrink-0"
              title="Orqaga qaytish"
            >
              <FiArrowLeft className="text-xl text-slate-300" />
            </button>
            
            <div
              onClick={() => setOpenUserProfile(true)}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
            >
              <img
                src={selectedUser?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
                alt=""
                className="w-11 h-11 md:w-13 md:h-13 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-sm md:text-lg group-hover:text-blue-400 transition truncate text-slate-200">
                  {selectedUser?.username}
                </h2>
                <p className="text-[11px] md:text-sm text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> onlayn
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium text-xs md:text-sm border border-red-500/10 active:scale-95"
            title="Chatdan chiqish"
          >
            <FiLogOut className="text-base" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative z-10 flex flex-col gap-6 scrollbar-thin">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id || msg.createdAt || Math.random()} 
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
        <div className="w-full relative z-10 border-t border-white/5 bg-[#0e1621] shrink-0">
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

      <UserProfileModal
        open={openUserProfile}
        setOpen={setOpenUserProfile}
        user={selectedUser}
      />
    </>
  );
}

export default ChatArea;
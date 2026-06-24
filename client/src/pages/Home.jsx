// client/src/pages/Home.jsx
import React from "react";
import Sidebar from "../components/Sidebar"; // Loyihangizdagi sidebar komponenti
import ChatArea from "../components/ChatArea";
import { useChat } from "../context/ChatContext"; // Context hookni ulaymiz

function Home() {
  // 🚀 ChatArea ga prop sifatida hech narsa uzatish shart emas! Allaqachon global contextda bor.
  const { selectedUser } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#071018]">
      {/* Sidebar qismi (SelectedUser bo'lsa mobilda yashirinadi) */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-[350px] lg:w-[400px] h-full border-r border-white/5`}>
        <Sidebar />
      </div>

      {/* Chat qismi (SelectedUser yo'q bo'lsa mobilda yashirinadi) */}
      <div className={`${!selectedUser ? "hidden md:flex" : "flex"} flex-1 h-full`}>
        <ChatArea />
      </div>
    </div>
  );
}

export default Home;
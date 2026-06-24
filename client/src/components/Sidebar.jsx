import { useState, useEffect } from "react";
import API from "../api/axios";
import { useChat } from "../context/ChatContext"; // Global Context
import { FiSearch, FiLogOut } from "react-icons/fi"; // FiLogOut ikonkasini qo'shdik

function Sidebar() {
  const { setSelectedUser, selectedUser, notifications, setNotifications } = useChat();
  
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));

  // 1. AKTIV CHATLAR RO'YXATINI BAZADAN YUKLASH
  useEffect(() => {
    if (!currentUser?._id) return;
    
    const fetchChats = async () => {
      try {
        const { data } = await API.get(`/messages/chats/${currentUser._id}`);
        setChats(data);
      } catch (error) {
        console.error("Chatlarni yuklashda xatolik:", error);
      }
    };

    fetchChats();
  }, [currentUser?._id, selectedUser]);

  // 2. GLOBAL QIDIRUV MANTIQI
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const { data } = await API.get(`/messages/search?query=${searchQuery}`);
        setSearchResults(data);
      } catch (error) {
        console.error("Qidiruvda xatolik:", error);
      }
    };

    const delayDebounce = setTimeout(searchUsers, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 3. FOYDALANUVCHI BOSILGANDA ISHLAYDIGAN FUNKSIYA
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setNotifications((prev) => prev.filter((n) => String(n.sender) !== String(user._id)));
  };

  // Tizimdan chiqish (Logout) funksiyasi
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.reload(); // Sahifani yangilab, login oynasiga otib yuboradi
  };

  const displayUsers = searchQuery.trim() ? searchResults : chats;

  return (
    <div className="w-full h-full bg-[#0e1621] flex flex-col text-white">
      
      {/* 🌟 1. SIZNING SHAXSIY PROFILINGIZ (HEADER PART) */}
      <div className="p-4 border-b border-white/5 bg-[#0e1621] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentUser?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
            alt="Mening Profilim"
            className="w-10 h-10 rounded-xl object-cover border border-white/10"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate text-white">{currentUser?.username}</h2>
            <p className="text-[11px] text-blue-400">Mening profilim</p>
          </div>
        </div>
        
        {/* Chiqish tugmasi */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition duration-150 active:scale-95"
          title="Tizimdan chiqish"
        >
          <FiLogOut className="text-lg" />
        </button>
      </div>

      {/* 2. QIDIRUV PANEL (SEARCH) */}
      <div className="p-4 border-b border-white/5 bg-[#0e1621]">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#17212b] border border-transparent focus:border-blue-500/50 outline-none text-sm transition placeholder:text-white/30"
          />
        </div>
      </div>

      {/* 3. CHATLAR VA FOYDALANUVCHILAR RO'YXATI */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.02] scrollbar-thin">
        {displayUsers.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">
            {searchQuery.trim() ? "Foydalanuvchi topilmadi" : "Hech qanday chat mavjud emas"}
          </div>
        ) : (
          displayUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const hasNotification = notifications.some((n) => String(n.sender) === String(user._id));

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-150 relative ${
                  isSelected ? "bg-[#2b5278]" : "hover:bg-[#17212b]"
                }`}
              >
                {/* PROFIL RASMI VA ONLAYN STATUS */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || "https://i.imgur.com/HeIi0wU.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0e1621]" />
                  )}
                </div>

                {/* FOYDALANUVCHI NOMI VA BILDIRISHNOMA */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate text-white">{user.username}</h3>
                    {hasNotification && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">
                    {user.isOnline ? "onlayn" : "oflayn"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sidebar;
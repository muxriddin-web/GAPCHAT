import { useEffect, useState, useMemo, useCallback } from "react";
import ProfileModal from "./ProfileModal";
import { FiLogOut, FiSearch, FiTrash2 } from "react-icons/fi";
import API from "../api/axios";

function Sidebar({ selectedUser, setSelectedUser, notifications = {}, setNotifications }) {
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem("userInfo")) || {});
  
  const [users, setUsers] = useState([]); // Eski chatlar
  const [search, setSearch] = useState(""); // Qidiruv matni
  const [searchResults, setSearchResults] = useState([]); // Global qidiruv natijalari
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // 1. GET CHATS (Eski faol chatlar ro'yxatini yuklash)
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser?._id) return;
      try {
        const { data } = await API.get(`/messages/chats/${currentUser._id}`);
        const deletedChats = JSON.parse(localStorage.getItem("deletedChats")) || [];

        const filtered = data.filter(
          (u) => u._id !== currentUser?._id && !deletedChats.includes(u._id)
        );
        setUsers(filtered);
      } catch (error) {
        console.error("FETCH CHATS ERROR:", error);
      }
    };

    fetchChats();
  }, [currentUser?._id]);

  // 2. GLOBAL SEARCH (Foydalanuvchilarni bazadan qidirish)
  useEffect(() => {
    const searchGlobalUsers = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        // Backend'dagi global qidiruv endpointiga so'rov yuboramiz
        const { data } = await API.get(`/messages/search?query=${search}`);
        
        // Ro'yxatdan o'zimizni olib tashlaymiz
        const filtered = data.filter((u) => u._id !== currentUser?._id);
        setSearchResults(filtered);
      } catch (error) {
        console.error("GLOBAL SEARCH ERROR:", error);
      }
    };

    // Render bepul serverini qiynamaslik uchun 400ms debounce (kutish) qo'shamiz
    const delayDebounceFn = setTimeout(() => {
      searchGlobalUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentUser?._id]);

  // 3. OPTIMALLASHISH: Qidiruv holatiga qarab foydalanuvchilarni ko'rsatish
  const processedUsers = useMemo(() => {
    // Agar qidiruv maydoni to'ldirilgan bo'lsa, global qidiruv natijasini ko'rsatamiz
    if (search.trim()) {
      return searchResults;
    }

    // Agar qidiruv bo'sh bo'lsa, eski chatlarni xabarlar vaqtiga qarab saralab ko'rsatamiz
    return [...users].sort((a, b) => {
      const aTime = notifications?.[a?._id]?.time || 0;
      const bTime = notifications?.[b?._id]?.time || 0;
      return bTime - aTime;
    });
  }, [users, search, searchResults, notifications]);

  const logoutHandler = useCallback(() => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  }, []);

  const deleteChatHandler = useCallback((e, userId) => {
    e.stopPropagation();
    const deletedChats = JSON.parse(localStorage.getItem("deletedChats")) || [];
    const updated = [...deletedChats, userId];

    localStorage.setItem("deletedChats", JSON.stringify(updated));
    setUsers((prev) => prev.filter((user) => user._id !== userId));
    
    setSelectedUser(null);
    setSelectedChat(null);
  }, [setSelectedUser]);

  return (
    <div className="w-[360px] max-md:w-[90px] glass border-r border-white/5 flex flex-col h-screen bg-[#0e1621]/90 backdrop-blur-xl">
      
      {/* LOGO */}
      <div className="h-[90px] px-6 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/20 select-none">
            N
          </div>
          <div className="max-md:hidden select-none">
            <h1 className="text-xl font-black tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NexChat
            </h1>
            <p className="text-xs text-slate-500 font-medium">Modern Messenger</p>
          </div>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div
        onClick={() => setOpenProfile(true)}
        className="p-4 mx-2 my-2 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition duration-200 select-none group"
      >
        <img
          src={currentUser?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
          alt=""
          className="w-12 h-12 md:w-13 md:h-13 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition"
        />
        <div className="max-md:hidden flex-1 min-w-0">
          <h2 className="font-bold text-base text-slate-200 truncate">
            {currentUser?.username || "Foydalanuvchi"}
          </h2>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Onlayn
          </p>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="p-3 max-md:hidden shrink-0">
        <div className="h-[48px] bg-[#17212b]/60 focus-within:border-blue-500/50 rounded-xl px-4 flex items-center gap-3 border border-white/5 transition">
          <FiSearch className="text-slate-500 text-lg" />
          <input
            type="text"
            placeholder="Global qidiruv (username yozing)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* USERS / CHATS LIST */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1 scrollbar-thin">
        {processedUsers.length === 0 && search.trim() && (
          <p className="text-center text-slate-500 text-sm py-4">Foydalanuvchi topilmadi</p>
        )}
        
        {processedUsers.map((u) => {
          const hasNotification = notifications?.[u._id]?.count > 0;
          const isSelected = selectedUser?._id === u._id;

          return (
            <div
              key={u._id}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedChat(selectedChat?._id === u._id ? null : u);
              }}
              onClick={() => {
                setSelectedUser(u);
                if (hasNotification) {
                  setNotifications((prev) => ({
                    ...prev,
                    [u._id]: { count: 0, time: 0 },
                  }));
                }
              }}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border select-none
                ${isSelected
                  ? "bg-gradient-to-r from-blue-500/15 to-cyan-400/5 border-blue-500/20 shadow-md"
                  : "border-transparent hover:bg-white/5"
                }
              `}
            >
              {/* AVATAR & STATUS */}
              <div className="relative shrink-0">
                <img
                  src={u?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
                  alt=""
                  className="w-12 h-12 md:w-13 md:h-13 rounded-xl object-cover"
                />
                <div className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0e1621]" />
              </div>

              {/* USER INFO */}
              <div className="flex-1 max-md:hidden min-w-0">
                <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-blue-400" : "text-slate-200"}`}>
                  {u?.username}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {search.trim() ? "Yangi suhbat boshlash" : "Suhbatni ochish..."}
                </p>
              </div>

              {/* NOTIFICATION BADGE */}
              {hasNotification && !isSelected && (
                <div className="max-md:absolute max-md:top-2 max-md:right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {notifications[u._id].count}
                </div>
              )}

              {/* TRASH / DELETE BUTTON */}
              {selectedChat?._id === u._id && (
                <button
                  onClick={(e) => deleteChatHandler(e, u._id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition active:scale-95 shadow-md shadow-red-500/20 z-10"
                  title="Chatni o'chirish"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* LOGOUT BUTTON */}
      <div className="p-3 shrink-0 border-t border-white/5">
        <button
          onClick={logoutHandler}
          className="w-full h-[48px] rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all duration-200 flex items-center justify-center gap-2 text-red-400 font-semibold text-sm active:scale-95"
        >
          <FiLogOut className="text-base" />
          <span className="max-md:hidden">Chiqish</span>
        </button>
      </div>

      {/* PROFILE MODAL */}
      {openProfile && (
        <ProfileModal
          open={openProfile}
          setOpen={setOpenProfile}
        />
      )}
    </div>
  );
}

export default Sidebar;
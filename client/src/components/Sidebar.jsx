import { useEffect, useState, useMemo, useCallback } from "react";
import ProfileModal from "./ProfileModal";
import { FiLogOut, FiSearch, FiTrash2 } from "react-icons/fi";
import API from "../api/axios";
import { useChat } from "../context/ChatContext";

function Sidebar({ selectedUser, setSelectedUser, notifications = {}, setNotifications }) {
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem("userInfo")) || {});
  
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // ✅ GLOBAL CONTEXT LOGIC (sen so‘ragan qismga mos)
  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);

    // notificationlarni tozalash (shu userga tegishli bo‘lsa)
    setNotifications((prev) => {
      const updated = { ...prev };
      if (updated[user._id]) {
        updated[user._id] = { count: 0, time: 0 };
      }
      return updated;
    });
  }, [setSelectedUser, setNotifications]);

  // GET CHATS
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

  // GLOBAL SEARCH
  useEffect(() => {
    const searchGlobalUsers = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await API.get(`/messages/search?search=${search}`);
        const filtered = data.filter((u) => u._id !== currentUser?._id);
        setSearchResults(filtered);
      } catch (error) {
        console.error("GLOBAL SEARCH ERROR:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchGlobalUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentUser?._id]);

  const processedUsers = useMemo(() => {
    if (search.trim()) return searchResults;

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
    <div className={`w-full md:w-[360px] md:shrink-0 glass border-r border-white/5 flex flex-col h-screen bg-[#0e1621]/90 backdrop-blur-xl ${
      selectedUser ? "max-md:hidden" : "flex"
    }`}>

      {/* LOGO */}
      <div className="h-[90px] px-6 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/20 select-none">
            N
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              NexChat
            </h1>
            <p className="text-xs text-slate-500">Modern Messenger</p>
          </div>
        </div>
      </div>

      {/* PROFILE */}
      <div
        onClick={() => setOpenProfile(true)}
        className="p-4 mx-2 my-2 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition"
      >
        <img
          src={currentUser?.profilePic || "https://i.imgur.com/HeIi0wU.png"}
          className="w-12 h-12 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <h2 className="font-bold text-slate-200 truncate">
            {currentUser?.username || "Foydalanuvchi"}
          </h2>
          <p className="text-xs text-green-400">Onlayn</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="p-3">
        <div className="flex items-center gap-3 bg-[#17212b]/60 rounded-xl px-4 h-[48px]">
          <FiSearch className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Global qidiruv..."
            className="bg-transparent flex-1 outline-none text-white"
          />
        </div>
      </div>

      {/* USERS */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
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
              onClick={() => handleSelectUser(u)}   // ✅ YANGI LOGIC
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer ${
                isSelected ? "bg-blue-500/10" : "hover:bg-white/5"
              }`}
            >
              <img
                src={u.profilePic || "https://i.imgur.com/HeIi0wU.png"}
                className="w-12 h-12 rounded-xl"
              />

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white truncate">
                  {u.username}
                </h3>
              </div>

              {hasNotification && !isSelected && (
                <div className="bg-blue-500 text-white text-xs px-2 rounded-full">
                  {notifications[u._id].count}
                </div>
              )}

              {selectedChat?._id === u._id && (
                <button
                  onClick={(e) => deleteChatHandler(e, u._id)}
                  className="absolute right-3 text-red-400"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* LOGOUT */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logoutHandler}
          className="w-full h-[48px] bg-red-500/10 text-red-400 rounded-xl"
        >
          <FiLogOut className="inline mr-2" />
          Chiqish
        </button>
      </div>

      {openProfile && (
        <ProfileModal open={openProfile} setOpen={setOpenProfile} />
      )}
    </div>
  );
}

export default Sidebar;
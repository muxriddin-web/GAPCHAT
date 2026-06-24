import { useState, useEffect } from "react";
import API from "../api/axios";
import { useChat } from "../context/ChatContext"; // 🚀 Global Context'ni ulaymiz
import { FiSearch } from "react-icons/fi";

function Sidebar() {
  // 🔥 Global context'dan kerakli statelarni olamiz
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
  }, [currentUser?._id, selectedUser]); // Har safar chat o'zgarganda ro'yxat yangilanadi

  // 2. GLOBAL QIDIRUV MANTIQI (DEBOUNCE BILAN)
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

  // 3. FOYDALANUVCHI BOSILGANDA ISHLAYDIGAN ASOSIY FUNKSIYA
  const handleSelectUser = (user) => {
    setSelectedUser(user); // 🚀 MATN SHU YERDA: Global holatni o'zgartiradi va ChatArea ochiladi!
    setSearchQuery(""); // Qidiruv oynasini tozalaydi
    setSearchResults([]);

    // Agar shu odamdan kelgan o'qilmagan xabarlar bo'lsa, ularni bildirishnomadan o'chiradi
    setNotifications((prev) => prev.filter((n) => String(n.sender) !== String(user._id)));
  };

  // Qidiruv bo'sh bo'lsa eski chatlar, yozilgan bo'lsa qidiruv natijasi chiqadi
  const displayUsers = searchQuery.trim() ? searchResults : chats;

  return (
    <div className="w-full h-full bg-[#0e1621] flex flex-col text-white">
      {/* QIDIRUV PANEL (SEARCH) */}
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

      {/* CHATLAR VA FOYDALANUVCHILAR RO'YXATI */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.02] scrollbar-thin">
        {displayUsers.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">
            {searchQuery.trim() ? "Foydalanuvchi topilmadi" : "Hech qanday chat mavjud emas"}
          </div>
        ) : (
          displayUsers.map((user) => {
            // Hozirgi tanlangan chatni aniqlash (Dizaynini o'zgartirish uchun)
            const isSelected = selectedUser?._id === user._id;
            
            // Shu foydalanuvchidan yangi xabar bormi yoki yo'qligini tekshirish
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
                    
                    {/* Yangi xabar kelganda yonib-o'chuvchi ko'k nuqta */}
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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // Siz yuborgan axios fayli
import { useChat } from "../context/ChatContext"; // Yangilangan context
import logo from "../assets/logo.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginUser } = useChat(); // Context'dan login funksiyasini olamiz

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const usernameOrEmail = identifier.trim();

    // 1. INPUT TALABI: Faqat `@` belgisi borligini tekshiramiz
    if (!usernameOrEmail.includes("@")) {
      setError("Nikneymda '@' belgisi bo'lishi shart! (Masalan: @user, user@ yoki u@ser)");
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      try {
        // 2. BIRINCHI URINISH: Backendga login so'rovini yuborib ko'ramiz
        response = await API.post("/auth/login", { 
          username: usernameOrEmail, 
          password: password 
        });
      } catch (loginErr) {
        // 3. AVTOMATIK RO'YXATDAN O'TKAZISH: 
        // Agar foydalanuvchi bazada yo'q bo'lsa (404 yoki 400 xatolik bersa), orqa fonda srazi ro'yxatdan o'tkazamiz
        console.log("Yangi foydalanuvchi aniqlandi, hisob yaratilmoqda...");
        
        const cleanName = usernameOrEmail.replace("@", ""); // Toza ism
        
        await API.post("/auth/register", {
          username: usernameOrEmail,
          name: cleanName,
          password: password
        });

        // Ro'yxatdan o'tgach, srazi qaytadan login qilamiz
        response = await API.post("/auth/login", { 
          username: usernameOrEmail, 
          password: password 
        });
      }

      // 4. HAQIQIY MA'LUMOTLARNI SAQLASH:
      // Backenddan kelgan haqiqiy user obyektini (ichida haqiqiy _id si bilan) olamiz
      // Odatda ma'lumot response.data.user yoki to'g'ridan-to'g'ri response.data ichida keladi
      const userData = response.data.user || response.data;

      if (userData) {
        // Context orqali xotirani reaktiv yangilaymiz (sahifani refresh qilish shart emas)
        loginUser(userData); 
        console.log("Tizimga muvaffaqiyatli kirildi:", userData);
        
        // 5. ULTRA TEZKOR NAVIGATSIYA
        navigate("/");
      } else {
        throw new Error("Backenddan noto'g'ri ma'lumot keldi");
      }

    } catch (err) {
      console.error(err);
      setError("Ulanishda xatolik yuz berdi. Internetni yoki backendni tekshiring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Neon effektlar */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -bottom-40 -right-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-cyan-500/30">
        
        {/* LOGO */}
        <div className="flex justify-center mt-6 mb-6"> 
          <img src={logo} alt="GAP Logo" className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]" />
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent mb-8">
          GAP
        </h1>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center mb-4">
            {error}
          </div>
        )}

        {/* FORMA */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2 pl-1">
              Nikneym yoki Email
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
              placeholder="@nikneym"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2 pl-1">
              Parol
            </label>
            <input 
              type="password" 
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* TUGMA */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold p-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-cyan-500/10 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center mt-6"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Kirish"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
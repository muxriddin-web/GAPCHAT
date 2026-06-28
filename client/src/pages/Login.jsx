import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; 
import { useChat } from "../context/ChatContext"; 
import logo from "../assets/logo.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginUser } = useChat(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const usernameOrEmail = identifier.trim();

    if (!usernameOrEmail.includes("@")) {
      setError("Nikneymda '@' belgisi bo'lishi shart! (Masalan: @user)");
      setIsLoading(false);
      return;
    }

    // 🚀 BACKENDDAGI BARCHA IMKONIYATLAR RO'YXATI
    const candidateRoutes = [
      { login: "/users/auth", register: "/users" },               // Traversy/Modern MERN standarti
      { login: "/users/signin", register: "/users/signup" },       // Klassik variant 1
      { login: "/auth/signin", register: "/auth/signup" },         // Klassik variant 2
      { login: "/auth/login", register: "/auth/signup" },          // Aralash variant
      { login: "/auth/login", register: "/auth/register" },        
      { login: "/users/login", register: "/users/register" },
      { login: "/user/login", register: "/user/register" },
      { login: "/login", register: "/register" }
    ];

    let response = null;
    let isSuccess = false;
    let lastTechnicalError = "";

    // Skanerlash sikli (To'g'ri endpointni avtomatik topadi)
    for (const route of candidateRoutes) {
      const currentFullUrl = (API.defaults.baseURL || "") + route.login;
      
      try {
        // 1. Loginga so'rov yuboramiz
        response = await API.post(route.login, { 
          username: usernameOrEmail, 
          email: usernameOrEmail, 
          password 
        });
        isSuccess = true;
        break; 
      } catch (loginErr) {
        // Agar 404 bo'lsa, demak bu endpoint xato, keyingisiga o'tamiz
        if (loginErr.response?.status === 404) {
          lastTechnicalError = `404 -> ${currentFullUrl}`;
          continue;
        }

        // 2. Agar 404 bo'lmasa (masalan, foydalanuvchi topilmadi bo'lsa), endpoint to'g'ri!
        // Shuning uchun srazi ro'yxatdan o'tkazishga urinamiz
        try {
          const cleanName = usernameOrEmail.replace("@", "");
          await API.post(route.register, {
            username: usernameOrEmail,
            email: usernameOrEmail,
            name: cleanName,
            password: password
          });

          // Ro'yxatdan o'tishi bilan srazi qayta login qilamiz
          response = await API.post(route.login, { 
            username: usernameOrEmail, 
            email: usernameOrEmail,
            password 
          });
          isSuccess = true;
          break;
        } catch (regErr) {
          lastTechnicalError = regErr.response?.data?.message || regErr.message;
          continue; 
        }
      }
    }

    try {
      if (isSuccess && response) {
        const userData = response.data.user || response.data;
        
        if (userData) {
          // 🚀 JOMADAN TOKENNI OLAMIZ
          const activeToken = userData.token || userData.user?.token;
          
          // 🚀 ENGl MUHIM QISM: Sahifani F5 qilmasdan global qidiruv srazi ishlashi uchun
          // Axiosning joriy xotirasiga tokenni majburlab joylaymiz
          if (activeToken) {
            API.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
          }

          // Ma'lumotlarni brauzer xotirasiga yozamiz
          localStorage.setItem("userInfo", JSON.stringify(userData));

          // Context xotirasini yangilaymiz
          loginUser(userData); 
          
          console.log("Muvaffaqiyatli ulanish:", userData);
          navigate("/");
        } else {
          throw new Error("Backend tizimi kutilmagan formatda ma'lumot qaytardi.");
        }
      } else {
        setError(`Backend API manzili mos kelmadi!\n\nBiz barcha yo'llarni sinab ko'rdik, ammo server rad etdi.\nOxirgi xatolik: ${lastTechnicalError}`);
      }
    } catch (finalErr) {
      setError(finalErr.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Orqa fondagi neon effektlar */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -bottom-40 -right-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-cyan-500/30">
        
        {/* LOGO */}
        <div className="flex justify-center mt-6 mb-6"> 
          <img src={logo} alt="GAP Logo" className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]" />
        </div>

        {/* Sarlavha */}
        <h1 className="text-4xl font-extrabold text-center tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent mb-8">
          GAP
        </h1>

        {/* Xatolik xabari oynasi */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center mb-4 whitespace-pre-wrap font-mono">
            {error}
          </div>
        )}

        {/* Form Tizimi */}
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

          {/* Kirish Tugmasi */}
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
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

    if (!API.defaults.baseURL || !API.defaults.baseURL.includes("/api")) {
      API.defaults.baseURL = "https://gapchat.onrender.com/api";
    }

    const candidateRoutes = [
      { login: "/auth/login", register: "/auth/register" },       
      { login: "/users/auth", register: "/users" },               
      { login: "/users/signin", register: "/users/signup" },       
      { login: "/auth/signin", register: "/auth/signup" },         
      { login: "/users/login", register: "/users/register" },
      { login: "/login", register: "/register" }
    ];

    let response = null;
    let isSuccess = false;
    let finalErrorMessage = "";

    const authPayload = { 
      username: usernameOrEmail, 
      email: usernameOrEmail, 
      password 
    };

    const cleanName = usernameOrEmail.replace("@", "");
    const registerPayload = {
      username: usernameOrEmail,
      email: usernameOrEmail,
      name: cleanName,
      password: password
    };

    for (const route of candidateRoutes) {
      try {
        response = await API.post(route.login, authPayload);
        isSuccess = true;
        break; 
      } catch (loginErr) {
        const status = loginErr.response?.status;
        const resData = loginErr.response?.data;

        const isHtmlResponse = typeof resData === "string" && (resData.includes("<!DOCTYPE") || resData.includes("Cannot POST"));
        const isRouteNotFound = status === 404 && (isHtmlResponse || !resData);

        if (isRouteNotFound) {
          continue;
        }

        if (status === 404 || status === 400) {
          try {
            await API.post(route.register, registerPayload);
            response = await API.post(route.login, authPayload);
            isSuccess = true;
            break; 
          } catch (regErr) {
            finalErrorMessage = regErr.response?.data?.message || regErr.response?.data?.error || "Ro'yxatdan o'tishda xatolik.";
            break; 
          }
        }

        if (status === 401) {
          finalErrorMessage = resData?.message || resData?.error || "Kiritilgan parol noto'g'ri!";
          break; 
        }

        finalErrorMessage = resData?.message || loginErr.message;
        break;
      }
    }

    try {
      if (isSuccess && response) {
        const userData = response.data.user || response.data;
        
        if (userData) {
          const activeToken = userData.token || userData.user?.token;
          if (activeToken) {
            API.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
          }

          localStorage.setItem("userInfo", JSON.stringify(userData));
          loginUser(userData); 
          
          navigate("/");
        } else {
          throw new Error("Backend kutilmagan formatda ma'lumot qaytardi.");
        }
      } else {
        setError(finalErrorMessage || "Backend server bilan bog'lanib bo'lmadi. Iltimos, internetingizni tekshiring.");
      }
    } catch (finalErr) {
      setError(finalErr.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Orqa fondagi zamonaviy neon nurlar */}
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/15 blur-[140px] rounded-full -top-32 -left-32 pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-blue-600/15 blur-[140px] rounded-full -bottom-32 -right-32 pointer-events-none"></div>

      {/* Asosiy karta */}
      <div className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-cyan-500/40 relative z-10">
        
        {/* Logo qismi */}
        <div className="flex justify-center mb-5"> 
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-3.5 border border-slate-700/50 shadow-inner flex items-center justify-center">
            <img src={logo} alt="GAP Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
          </div>
        </div>

        {/* Sarlavha */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Gapchat
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Xush kelibsiz! Davom etish uchun kiring.
          </p>
        </div>

        {/* Xatolik xabari */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl text-center mb-6 font-mono leading-relaxed animate-shake">
            {error}
          </div>
        )}

        {/* Forma qismi */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-2 pl-1">
              Nikneym yoki Email
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 shadow-inner"
              placeholder="@nikneym"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-2 pl-1">
              Parol
            </label>
            <input 
              type="password" 
              className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer text-sm tracking-wide"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Kirish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

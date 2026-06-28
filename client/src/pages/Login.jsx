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

    // 🚀 AVTOMATIK TUZATUVCHI (Kafolat): 
    // Agar terminal .env o'zgarganini unutgan bo'lsa, axios manzilini majburlab to'g'rilaymiz
    if (!API.defaults.baseURL || !API.defaults.baseURL.includes("/api")) {
      API.defaults.baseURL = "https://gapchat.onrender.com/api";
    }

    // 🚀 BACKEND ENDPOINTLAR RO'YXATI
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
    let lastTechnicalError = "";

    // Skanerlash sikli
    for (const route of candidateRoutes) {
      const currentBase = API.defaults.baseURL;
      const currentFullUrl = currentBase + route.login;
      
      try {
        // 1. Loginga so'rov
        response = await API.post(route.login, { 
          username: usernameOrEmail, 
          password 
        });
        isSuccess = true;
        break; 
      } catch (loginErr) {
        // Agar 404 bo'lsa, keyingi endpointni tekshirish
        if (loginErr.response?.status === 404) {
          lastTechnicalError = `404 -> ${currentFullUrl}`;
          continue; 
        }

        // 2. Avtomatik ro'yxatdan o'tkazish urinishi (400 yoki 401 bo'lsa)
        try {
          const cleanName = usernameOrEmail.replace("@", "");
          await API.post(route.register, {
            username: usernameOrEmail,
            name: cleanName,
            password: password
          });

          // Ro'yxatdan o'tgach qayta login
          response = await API.post(route.login, { 
            username: usernameOrEmail, 
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
          // Tokenni dinamik ushlab qolamiz (F5 muammosini butkul yo'qotish uchun)
          const activeToken = userData.token || userData.user?.token;
          if (activeToken) {
            API.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
          }

          localStorage.setItem("userInfo", JSON.stringify(userData));
          loginUser(userData); 
          
          console.log("Muvaffaqiyatli ulanish:", userData);
          navigate("/");
        } else {
          throw new Error("Backend kutilmagan formatda ma'lumot qaytardi.");
        }
      } else {
        setError(`Backend API manzili mos kelmadi!\n\nOxirgi urinish: ${lastTechnicalError}\n\n💡 Maslahat: Iltimos terminalni Ctrl+C qilib, qayta npm run dev qiling.`);
      }
    } catch (finalErr) {
      setError(finalErr.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -bottom-40 -right-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-cyan-500/30">
        
        <div className="flex justify-center mt-6 mb-6"> 
          <img src={logo} alt="GAP Logo" className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]" />
        </div>

        <h1 className="text-4xl font-extrabold text-center tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent mb-8">
          GAP
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center mb-4 whitespace-pre-wrap font-mono">
            {error}
          </div>
        )}

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
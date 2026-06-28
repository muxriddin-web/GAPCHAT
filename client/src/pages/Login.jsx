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

    // Backendda bo'lishi mumkin bo'lgan barcha an'anaviy auth yo'llari kombinatsiyasi
    const candidateRoutes = [
      { login: "/auth/login", register: "/auth/register" },
      { login: "/users/login", register: "/users/register" },
      { login: "/user/login", register: "/user/register" },
      { login: "/users/login", register: "/users" },
      { login: "/login", register: "/register" }
    ];

    let response = null;
    let isSuccess = false;
    let lastTechnicalError = "";

    // Aqlli skanerlash sikli
    for (const route of candidateRoutes) {
      try {
        // 1. Login qilib ko'ramiz
        response = await API.post(route.login, { username: usernameOrEmail, password });
        isSuccess = true;
        break; 
      } catch (loginErr) {
        // Agar 404 (Topilmadi) bo'lsa, demak backend yo'li boshqacha, keyingi kombinatsiyaga o'tamiz
        if (loginErr.response?.status === 404) {
          lastTechnicalError = `Route ${route.login} mavjud emas (404)`;
          continue;
        }

        // 2. Agar foydalanuvchi bazada bo'lmasa (400, 401 yoki xabar orqali), uni orqa fonda srazi yaratamiz
        try {
          const cleanName = usernameOrEmail.replace("@", "");
          await API.post(route.register, {
            username: usernameOrEmail,
            name: cleanName,
            password: password
          });

          // Ro'yxatdan muvaffaqiyatli o'tgach, srazi qayta login qilamiz
          response = await API.post(route.login, { username: usernameOrEmail, password });
          isSuccess = true;
          break;
        } catch (regErr) {
          lastTechnicalError = regErr.response?.data?.message || regErr.message;
          continue; // Keyingi kombinatsiyaga o'tish
        }
      }
    }

    try {
      if (isSuccess && response) {
        const userData = response.data.user || response.data;
        
        if (userData) {
          loginUser(userData); 
          console.log("Muvaffaqiyatli ulanish:", userData);
          navigate("/");
        } else {
          throw new Error("Backenddan kutilmagan formatda ma'lumot keldi.");
        }
      } else {
        // Agar biror bir endpoint javob bermasa, real xatolikni yuzaga chiqaramiz
        setError(`Backend bilan bog'lanib bo'lmadi. Texnik xato: ${lastTechnicalError || "Ulanish rad etildi"}`);
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
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center mb-4 whitespace-pre-wrap">
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
import React, { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Tezlikni oshirish va qotishlarni oldini olish uchun React 18+ useTransition linyasi
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const usernameOrEmail = identifier.trim();

    // 1. INPUT TALABINI KAMAYTIRISH: Faqat `@` belgisi borligini tekshiradi (boshida, oxirida yoki o'rtasida)
    if (!usernameOrEmail.includes("@")) {
      setError("Nikneymda '@' belgisi bo'lishi shart! (Masalan: @user, user@ yoki u@ser)");
      return;
    }

    // 2. TEZLIKNI MAKSIMALLASHTIRISH: Brauzer interfeysini qotirmasdan silliq o'tish
    startTransition(async () => {
      try {
        // Bu yerga backend API so'rovingiz keladi. Masalan:
        // const response = await api.login({ usernameOrEmail, password });
        
        console.log("Tezkor kirish bajarildi:", { usernameOrEmail, password });
        
        // Muvaffaqiyatli kirgach, srazi Home sahifasiga o'tkazish
        navigate("/");
      } catch (err) {
        setError("Kirishda xatolik yuz berdi. Parol yoki nikni tekshiring.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#070a13] bg-radial-gradient flex items-center justify-center p-4 overflow-hidden relative">
      {/* Orqa fondagi neon effektlar (Dizaynni ideal qilish uchun) */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -bottom-40 -right-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-cyan-500/30">
        
        {/* LOGO QISMI */}
        <div className="flex justify-center mt-6 mb-6"> 
          <img 
            src={logo} 
            alt="GAP Logo" 
            className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.35)] animate-float" 
          />
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent mb-8">
          GAP
        </h1>

        {/* XATOLIK CHIQISHI */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center mb-4 animate-shake">
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
              disabled={isPending}
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
              disabled={isPending}
              required
            />
          </div>

          {/* ULTRA TEZKOR TUGMA */}
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold p-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-cyan-500/10 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center mt-6"
          >
            {isPending ? (
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
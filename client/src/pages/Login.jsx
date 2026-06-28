import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Logotip yo'li

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Bu yerda sizning login API so'rovingiz bo'ladi
    console.log("Login qilish:", { email, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* LOGO QISMI */}
        <div className="flex justify-center mt-12 mb-8"> 
          <img 
            src={logo} 
            alt="GAP Logo" 
            className="w-28 h-28 object-contain drop-shadow-[0_10px_15px_rgba(0,180,216,0.2)]" 
          />
        </div>

        {/* TITLE (SARLAVHA) QISMI */}
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
          GAP
        </h1>

        {/* LOGIN FORMASI */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-slate-400 text-sm block mb-2">Email yoki Username</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Foydalanuvchi nomini kiriting"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Parol</label>
            <input 
              type="password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-4"
          >
            Kirish
          </button>
        </form>

        {/* 💡 Izoh: Bu yerda turgan "Yangi hisob ochish" linki to'liq olib tashlandi! */}
        
      </div>
    </div>
  );
};

export default Login;
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
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#030712",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxSizing: "border-box"
    }}>
      
      {/* Asosiy Karta */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: "28px",
        padding: "36px 30px",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        boxSizing: "border-box"
      }}>
        
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}> 
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            backgroundColor: "#020617",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(51, 65, 85, 0.8)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)"
          }}>
            <img src={logo} alt="GAP Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
          </div>
        </div>

        {/* Sarlavha */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            background: "linear-gradient(to right, #22d3ee, #38bdf8, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 8px 0"
          }}>
            Gapchat
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0", fontWeight: "500" }}>
            Xush kelibsiz! Davom etish uchun kiring.
          </p>
        </div>

        {/* Xatolik */}
        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#f87171",
            fontSize: "12px",
            padding: "12px",
            borderRadius: "14px",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Forma qismi - Elementlar orasidagi masofa qulay va keng (gap: 20px) */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{
              color: "#cbd5e1",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "8px",
              paddingLeft: "4px"
            }}>
              Nikneym yoki Email
            </label>
            <input 
              type="text" 
              style={{
                width: "100%",
                backgroundColor: "#020617",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              placeholder="@nikneym"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label style={{
              color: "#cbd5e1",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "8px",
              paddingLeft: "4px"
            }}>
              Parol
            </label>
            <input 
              type="password" 
              style={{
                width: "100%",
                backgroundColor: "#020617",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div style={{ marginTop: "6px" }}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: "100%",
                background: "linear-gradient(to right, #06b6d4, #3b82f6)",
                color: "#ffffff",
                fontWeight: "700",
                padding: "15px",
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isLoading ? (
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}></div>
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

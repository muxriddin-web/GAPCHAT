import axios from "axios";

const API = axios.create({
  // Skrinshotingizdan aniqlangan backend bazaviy URL manzili
  baseURL: import.meta.env.VITE_API_URL || "https://gapchat.onrender.com/api",
});

// 🚀 HAR QANDAY SO'ROV KETISHDAN OLDIN TOKENNI DINAMIK QO'SHISH (INTERCEPTOR)
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      // Agar backend token obyektini to'g'ridan-to'g'ri yoki ichma-ich bergan bo'lsa tekshiramiz
      const token = parsed.token || parsed.user?.token; 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
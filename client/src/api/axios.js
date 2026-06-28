import axios from "axios";

const API = axios.create({
  baseURL: "https://gapchat.onrender.com/api", // Hosting uchun qat'iy va o'zgarmas manzil
  headers: {
    "Content-Type": "application/json",
  }
});

// 🚀 HAR QANDAY SO'ROV KETISHDAN OLDIN TOKENNI DINAMIK QO'SHISH
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
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
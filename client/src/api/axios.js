import axios from "axios";

const API = axios.create({
  // Netlify'dagi VITE_API_URL havolasiga avtomatik /api ni qo'shib beradi
  baseURL: import.meta.env.VITE_API_URL + "/api", 
});

export default API;
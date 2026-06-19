import axios from "axios";

const API = axios.create({
  // Vaqtincha .env dan emas, to'g'ridan-to'g'ri localhost deb yozib turamiz
  baseURL: "http://localhost:5000/api", 
});

export default API;
// deploy qilish uchun cod
// import axios from "axios";

// const API = axios.create({
//   // Qattiq yozilgan IP o'rniga .env dan o'qiydi
//   baseURL: import.meta.env.VITE_API_URL + "/api", 
// });

// export default API;
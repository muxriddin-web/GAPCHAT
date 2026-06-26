import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // INPUT CHANGE
  const handleChange = (e) => {

    const { name, value } = e.target;

    console.log(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log("FORM DATA:", formData);

    try {

      const response = await API.post(
        "/auth/register",
        formData
      );

      console.log("RESPONSE:", response.data);

      // SAVE USER
      localStorage.setItem(
        "userInfo",
        JSON.stringify(response.data)
      );

      console.log(
        "LOCAL STORAGE:",
        localStorage.getItem("userInfo")
      );

      // REDIRECT
      window.location.href = "/";

    }catch (error) {

  console.log("FULL ERROR:", error);

  console.log(
    "BACKEND MESSAGE:",
    error.response?.data
  );

  alert(
    JSON.stringify(
      error.response?.data
    )
  );

}
  };

  return (

    <div className="w-full min-h-screen bg-[#0f172a] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl">

        {/* LOGO */}
        {/* LOGO QISMI */}
        <div className="flex justify-center mt-6 mb-4 pt-4">
          <img 
            src={logo} 
            alt="GAP Chat Logo" 
            className="w-24 h-24 object-contain drop-shadow-[0_10px_10px_rgba(0,180,216,0.3)]"
          />
        </div>

        {/* SARLAVHA (Yozuvni ham Telegram'dan GAP'ga o'zgartiramiz) */}
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
          GAP
        </h1>

        <p className="text-center text-gray-400 mt-3">
          Create your account
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition"
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition"
            required
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-2xl py-4 text-lg font-semibold text-white shadow-lg"
          >
            Register
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-400 mt-6">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-500 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;
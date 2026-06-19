import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email:"",
    password:"",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const { data } = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify(data)
      );

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Login failed"
      );

    }
  };

  return (
    <div className="w-full h-screen bg-[#0f172a] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#111827] rounded-3xl p-8 shadow-2xl border border-gray-800">

        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Telegram
        </h1>

        <p className="text-gray-400 text-center mt-3">
          Login to your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-5 py-4 outline-none text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-5 py-4 outline-none text-white"
          />

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-2xl py-4 font-semibold text-lg"
          >
            Login
          </button>

        </form>

        <p className="text-center text-gray-400 mt-6">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-blue-500 hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/Utils";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: form.username,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Invalid credentials");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#dce8de] via-[#c8e1c3] to-[#b4d9a8]">

      {/* Header / App Name */}
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-[#2c5f3f] tracking-wide">
          Chess Trainer
        </h1>
        
      </header>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#f1f8f2] border border-[#c8e1c3]  shadow-lg p-8"
      >
        <h2 className="text-3xl font-semibold text-center text-[#2c5f3f] mb-1">
          Welcome Back
        </h2>
        <p className="text-center text-[#4a6b54] mb-6">
          Continue your chess journey
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-[#4a6b54] mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="your_username"
              required
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[#e0f0e4] border border-[#b4d9a8] text-[#2c5f3f] focus:ring-2 focus:ring-[#81c784] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm text-[#4a6b54] mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[#e0f0e4] border border-[#b4d9a8] text-[#2c5f3f] focus:ring-2 focus:ring-[#81c784] outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl font-semibold text-lg bg-[#4caf7f] text-white hover:bg-[#66bb6a] transition shadow-md"
        >
          Login
        </button>

        <p className="text-center text-sm text-[#4a6b54] mt-5">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#2c5f3f] font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

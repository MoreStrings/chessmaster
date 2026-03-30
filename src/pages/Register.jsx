import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/Utils";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    elo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.elo) {
      alert("Please select your level!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to create user.");
        return;
      }

      alert("User created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
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

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#f1f8f2] border border-[#c8e1c3]  shadow-lg p-8 space-y-5"
      >
        <h2 className="text-3xl font-semibold text-center text-[#2c5f3f] mb-2">
          Create Account
        </h2>
        <p className="text-center text-[#4a6b54] mb-5">
          Register to start training
        </p>

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
          <label className="block text-sm text-[#4a6b54] mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@mail.com"
            required
            value={form.email}
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

        <div>
          <label className="block text-sm text-[#4a6b54] font-semibold mb-2">
            Select your level
          </label>
          <div className="flex gap-4 flex-wrap text-[#2c5f3f]">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="elo"
                value="800"
                checked={form.elo === "800"}
                onChange={handleChange}
                className="accent-[#66bb6a]"
              />
              Beginner (800)
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="elo"
                value="1500"
                checked={form.elo === "1500"}
                onChange={handleChange}
                className="accent-[#66bb6a]"
              />
              Intermediate (1500)
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="elo"
                value="2000"
                checked={form.elo === "2000"}
                onChange={handleChange}
                className="accent-[#66bb6a]"
              />
              Advanced (2000)
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold text-lg bg-[#4caf7f] text-white hover:bg-[#66bb6a] transition shadow-md"
        >
          Register
        </button>

        <p className="text-center text-sm text-[#4a6b54] mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2c5f3f] font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

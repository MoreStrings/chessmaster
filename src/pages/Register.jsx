import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/Utils";
import { FaChess, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    elo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.elo) {
      newErrors.elo = "Please select your skill level";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          elo: form.elo,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrors({
          submit:
            errorData.detail || "Failed to create account. Please try again.",
        });
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors({
        submit: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const eloLevels = [
    { value: "800", label: "Beginner", description: "Just starting out" },
    {
      value: "1500",
      label: "Intermediate",
      description: "Some experience",
    },
    {
      value: "2000",
      label: "Advanced",
      description: "Experienced player",
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaChess className="text-blue-400" size={40} />
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text">
              ChessMaster
            </h1>
          </div>
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-400">
            Join thousands of chess players. It only takes a minute.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#303030] p-8 rounded-xl shadow-2xl space-y-5"
        >
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#414141] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errors.username ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">3+ characters</p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#414141] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errors.email ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#414141] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                  errors.password ? "ring-2 ring-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Min. 6 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#414141] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errors.confirmPassword ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Skill Level Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              What's your chess skill level?
            </label>
            <div className="space-y-2">
              {eloLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                    form.elo === level.value
                      ? "border-blue-400 bg-blue-400 bg-opacity-10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="elo"
                    value={level.value}
                    checked={form.elo === level.value}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-sm">{level.label}</p>
                    <p className="text-gray-400 text-xs">{level.description}</p>
                  </div>
                  {form.elo === level.value && (
                    <FaCheck className="text-blue-400" />
                  )}
                </label>
              ))}
            </div>
            {errors.elo && (
              <p className="text-red-400 text-sm mt-2">{errors.elo}</p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex gap-2 text-sm text-gray-400">
            <input type="checkbox" id="terms" className="w-4 h-4 cursor-pointer" />
            <label htmlFor="terms" className="cursor-pointer">
              I agree to the{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-semibold hover:text-blue-300 transition"
            >
              Log in here
            </Link>
          </p>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
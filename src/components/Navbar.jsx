import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // If no token, don't show navbar
  if (!token) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="inset-x-0 bg-[#303030] shadow-md">
      <div className="max-w-7xl mx-auto text-white">
        <div className="flex justify-between items-center h-16 px-5">
          
          <Link
            className="text-2xl font-extrabold hover:text-blue-400 transition"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <div className="text-lg font-semibold flex items-center gap-6">
            <Link to="/puzzle" className="hover:text-blue-400 transition">
              Puzzles
            </Link>

            <Link to="/evaluate" className="hover:text-blue-400 transition">
              Evaluate
            </Link>

            <Link to="/play" className="hover:text-blue-400 transition">
              Play
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

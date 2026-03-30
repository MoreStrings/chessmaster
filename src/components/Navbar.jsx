import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { to: "/puzzle", label: "Puzzles" },
    { to: "/evaluate", label: "Evaluate" },
    { to: "/play", label: "Play" },
  ];

  return (
    <div className="inset-x-0 bg-[#303030] shadow-md">
      <div className="max-w-7xl mx-auto text-white px-5">
        <div className="flex justify-between items-center h-16">
          <Link
            className="text-2xl font-extrabold hover:text-blue-400 transition"
            to="/dashboard"
          >
            Dashboard
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex text-lg font-semibold items-center gap-6">
            {links.map(({ to, label }) => (
              <Link key={to} to={to} className="hover:text-blue-400 transition">
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {/* Hamburger button */}
          <button
            className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-[#262626] px-5 pb-4 flex flex-col gap-3 text-white font-semibold">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="hover:text-blue-400 transition py-1"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-left w-fit"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
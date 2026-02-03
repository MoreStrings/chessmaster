import React, { useState } from 'react'
import { NavLink, useNavigate } from "react-router-dom"
import { FaChess, FaBook, FaGamepad, FaChartLine, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { path: "/dashboard/puzzle", label: "Puzzles", icon: FaBook },
    { path: "/dashboard/evaluate", label: "Evaluate", icon: FaChartLine },
    { path: "/dashboard/play", label: "Play", icon: FaGamepad },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#303030] border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <FaChess className="text-yellow-400" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent">
              ChessMaster
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      isActive
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition"
            >
              <FaUser size={18} />
              <span className="font-semibold">Dashboard</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-yellow-400 transition"
          >
            {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition my-1 ${
                      isActive
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
                    }`
                  }
                >
                  <Icon size={20} />
                  {link.label}
                </NavLink>
              );
            })}
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white transition my-1"
            >
              <FaUser size={20} />
              <span className="font-semibold">Dashboard</span>
            </NavLink>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition w-full my-1"
            >
              <FaSignOutAlt size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const chessFacts = [
  "The longest chess game theoretically possible is 5,949 moves.",
  "The number of possible chess games is greater than the number of atoms in the observable universe.",
  "The word 'checkmate' comes from Persian — 'Shah Mat' meaning 'the king is helpless'.",
  "The first chess-playing machine was built in 1770.",
  "On average, a chess game lasts 40 moves.",
  "The highest recorded chess rating is 2882, achieved by Magnus Carlsen in 2014.",
];

const Home = () => {
  const navigate = useNavigate();
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % chessFacts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#ecfeff] text-slate-800 relative overflow-hidden">

      {/* Floating Background Graphic */}
      <div className="absolute right-[-120px] top-[-80px] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-emerald-200 to-cyan-200 blur-3xl opacity-50" />
      <div className="absolute left-[-120px] bottom-[-120px] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-200 to-emerald-200 blur-3xl opacity-40" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-10 py-6">
        <div className="text-xl font-bold tracking-wide">
          ♟ Chess Trainer
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-md"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex min-h-[calc(100vh-6rem)] items-center justify-center px-6">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl w-full items-center">

          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Train Smarter.
              <br />
              <span className="text-emerald-600">Play Better.</span>
              <br />
              Win More.
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              A minimalist chess training platform designed for serious learners.
              Improve tactical vision, challenge AI, analyze progress, and master the board.
            </p>

            <div className="flex gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 transition"
              >
                Start Training
              </Link>

              <Link
                to="/login"
                className="px-6 py-3 border border-emerald-500 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition"
              >
                I have an account
              </Link>
            </div>

            {/* Rotating Chess Facts */}
            <div className="mt-10 bg-white/70 backdrop-blur-md border border-emerald-200 rounded-xl px-6 py-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-emerald-600 mb-1">
                Did you know?
              </div>
              <p className="text-slate-700 font-medium transition-all duration-500">
                {chessFacts[factIndex]}
              </p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:flex justify-center">
            <img
              src="\src\assets\board.png"
              alt="Chess board"
              className="w-[460px] rounded-3xl shadow-2xl border border-white/50"
            />

            
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;

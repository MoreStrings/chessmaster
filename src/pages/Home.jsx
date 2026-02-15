import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#1c1c1c] to-[#0f172a] text-white">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center max-w-3xl">

          {/* Hero Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Elevate Your <span className="text-indigo-500">Chess Skills</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Train with tactical puzzles, challenge our intelligent AI engine,
            improve your ELO rating, and track your progress like a professional.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-10 text-sm md:text-base">
            <div className="bg-[#1f1f1f] p-4 rounded-xl shadow-md hover:scale-105 transition">
              ♟ Solve Daily Puzzles
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl shadow-md hover:scale-105 transition">
              🤖 Play Against AI
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl shadow-md hover:scale-105 transition">
              📊 Track Your ELO Progress
            </div>
          </div>

          {/* Buttons (UNCHANGED LOGIC) */}
          <div className="flex gap-4 justify-center">
            <Link
              className="mt-3 bg-green-600 px-6 py-2 rounded-lg hover:bg-green-500 transition text-lg font-semibold shadow-md"
              to="/login"
            >
              Login
            </Link>

            <Link
              className="mt-3 bg-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-500 transition text-lg font-semibold shadow-md"
              to="/register"
            >
              Register
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;

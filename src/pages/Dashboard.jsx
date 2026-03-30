import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/Utils";
import { Trophy, Puzzle, Bot } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1a12] text-gray-200">
        <p className="text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const puzzleAccuracy =
    user.total_puzzles > 0
      ? ((user.solved_puzzles / user.total_puzzles) * 100).toFixed(1)
      : 0;

  const aiAccuracy =
    user.total_ai_games > 0
      ? ((user.ai_games_won / user.total_ai_games) * 100).toFixed(1)
      : 0;

  const elo = user.elo || 1200;

  const rank =
    elo < 1000
      ? "Beginner"
      : elo < 1400
      ? "Intermediate"
      : elo < 1800
      ? "Advanced"
      : "Master";

  // Chart data
  const puzzleChartData = [
    { name: "Solved", value: user.solved_puzzles },
    { name: "Remaining", value: user.total_puzzles - user.solved_puzzles },
  ];

  const aiChartData = [
    { name: "Wins", value: user.ai_games_won },
    { name: "Losses", value: user.total_ai_games - user.ai_games_won },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#e8f1f0] to-[#d6e4e3] text-gray-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-wide">
          Welcome back, <span className="text-[#4f8a8b]">{user.username}</span>
        </h1>
        <p className="text-gray-600 mt-1">Track your chess progress and performance</p>
      </div>

      {/* Horizontal split */}
      <div className="flex gap-6">

        {/* Left: Stats - bigger width */}
        <div className="flex-[0.6] flex flex-col gap-6">
          <div className="bg-white/90 p-6 rounded-2xl shadow flex flex-col gap-4">
            <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>

            <div className="flex justify-between items-center">
              <span>Puzzles Solved:</span>
              <span className="font-semibold">{user.solved_puzzles} / {user.total_puzzles}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>AI Wins:</span>
              <span className="font-semibold">{user.ai_games_won} / {user.total_ai_games}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>ELO Rating:</span>
              <span className="font-semibold">{elo} ({rank})</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Puzzle Accuracy:</span>
              <span className="font-semibold">{puzzleAccuracy}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span>AI Win Rate:</span>
              <span className="font-semibold">{aiAccuracy}%</span>
            </div>
          </div>

          {/* Extra motivational card */}
          <div className="bg-white/90 p-4 rounded-2xl shadow text-center text-gray-700 font-medium">
            Keep practicing daily to improve your puzzles and AI performance!
          </div>
        </div>

        {/* Right: Charts - smaller width */}
        <div className="flex-[0.4] flex flex-col gap-6">
          <div className="bg-white/80 p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Puzzle size={18} /> Puzzle Games
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={puzzleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f8a8b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Bot size={18} /> AI Games
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={aiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6aa84f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/Utils";
import { Trophy, Puzzle, Bot } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] text-gray-700">
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

  const combinedAccuracy = (
    (Number(puzzleAccuracy) + Number(aiAccuracy)) / 2
  ).toFixed(1);

  const elo = user.elo || 1200;

  const rank =
    elo < 1000
      ? "Beginner"
      : elo < 1400
      ? "Intermediate"
      : elo < 1800
      ? "Advanced"
      : "Master";

  const performanceData = [
    { name: "Puzzles", value: user.solved_puzzles },
    { name: "AI Wins", value: user.ai_games_won },
  ];

  const trendData = [
    { day: "Mon", score: elo - 80 },
    { day: "Tue", score: elo - 50 },
    { day: "Wed", score: elo - 30 },
    { day: "Thu", score: elo - 10 },
    { day: "Fri", score: elo },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] to-[#eceff1] p-8 text-gray-800">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-wide">
          Welcome back,
          <span className="text-[#4f8a8b] ml-2">{user.username}</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Your learning and practice overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* Puzzle */}
        <div className="bg-[#fafafa] border border-gray-200  p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#4f8a8b] mb-2">
            <Puzzle size={18} />
            <span className="text-sm font-medium">Puzzles</span>
          </div>

          <div className="text-2xl font-semibold">{puzzleAccuracy}%</div>
          <p className="text-xs text-gray-500">
            {user.solved_puzzles} solved of {user.total_puzzles}
          </p>

          <div className="mt-3 h-2 bg-gray-200  overflow-hidden">
            <div
              className="h-full bg-[#4f8a8b]"
              style={{ width: `${puzzleAccuracy}%` }}
            />
          </div>
        </div>

        {/* AI */}
        <div className="bg-[#fafafa] border border-gray-200  p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#6aa84f] mb-2">
            <Bot size={18} />
            <span className="text-sm font-medium">AI Games</span>
          </div>

          <div className="text-2xl font-semibold">{aiAccuracy}%</div>
          <p className="text-xs text-gray-500">
            {user.ai_games_won} wins of {user.total_ai_games}
          </p>

          <div className="mt-3 h-2 bg-gray-200  overflow-hidden">
            <div
              className="h-full bg-[#6aa84f]"
              style={{ width: `${aiAccuracy}%` }}
            />
          </div>
        </div>

        {/* Elo */}
        <div className="bg-[#fafafa] border border-gray-200  p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rating</p>
          <p className="text-3xl font-semibold text-[#d4a017]">{elo}</p>
          <p className="text-xs text-gray-500 mt-1">{rank}</p>
        </div>

        {/* Combined */}
        <div className="bg-gradient-to-br from-[#d4a017] to-[#e6b800] p-5 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} />
            <span className="text-sm font-medium">Overall</span>
          </div>

          <div className="text-3xl font-semibold">{combinedAccuracy}%</div>
          <p className="text-xs opacity-90">Combined accuracy</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-[#fafafa] border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-700">
            Practice Distribution
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f8a8b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#fafafa] border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-700">
            Rating Trend
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6aa84f"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

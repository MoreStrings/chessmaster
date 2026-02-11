import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/Utils";

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
          headers: { "Authorization": `Bearer ${token}` },
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
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // Puzzle Accuracy
  const puzzleAccuracy =
    user.total_puzzles > 0
      ? ((user.solved_puzzles / user.total_puzzles) * 100).toFixed(1)
      : 0;

  // AI Game Accuracy
  const aiAccuracy =
    user.total_ai_games > 0
      ? ((user.ai_games_won / user.total_ai_games) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-[#202020] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.username}!</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Puzzle Stats */}
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Puzzles Played</h2>
          <p className="text-2xl">{user.total_puzzles}</p>
        </div>

        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Puzzles Solved</h2>
          <p className="text-2xl">{user.solved_puzzles}</p>
        </div>

        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Puzzle Accuracy</h2>
          <p className="text-2xl">{puzzleAccuracy}%</p>
        </div>

        {/* AI Game Stats */}
        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">AI Games Played</h2>
          <p className="text-2xl">{user.total_ai_games}</p>
        </div>

        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">AI Games Won</h2>
          <p className="text-2xl">{user.ai_games_won}</p>
        </div>

        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">AI Game Accuracy</h2>
          <p className="text-2xl">{aiAccuracy}%</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

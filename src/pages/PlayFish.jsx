import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Game from "@/components/Game";
import { API_URL } from "@/lib/Utils";

const PlayFish = () => {
  const [playing, setPlaying] = useState(false);
  const [depth, setDepth] = useState(0);
  const [gameId, setGameId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [playerColor, setPlayerColor] = useState("white");

  const navigate = useNavigate();

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

  const handleGameOver = async (userWon) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_URL}/ai/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ won: userWon }),
        });
      } catch (err) {
        console.error("Failed to update AI game stats", err);
      }
    }
    setPlaying(false);
    setGameId(id => id + 1);
  };

  if (loading) {
    return (
      <div className="mixed-app-bg min-h-screen flex items-center justify-center text-[#1f2933]">
        Loading...
      </div>
    );
  }

  const winPercentage =
    user?.total_ai_games > 0
      ? ((user.ai_games_won / user.total_ai_games) * 100).toFixed(1)
      : 0;

  return (
    <div className="mixed-app-bg min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-10 px-4">

      {/* Stats */}
      {user && !playing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">

          <div className="bg-[#f9fdfb] border border-[#dceee6] rounded-xl p-5 text-center shadow-sm">
            <div className="text-xs tracking-wide text-[#5f7d73] uppercase">
              Total Games
            </div>
            <div className="text-3xl font-semibold text-[#1f2933] mt-1">
              {user.total_ai_games}
            </div>
          </div>

          <div className="bg-[#f9fdfb] border border-[#dceee6] rounded-xl p-5 text-center shadow-sm">
            <div className="text-xs tracking-wide text-[#5f7d73] uppercase">
              Wins
            </div>
            <div className="text-3xl font-semibold text-[#6fbf9c] mt-1">
              {user.ai_games_won}
            </div>
          </div>

          <div className="bg-[#f9fdfb] border border-[#dceee6] rounded-xl p-5 text-center shadow-sm">
            <div className="text-xs tracking-wide text-[#5f7d73] uppercase">
              Win Rate
            </div>
            <div className="text-3xl font-semibold text-[#4fa38a] mt-1">
              {winPercentage}%
            </div>
          </div>
        </div>
      )}

      {/* Setup Panel */}
      {!playing && (
        <div className="w-full max-w-md bg-[#f9fdfb] border border-[#dceee6] rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-semibold text-center text-[#1f2933]">
            Play vs Computer
          </h2>

          <p className="text-center text-[#5f7d73] mt-1 mb-6">
            Configure your practice session
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#4a6b60] mb-1">
                Your Color
              </label>
              <select
                className="w-full p-2.5 rounded-lg bg-white border border-[#cfe6dc] text-[#1f2933] focus:ring-2 focus:ring-[#6fbf9c] outline-none"
                value={playerColor}
                onChange={(e) => setPlayerColor(e.target.value)}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#4a6b60] mb-1">
                Engine Strength (Depth)
              </label>
              <select
                className="w-full p-2.5 rounded-lg bg-white border border-[#cfe6dc] text-[#1f2933] focus:ring-2 focus:ring-[#6fbf9c] outline-none"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
              >
                <option value="">Select depth</option>
                {[...Array(15)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Level {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setPlaying(true)}
            disabled={depth === 0}
            className={`w-full mt-6 py-3 rounded-xl font-medium text-lg transition-all 
              ${depth === 0
                ? "bg-[#cfe6dc] text-[#6b8f82] cursor-not-allowed"
                : "bg-[#6fbf9c] hover:bg-[#5cad8a] text-white shadow-sm"
              }`}
          >
            Start Practice
          </button>
        </div>
      )}

      {/* Game Area */}
      {playing && (
        <div className="bg-[#f9fdfb] border border-[#dceee6] p-5 rounded-2xl shadow-sm w-full max-w-5xl">

          <div className="flex justify-between items-center mb-4 text-sm text-[#4a6b60]">
            <div>
              You:{" "}
              <span className="text-[#1f2933] font-semibold capitalize">
                {playerColor}
              </span>
            </div>
            <div>
              Engine Depth:{" "}
              <span className="text-[#1f2933] font-semibold">
                {depth}
              </span>
            </div>
          </div>

          <Game
            key={gameId}
            playerColor={playerColor}
            depth={depth}
            onGameOver={(userWon) => handleGameOver(userWon)}
          />

          {gameId > 0 && (
            <div className="mt-4 text-center text-sm text-[#6fbf9c]">
              Game finished — start a new practice 
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PlayFish;

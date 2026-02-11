import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Game from "@/components/Game";
import { API_URL } from "@/lib/Utils";

const PlayFish = () => {
  const [playing, setPlaying] = useState(false);
  const [depth, setDepth] = useState(0);
  const [playerColor, setPlayerColor] = useState("white");
  const [gameId, setGameId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Fetch user info and AI stats
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

  // Handle game over: update backend and UI
 // in PlayFish.jsx
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
        body: JSON.stringify({ won: userWon }), // <--- send result
      });
    } catch (err) {
      console.error("Failed to update AI game stats", err);
    }
  }
  setPlaying(false);
  setGameId(id => id + 1);
};


  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // Calculate win percentage for display
  const winPercentage =
    user?.total_ai_games > 0
      ? ((user.ai_games_won / user.total_ai_games) * 100).toFixed(1)
      : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 gap-8 p-4">
      
      {/* User AI stats */}
      {user && (
        <div className="flex gap-4 flex-wrap justify-center">
          <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg w-40 text-center">
            <h3 className="font-bold text-lg">Total AI Games</h3>
            <p className="text-2xl mt-2">{user.total_ai_games}</p>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg w-40 text-center">
            <h3 className="font-bold text-lg">Games Won</h3>
            <p className="text-2xl mt-2">{user.ai_games_won}</p>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg w-40 text-center">
            <h3 className="font-bold text-lg">Win %</h3>
            <p className="text-2xl mt-2">{winPercentage}%</p>
          </div>
        </div>
      )}

      {/* Game setup card */}
      {!playing && (
        <div className="text-white text-center p-6 bg-[#1f1f1f] rounded-2xl shadow-xl max-w-md w-full transition-transform hover:scale-105">
          <h2 className="text-2xl font-bold mb-4">Play vs Computer</h2>
          <div className="flex flex-col gap-3 text-left">
            <label className="font-semibold">Select Color:</label>
            <select
              className="p-2 rounded-lg bg-gray-700 text-white"
              value={playerColor}
              onChange={(e) => setPlayerColor(String(e.target.value))}
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>

            <label className="font-semibold mt-3">Select Depth:</label>
            <select
              className="p-2 rounded-lg bg-gray-700 text-white"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
            >
              <option value="">--Depth--</option>
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setPlaying(true)}
            className={`mt-5 px-4 py-2 rounded-lg font-bold text-white shadow-md transition-colors ${
              depth === 0
                ? "opacity-50 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start
          </button>
        </div>
      )}

      {/* Game board */}
      {playing && (
        <div className="bg-[#1f1f1f] p-4 rounded-2xl shadow-2xl flex flex-col gap-4 w-full max-w-4xl">
          <div className="flex justify-between mb-3 text-white font-semibold">
            <span>Player: {playerColor}</span>
            <span>Depth: {depth}</span>
          </div>

          {/* Pass handleGameOver with userWon boolean */}
          <Game
            key={gameId}
            playerColor={playerColor}
            depth={depth}
            onGameOver={(userWon) => handleGameOver(userWon)}
          />

          <div className="mt-3 text-center text-yellow-400">
            {gameId > 0 && <span>Last game completed! Start a new game.</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayFish;

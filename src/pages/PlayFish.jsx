import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Game from "@/components/Game";
import { API_URL } from "@/lib/Utils";
import { FaChess, FaChessKing, FaGraduationCap, FaPlay, FaArrowLeft } from "react-icons/fa";

const PlayFish = () => {
  const [playing, setPlaying] = useState(false);
  const [depth, setDepth] = useState(0);
  const [playerColor, setPlayerColor] = useState("white");
  const [gameId, setGameId] = useState(0);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleGameOver = () => {
    setPlaying(false);
    setGameId((id) => id + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
        <div className="text-center">
          <div className="animate-spin text-yellow-400 mb-4">
            <FaChess size={50} />
          </div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white relative">
      {/* Back Button - Fixed Left Side */}
      <button
        onClick={() => navigate("/dashboard")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600 shadow-lg"
      >
        <FaArrowLeft />
        <span className="font-medium">Back</span>
      </button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {playing ? (
          <Game
            key={gameId}
            playerColor={playerColor}
            depth={depth}
            onGameOver={handleGameOver}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-12 py-12">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold mb-4">
                Play vs <span className="text-yellow-400">Stockfish</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Challenge yourself against one of the strongest chess engines in the world. Select your color, choose the difficulty level, and start playing!
              </p>
            </div>

            {/* Configuration Form */}
            <div className="bg-[#303030] rounded-xl border border-gray-700 p-12 max-w-2xl w-full">
              <div className="space-y-8">
                {/* Color Selection */}
                <div>
                  <label className="flex items-center gap-2 text-xl font-bold mb-6">
                    <FaChessKing className="text-yellow-400" size={24} />
                    Play as:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {["white", "black"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setPlayerColor(color)}
                        className={`px-6 py-4 rounded-lg font-bold transition transform ${
                          playerColor === color
                            ? "bg-yellow-500 text-black scale-105 shadow-lg shadow-yellow-500/50"
                            : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
                        }`}
                      >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="flex items-center gap-2 text-xl font-bold mb-6">
                    <FaGraduationCap className="text-blue-400" size={24} />
                    Difficulty Level:
                  </label>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <select
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full bg-[#3a3a3a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-semibold"
                    >
                      <option value="">Select a depth level...</option>
                      {[...Array(15)].map((_, i) => {
                        const level = i + 1;
                        let difficulty = "";
                        if (level <= 3) difficulty = "Beginner";
                        else if (level <= 7) difficulty = "Intermediate";
                        else if (level <= 11) difficulty = "Advanced";
                        else difficulty = "Expert";

                        return (
                          <option key={level} value={level}>
                            Depth {level} ({difficulty})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {depth > 0 && (
                    <div className="mt-4 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <span className="font-bold text-blue-300">Depth {depth}</span> - 
                        {depth <= 3 && " Great for beginners! Stockfish plays at a learner level."}
                        {depth > 3 && depth <= 7 && " Good challenge! Stockfish plays competitively."}
                        {depth > 7 && depth <= 11 && " Strong opponent! Prepare for a tough match."}
                        {depth > 11 && " Expert level! Only for advanced players."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Your Color:</span>
                    <span className="text-white font-bold capitalize">
                      {playerColor}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-white font-bold">
                      {depth === 0
                        ? "Not selected"
                        : depth <= 3
                        ? "Beginner"
                        : depth <= 7
                        ? "Intermediate"
                        : depth <= 11
                        ? "Advanced"
                        : "Expert"}
                    </span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => setPlaying(true)}
                  disabled={depth === 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition transform flex items-center justify-center gap-3 ${
                    depth === 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg"
                  }`}
                >
                  <FaPlay size={20} />
                  {depth === 0 ? "Select Difficulty to Start" : "Start Game"}
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-[#303030] rounded-xl border border-gray-700 p-8 max-w-2xl w-full">
              <h3 className="text-xl font-bold mb-4">💡 Tips for Playing</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-yellow-400">•</span>
                  <span>Start with lower difficulty levels to build your skills</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-yellow-400">•</span>
                  <span>Playing as White gives you the first-move advantage</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-yellow-400">•</span>
                  <span>Focus on developing your pieces in the opening phase</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-yellow-400">•</span>
                  <span>After the game, use the Analyze feature to review your moves</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayFish;
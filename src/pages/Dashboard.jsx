import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/Utils";
import { FaChess, FaBook, FaGamepad, FaTrophy, FaChartLine, FaFire, FaClock, FaStar, FaBolt, FaCrown, FaRocket } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    win_rate: 0,
    puzzles_solved: 0
  });
  const [recentGames, setRecentGames] = useState([]);

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
        
        localStorage.setItem("user", JSON.stringify(data));
        
        const statsRes = await fetch(`${API_URL}/game/stats/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent games
        const gamesRes = await fetch(`${API_URL}/game/recent/${data.id}?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setRecentGames(gamesData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin text-amber-500 mb-4">
            <FaChess size={50} />
          </div>
          <p className="text-white text-xl font-medium">Loading your chess dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {user ? (
          <>
            {/* Welcome Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-pulse">
                      <FaChess className="text-white text-4xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 animate-bounce"></div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black mb-1">
                      Welcome back, <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">{user.username}</span>! 👋
                    </h2>
                    <p className="text-gray-400 text-lg flex items-center gap-2">
                      <FaRocket className="text-amber-500" />
                      Ready to dominate the board?
                    </p>
                  </div>
                </div>
                
                {/* Achievement Badge */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg hover:scale-105 transition-transform">
                  <FaCrown className="text-yellow-400 text-2xl animate-pulse" />
                  <div>
                    <p className="text-xs text-purple-300 font-semibold">Chess Master</p>
                    <p className="text-sm text-white font-bold">Level {Math.floor(user.elo / 100)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {/* Rating Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Rating</h3>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FaTrophy className="text-amber-400" size={20} />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text mb-2">{user.elo}</p>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-bold border border-amber-500/30">
                    {user.elo < 1000 ? "🌱 Beginner" : user.elo < 1700 ? "⚡ Intermediate" : "🔥 Advanced"}
                  </span>
                </div>
              </div>

              {/* Games Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Games</h3>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FaGamepad className="text-blue-400" size={20} />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text mb-2">{stats.total_games}</p>
                  <p className="text-gray-400 text-sm font-medium">Total battles fought</p>
                </div>
              </div>

              {/* Puzzles Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Puzzles</h3>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FaBook className="text-emerald-400" size={20} />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text mb-2">{stats.puzzles_solved}</p>
                  <p className="text-gray-400 text-sm font-medium">Successfully solved</p>
                </div>
              </div>

              {/* Win Rate Card */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Win Rate</h3>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FaChartLine className="text-purple-400" size={20} />
                    </div>
                  </div>
                  <p className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text mb-2">{stats.win_rate}%</p>
                  <p className="text-gray-400 text-sm font-medium">Victory percentage</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <FaBolt className="text-white animate-pulse" />
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Play vs AI */}
                <Link to="/dashboard/play" className="group relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 rounded-3xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/10 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                      <FaGamepad size={28} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black mb-2 text-white">Play vs AI</h4>
                    <p className="text-blue-100/90 text-sm font-medium leading-relaxed">Challenge Stockfish at any difficulty level</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-200">
                      <span>Start Game</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>

                {/* Daily Puzzles */}
                <Link to="/dashboard/puzzle" className="group relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-8 rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-400/10 to-teal-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                      <FaBook size={28} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black mb-2 text-white">Daily Puzzles</h4>
                    <p className="text-emerald-100/90 text-sm font-medium leading-relaxed">Master tactical patterns and combinations</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-200">
                      <span>Solve Now</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>

                {/* Analyze Position */}
                <Link to="/dashboard/evaluate" className="group relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 p-8 rounded-3xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-purple-400/10 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                      <FaChartLine size={28} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black mb-2 text-white">Analyze Position</h4>
                    <p className="text-purple-100/90 text-sm font-medium leading-relaxed">Deep engine analysis of any board state</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-200">
                      <span>Analyze</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Matches */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 flex items-center justify-center shadow-lg">
                    <FaClock className="text-blue-400" />
                  </div>
                  Recent Matches
                </h3>
                <div className="space-y-4">
                  {recentGames.length > 0 ? (
                    recentGames.map((game) => {
                      const date = new Date(game.played_at);
                      const timeAgo = getTimeAgo(date);
                      
                      return (
                        <div
                          key={game.id}
                          className="group flex justify-between items-center p-5 bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer hover:scale-102"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700/70 to-slate-800/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <FaChess className="text-gray-300 text-lg" />
                            </div>
                            <div>
                              <p className="font-bold text-white mb-1">
                                Stockfish Lv.{game.depth}
                              </p>
                              <p className="text-gray-400 text-xs font-medium">
                                {timeAgo} · {game.moves_count} moves · {game.player_color}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-lg ${
                              game.result === "win"
                                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40"
                                : game.result === "loss"
                                ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/40"
                                : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/40"
                            }`}
                          >
                            {game.result.charAt(0).toUpperCase() + game.result.slice(1)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <FaChess className="text-gray-600 text-3xl mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No games played yet</p>
                      <p className="text-gray-600 text-sm mt-1">Start your first match!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Streak */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-600/30 flex items-center justify-center shadow-lg">
                    <FaFire className="text-orange-400 animate-pulse" />
                  </div>
                  Activity Streak
                </h3>
                <div className="space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/30">
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-400 text-sm font-bold">Total Games</span>
                      <span className="font-black text-amber-400">{stats.total_games}</span>
                    </div>
                    <div className="relative w-full bg-slate-700/40 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 shadow-lg shadow-amber-500/60" style={{ width: `${Math.min((stats.total_games / 20) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/30">
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-400 text-sm font-bold">Win Rate Progress</span>
                      <span className="font-black text-blue-400">{stats.win_rate}%</span>
                    </div>
                    <div className="relative w-full bg-slate-700/40 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/60" style={{ width: `${stats.win_rate}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/20">
                        <p className="text-amber-400/80 text-xs font-bold mb-2 uppercase tracking-wider">Wins</p>
                        <p className="text-3xl font-black text-white flex items-center gap-2">
                          {stats.wins}
                          <FaStar className="text-amber-500 text-xl animate-pulse" />
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/20">
                        <p className="text-purple-400/80 text-xs font-bold mb-2 uppercase tracking-wider">Losses</p>
                        <p className="text-3xl font-black text-white">{stats.losses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No user data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default Dashboard;

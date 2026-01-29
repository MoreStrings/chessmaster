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

  const navigate = useNavigate();


  useEffect(() => {
      const token = localStorage.getItem("token");

      if(!token){
          navigate("/login");
          return;
      }

      const fetchUser = async () => {
          try{
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: {"Authorization": `Bearer ${token}`,},
            });

            if(res.status === 401){
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

          } catch (err){
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
    setGameId(id => id + 1);
  };

  if(loading){
    return <div className="text-white text-center mt-20">Loading...</div>;
  }


  return (
    <div className="flex items-center  min-h-[calc(100vh-4rem)] justify-center">
        { playing && (
          <div className = "">
            <Game key={gameId} playerColor={playerColor} depth={depth} onGameOver={handleGameOver} />
          </div>
        )}

        {!playing && (
          <div className="text-3xl text-white flex items-center flex-col gap-6">
            <div>Play v/s Computer</div>
            <form className="flex gap-4 items-baseline">
              <label htmlFor="depth-select">Play as:</label> 

              <select
                id="depth-select"
                className="bg-[#303030] px-2 py-1 rounded-lg"
                value={playerColor}
                onChange={(e) => setPlayerColor(String(e.target.value))}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>

              <label htmlFor="depth-select">at Depth:</label>

              <select
                id="depth-select"
                className="bg-[#303030] px-2 py-1 rounded-lg"
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
              <button
                onClick={() => setPlaying(true)}
                className={`px-2 py-1 rounded-lg text-white
                            ${depth === 0
                              ? "hidden"
                              : "bg-green-600 hover:bg-green-700"}`}
              >
                Start
              </button>
            </form>
          </div>
        )}
    </div>
  )
}

export default PlayFish
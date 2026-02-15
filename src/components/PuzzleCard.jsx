import {useState, useMemo, useEffect, useRef} from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { API_URL, PROMOTION_IMAGES } from "@/lib/Utils";

const PuzzleCard = ({user, setUser}) => {
    const chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());
    const [moveFrom, setMoveFrom] = useState(null);
    const [over, setOver] = useState("");
    const [optionSquares, setOptionSquares] = useState({});
    const [promotionMove, setPromotionMove] = useState(null);

    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(true);

    const [puzzleInfo, setPuzzleInfo] = useState({
      id:"",
      rating: 0,
    });
    const [session, setSession] = useState({
      totalPuzzles: 0,
      solvedClean: 0,
      madeMistake: false,
      usedHint: false
    });
    const [solution, setSolution] = useState([]);
    const [step, setStep] = useState(0);
    const [playerColor, setPlayerColor] = useState("w");

    const [arrow, setArrow] = useState([]);
    const hasFetched = useRef(false);

    const fetchPuzzle = async ()=> {
      const res = await fetch(`${API_URL}/puzzle/next`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user_id: user.user_id})
      });
      const puzzle = await res.json();

      chess.load(puzzle.FEN);
      const puzzleMoves = puzzle.Moves.split(" ");
      const firstMove = puzzleMoves.shift();

      if(firstMove){
        chess.move({
          from: firstMove.slice(0, 2),
          to: firstMove.slice(2, 4)
        });
      }

      setFen(chess.fen());
      setSolution(puzzleMoves);
      setStep(0);
      setOver("");
      setTime(0);
      setRunning(true);
      setPlayerColor(chess.turn());
      setArrow([]);

      setPuzzleInfo({
        id: puzzle.PuzzleId, 
        rating: puzzle.Rating,
      });

      setSession(prev => ({
        ...prev,
        totalPuzzles: prev.totalPuzzles + 1,
        madeMistake: false,
        usedHint: false,
      }));
    };

    const submitResult = async () => {
      const res = await fetch(`${API_URL}/puzzle/solve`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id: user.user_id,
          puzzle_id: puzzleInfo.id,
          solve_time_seconds: time,
          hints_used: session.usedHint,
          mistakes_made: session.madeMistake,
        }),
      });

      const data = await res.json();
      if(setUser && data.new_rating){
        setUser(prev => ({...prev, elo:data.new_rating}));
      }
    };

    useEffect(() => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        fetchPuzzle();
      }
    }, []);

    useEffect(() => {
      if(!running) return;
      const interval = setInterval(()=> setTime(prev => prev+1), 1000);
      return () => clearInterval(interval);
    }, [running]);

    const showHint = () => {
      const nextMove = solution[step];
      if(!nextMove) return;

      const from = nextMove.slice(0, 2);
      const to = nextMove.slice(2, 4);

      setArrow([{startSquare: from, endSquare: to, color:"green"}]);
      setSession(prev => ({...prev, usedHint: true}));
    };

    const isPromotion = (from , to) => {
      const moves = chess.moves({square: from, verbose: true});
      return moves.some(m => m.to === to && m.promotion);
    };

    const handleMove = (from, to, promotion = null) => {
      if (isPromotion(from, to)) return false;
      if(from === to) return false;

      const move = chess.move({from, to, promotion});
      if(!move) return false;

      if(from + to !== solution[step]){
        chess.undo();
        setFen(chess.fen());
        setSession(prev => ({...prev, madeMistake:true}));
        setOver("❌ Wrong move — try again!");
        return false;
      }

      const nextStep = step + 1;
      setStep(nextStep);
      setFen(chess.fen());

      if (solution[nextStep]) {
        setTimeout(() => {
          chess.move({
            from: solution[nextStep].slice(0, 2),
            to: solution[nextStep].slice(2, 4),
          });
          setFen(chess.fen());
          setStep(nextStep + 1);

          if (nextStep + 1 >= solution.length){
            setOver("✅ Puzzle Solved!");
            setRunning(false);
            submitResult();
            if(!session.madeMistake && !session.usedHint){
              setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1}));
            }
          }
        }, 400);
      } else if (nextStep >= solution.length) {
        setOver("✅ Puzzle Solved!");
        setRunning(false);
        submitResult();
        if(!session.madeMistake && !session.usedHint){
          setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1}));
        }
      }

      setArrow([]);
      return true;
    };

    const onPieceDrop = ({sourceSquare, targetSquare}) => {
      if (isPromotion(sourceSquare, targetSquare)) {
        setPromotionMove({ from: sourceSquare, to: targetSquare });
        return false;
      }
      return handleMove(sourceSquare, targetSquare);
    };

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

  return (
    <div className="flex flex-wrap gap-4">

      {/* Chess Board */}
      <div className="max-w-xl relative border-2 border-[#c0c0c0] shadow-xl rounded-lg overflow-hidden">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop,
            boardOrientation: playerColor === "w" ? "white" : "black",
            arrows: arrow,
            squareStyles: optionSquares,
          }}
        />

        {promotionMove && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 p-2 rounded-lg">
            {["q","r","b","n"].map(p => {
              const piece = promotionColor + p.toUpperCase();
              return (
                <img
                  key={piece}
                  src={PROMOTION_IMAGES[piece]}
                  className="w-11 cursor-pointer hover:scale-110 transition"
                  onClick={() => promote(p)}
                />
              )
            })}
          </div>
        )}
      </div>
      <div className="bg-[#303030] text-white flex flex-col justify-center items-center p-4 border-2 border-[#c0c0c0] rounded-lg min-w-[260px]">

      <div className="text-xl font-bold tracking-wide text-yellow-400">
        {user.username}
      </div>

      <div className="text-sm text-gray-300 mb-1">
        Rating: <span className="font-semibold text-white">{user.elo}</span>
      </div>

      <div className="mt-1 px-3 py-1  bg-black/40 text-white-400 font-mono tracking-widest">
        ⏱ {formatTime(time)}
      </div>

      <div className={`mt-3 px-4 py-1  text-sm font-semibold tracking-wide 
      ${chess.turn() === "w"
        ? "bg-white text-black"
        : "bg-black text-white border border-white"}`}
>
        {chess.turn() === "w" ? "♔ White to move" : "♚ Black to move"}
      </div>


      {/* Side Panel */}
      
      

        <div className="mt-2 text-sm">Puzzle ID: {puzzleInfo.id}</div>
        <div className="text-sm">Rating: {puzzleInfo.rating}</div>

        {/* Progress Bar */}
        <div className="w-full mt-3">
          <div className="text-xs text-gray-300 mb-1">Progress</div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${(step / solution.length) * 100 || 0}%` }}
            />
          </div>
        </div>

        {/* Session Bar */}
        <div className="w-full mt-3">
          <div className="text-xs text-gray-300 mb-1">Session Accuracy</div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{
                width: session.totalPuzzles === 0
                  ? 0
                  : (session.solvedClean / session.totalPuzzles) * 100
              }}
            />
          </div>
          <div className="text-xs mt-1 text-gray-400">
            {session.solvedClean} / {session.totalPuzzles}
          </div>
        </div>

        {over && (
          <div className="mt-3 px-3 py-1 bg-black/40 rounded-lg animate-pulse">
            {over}
          </div>
        )}

        <button
          className="mt-4 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 animate-pulse"
          onClick={showHint}
        >
          Hint
        </button>

        <button
          onClick={fetchPuzzle}
          className="mt-3 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500"
        >
          Next Puzzle
        </button>

      </div>
    </div>
  )
}

export default PuzzleCard;

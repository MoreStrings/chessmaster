import {useState, useMemo, useEffect, useRef} from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { API_URL, PROMOTION_IMAGES } from "@/lib/Utils";
import { FaLightbulb, FaPlay, FaArrowRight, FaTrophy, FaCheck, FaClock, FaFire } from "react-icons/fa";

const PuzzleCard = ({user, setUser}) => {
    const chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());
    const [moveFrom, setMoveFrom] = useState(null);
    const [over, setOver] = useState("");
    const [optionSquares, setOptionSquares] = useState({});
    const [promotionMove, setPromotionMove] = useState(null);
    const [lastMove, setLastMove] = useState(null);

    const[time, setTime] = useState(0);
    const[running, setRunning] = useState(true);

    const [puzzleInfo, setPuzzleInfo] = useState({
      id:"",
      rating: 0,
    });
    const[session, setSession] = useState({
      totalPuzzles: 0,
      solvedClean: 0,
      madeMistake: false,
      usedHint: false
    });
    const [solution, setSolution] = useState([]);
    const [step, setStep] = useState(0);
    const [playerColor, setPlayerColor] = useState("w");

    const [arrow, setArrow] = useState([]);

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
        })
      }

      setFen(chess.fen());
      setSolution(puzzleMoves);
      setStep(0);
      setOver("");
      setTime(0);
      setRunning(true);
      setLastMove(null);
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
        setUser(prev => ({... prev, elo:data.new_rating}));
      }

    };
    const hasFetched = useRef(false);

    useEffect(() => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        fetchPuzzle();
      }
    }, []);

    useEffect(() => {
      let timer;
      if (running) {
        timer = setInterval(() => {
          setTime(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [running]);

    const isPromotion = (from, to) => {
      const piece = chess.get(from);
      return piece?.type === "p" && (to[1] === "8" || to[1] === "1");
    };

    const handleMove = (from, to) => {
      const playedMove = from + to;
      if (playedMove !== solution[step]) {
        setSession(prev => ({ ...prev, madeMistake: true }));
        setOver("Wrong Move!");
        return;
      }
      chess.move({ from, to });
      setFen(chess.fen());
      setLastMove({ from, to });
      setArrow([]);
      const nextStep = step + 1;
      setStep(nextStep);

      if (solution[nextStep]) {
        setTimeout(() => {
          const replyFrom = solution[nextStep].slice(0, 2);
          const replyTo = solution[nextStep].slice(2, 4);

          chess.move({ from: replyFrom, to: replyTo });
          setLastMove({ from: replyFrom, to: replyTo });
          setFen(chess.fen());
          setStep(nextStep + 1);

          if (nextStep + 1 >= solution.length) {
            setOver("Puzzle Solved!");
            setRunning(false);
            submitResult();
            if (!session.madeMistake && !session.usedHint) {
              setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1 }));
            }
          }
        }, 400);
      } else if (nextStep >= solution.length) {
        setOver("Puzzle Solved!");
        setRunning(false);
        submitResult();
        if (!session.madeMistake && !session.usedHint) {
          setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1 }));
        }
      }
    };

    const onPieceDrop = (sourceSquare, targetSquare) => {
      try {
        handleMove(sourceSquare, targetSquare);
        return true;
      } catch {
        return false;
      }
    };

    const getMoveOptions = (square) => {
      const moves = chess.moves({
        square,
        verbose: true,
      });

      if(moves.length === 0){
        setOptionSquares({});
        return false;
      }

      const newSquares = {};
      moves.forEach(move => {
        newSquares[move.to] = {
          background:
            chess.get(move.to) && chess.get(move.to)?.color !== chess.get(square)?.color
              ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
              : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      });

      newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
      setOptionSquares(newSquares);
      return true;

    };

    const onSquareClick = ({square, piece}) => {
      
      if (moveFrom === square) {
        setMoveFrom(null);
        setOptionSquares({});
        setArrow([]);
        return;
      }

      if (!moveFrom && piece) {
       const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      const moves = chess.moves({
        square: moveFrom,
        verbose: true
      });
      const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

      if(!foundMove){
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions? square: "");
        return;
      }

      try{
        if (isPromotion(moveFrom, square)) {
            setPromotionMove({ from: moveFrom, to: square });
            setMoveFrom(null);
            setOptionSquares({});
            return;
        }
        handleMove(moveFrom, square);
      } catch {  
        const hasMoveOptions = getMoveOptions(square);
        if(hasMoveOptions){
          setMoveFrom(square);
        }
        return;
      }

      setMoveFrom("");
      setOptionSquares({});
      setArrow([]);

    };

    const promote = (piece) =>{
        const playedMove = promotionMove.from + promotionMove.to + piece;
        if (playedMove !== solution[step]) {
          setSession(prev => ({ ...prev, madeMistake: true }));
          setOver("Wrong Move!");
          setPromotionMove(null);
          return;
        }
        chess.move({...promotionMove, promotion: piece});
        setFen(chess.fen());
        setLastMove({ from: promotionMove.from, to: promotionMove.to });
        setPromotionMove(null);
        setMoveFrom("");
        setOptionSquares({});

        const nextStep = step + 1;
        setStep(nextStep);

        if (solution[nextStep]) {
          setTimeout(() => {
            const replyFrom = solution[nextStep].slice(0, 2);
            const replyTo = solution[nextStep].slice(2, 4);

            chess.move({ from: replyFrom, to: replyTo });
            setLastMove({ from: replyFrom, to: replyTo });
            setFen(chess.fen());
            setStep(nextStep + 1);

            if (nextStep + 1 >= solution.length) {
              setOver("Puzzle Solved!");
              setRunning(false);
              submitResult();
              if (!session.madeMistake && !session.usedHint) {
                setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1 }));
              }
            }
          }, 400);
        } else if (nextStep >= solution.length) {
          setOver("Puzzle Solved!");
          setRunning(false);
          submitResult();
          if (!session.madeMistake && !session.usedHint) {
            setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1 }));
          }
        }
    };

    const promotionColor = chess.turn() === "w" ? "w" : "b";

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const showHint = () => {
      if (solution[step]) {
        const hint = solution[step];
        const from = hint.slice(0, 2);
        const to = hint.slice(2, 4);
        if(from && to){
          setArrow([{startSquare: from, endSquare: to, color:"green"}]);
          setSession(prev => ({...prev, usedHint: true}));
        }
      }
    };

  return (
    <div className="bg-[#1a1a1a] h-screen overflow-hidden p-2 md:p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-white">Chess Puzzles</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* Chessboard Section */}
          <div className="lg:col-span-2 overflow-auto">
            <div className="bg-[#303030] rounded-lg p-4 border border-gray-700 shadow-xl h-full flex flex-col">
              {/* Puzzle Status */}
              <div className="mb-3">
                {over ? (
                  <div className={`text-center p-2 rounded-lg font-bold text-sm ${
                    over === "Puzzle Solved!" 
                      ? "bg-green-600/20 text-green-400 border border-green-600" 
                      : "bg-red-600/20 text-red-400 border border-red-600"
                  }`}>
                    {over}
                  </div>
                ) : (
                  <div className="text-center p-2 bg-[#252525] rounded-lg border border-gray-600">
                    <p className="text-gray-300 text-xs mb-0.5">Current Turn</p>
                    <p className="text-white font-bold text-sm">
                      {chess.turn() === "w" ? "White to move" : "Black to move"}
                    </p>
                  </div>
                )}
              </div>

              {/* Chessboard */}
              <div className="bg-black rounded-lg p-2 mb-3 flex justify-center">
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <Chessboard 
                    options={{
                      position: fen, 
                      onPieceDrop, 
                      onSquareClick, 
                      squareStyles: optionSquares, 
                      boardOrientation: (playerColor === "w" ? "white" : "black"), 
                      arrows: arrow
                    }}
                  />
                </div>
              </div>

              {/* Promotion Dialog */}
              {promotionMove && (
                <div className="flex justify-center gap-2 mb-3 bg-[#252525] p-2 rounded-lg border border-gray-600">
                  <p className="text-white mr-2 flex items-center text-sm">Choose:</p>
                  {["q", "r", "b", "n"].map(p => {
                    const piece = promotionColor + p.toUpperCase();
                    return (
                      <button
                        key={piece}
                        onClick={() => promote(p)}
                        className="hover:scale-110 transition transform"
                      >
                        <img
                          src={PROMOTION_IMAGES[piece]}
                          alt={piece}
                          width={35}
                          className="cursor-pointer hover:opacity-80"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={showHint}
                  disabled={!solution[step]}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm"
                >
                  <FaLightbulb size={14} />
                  Get Hint
                </button>
                <button
                  onClick={fetchPuzzle}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm"
                >
                  <FaArrowRight size={14} />
                  Next Puzzle
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-3 overflow-auto">
            {/* Player Info and Session Stats */}
            <div className="flex gap-3">
              {/* Player Info */}
              <div className="flex-1 bg-[#303030] rounded-lg p-3 border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1">
                  <FaTrophy className="text-yellow-400" />
                  Player Info
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs">Username</p>
                    <p className="text-white font-bold text-sm">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Current Rating</p>
                    <p className="text-yellow-400 font-bold text-lg">{user.elo}</p>
                  </div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="flex-1 bg-[#303030] rounded-lg p-3 border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1">
                  <FaFire className="text-red-400" />
                  Session Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#252525] rounded p-2 border border-gray-600">
                    <div className="flex items-center gap-1">
                      <FaCheck className="text-green-400 text-xs" />
                      <span className="text-gray-300 text-xs">Solved Clean</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">{session.solvedClean}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#252525] rounded p-2 border border-gray-600">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-blue-400 text-xs" />
                      <span className="text-gray-300 text-xs">Time</span>
                    </div>
                    <span className="text-blue-400 font-bold font-mono text-xs">{formatTime(time)}</span>
                  </div>
                  <div className="text-center bg-[#252525] rounded p-2 border border-gray-600">
                    <p className="text-gray-400 text-xs">Total Puzzles</p>
                    <p className="text-white font-bold text-lg">{session.totalPuzzles}</p>
                  </div>
                  {session.madeMistake && (
                    <div className="bg-red-600/20 border border-red-600 rounded p-1 text-center">
                      <p className="text-red-400 text-xs font-semibold">⚠ Mistake</p>
                    </div>
                  )}
                  {session.usedHint && (
                    <div className="bg-yellow-600/20 border border-yellow-600 rounded p-1 text-center">
                      <p className="text-yellow-400 text-xs font-semibold">💡 Hint</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Puzzle Info */}
            <div className="bg-[#303030] rounded-lg p-3 border border-gray-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1">
                <FaPlay className="text-blue-400" />
                Puzzle Info
              </h3>
              <div className="space-y-2">
                <div className="bg-[#252525] rounded p-2 border border-gray-600">
                  <p className="text-gray-400 text-xs">Puzzle ID</p>
                  <p className="text-white font-mono font-bold text-xs">{puzzleInfo.id || "Loading..."}</p>
                </div>
                <div className="bg-[#252525] rounded p-2 border border-gray-600">
                  <p className="text-gray-400 text-xs">Puzzle Rating</p>
                  <p className="text-orange-400 font-bold text-sm">{puzzleInfo.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PuzzleCard
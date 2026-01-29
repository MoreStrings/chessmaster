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
      // console.log(puzzle);

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
      setPlayerColor(chess.turn());
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

    useEffect(() => 
    {
      if(!running) return;
      const interval = setInterval(()=> {
        setTime(prev => prev+1);
      }, 1000);
      return () => clearInterval(interval);
    }, [running]);

    const showHint = () => {
      const nextMove = solution[step];
      if(!nextMove) return;

      const from = nextMove.slice(0, 2);
      const to = nextMove.slice(2, 4);

      // console.log(from, to);

      if(from && to){
        setArrow([{startSquare: from, endSquare: to, color:"green"}]);
        setSession(prev => ({...prev, usedHint: true}));
      }
    };

    const isPromotion = (from , to) =>{
        const moves = chess.moves({square: from, verbose: true});
        return moves.some(m => m.to === to && m.promotion);
    };

    const handleMove = (from, to, promotion = null) => {

      if (isPromotion(from, to)) {
        return false;
      }

      if(from == to) return false;
      const move = chess.move({from, to, promotion});
      if(!move) return false;

      if(from + to !== solution[step]){
        chess.undo();
        setFen(chess.fen());
        setSession(prev => ({...prev, madeMistake:true}));
        setOver("Wrong Move!");
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
            setOver("Puzzle Solved!");
            setRunning(false);
            submitResult();
            if(!session.madeMistake && !session.usedHint){
              setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1}));
            }
          }
        }, 400);
      } else if (nextStep >= solution.length) {
        setOver("Puzzle Solved!");
        setRunning(false);
        submitResult();
        if(!session.madeMistake && !session.usedHint){
          setSession(prev => ({ ...prev, solvedClean: prev.solvedClean + 1}));
        }
      }

      setArrow([]);

      return true;
    };

    const onPieceDrop = ({sourceSquare, targetSquare, piece}) => {
      // console.log(sourceSquare, targetSquare, piece);
      if (isPromotion(sourceSquare, targetSquare)) {
        setPromotionMove({ from: sourceSquare, to: targetSquare });
        return false;
      }
      return handleMove(sourceSquare, targetSquare);
    };

    const getMoveOptions = (square) =>{
      const moves = chess.moves({
        square, verbose: true
      });
      // console.log(square);
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

            // check if puzzle is done
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

  return (
    <div>
        <div className="flex flex-wrap">
            <div className = "max-w-xl relative border-2 border-[#c0c0c0]">
                <Chessboard options={{position: fen, onPieceDrop, onSquareClick, squareStyles: optionSquares, boardOrientation: (playerColor === "w"? "white": "black"), arrows: arrow}}/>
                {promotionMove && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 p-2 rounded-lg">

                    {["q", "r", "b", "n"].map(p => {
                        const piece = promotionColor + p.toUpperCase();

                        return(
                            <div className="cursor-pointer p-1.5 rounded-1.5 bg-[#333]" key={piece} >
                                <img
                                    src={PROMOTION_IMAGES[piece]}
                                    alt={piece}
                                    width={45}
                                    onClick={() => promote(p)}
                                />
                            </div>
                        )
                    })}            

                    </div>
                )}

            </div>
            <div className="bg-[#303030] text-white flex flex-col justify-center items-center p-4 border-2 border-[#c0c0c0] basis-full md:basis-auto">
              <div className="font-semibold mb-3">{user.username}({user.elo})</div>
              <div className="text-lg font-semibold">Puzzle Info</div>
              <div>{chess.turn() === "w"? "White to move": "Black to move"}</div>
              <div>Puzzle ID: {puzzleInfo.id}</div>
              <div>Rating: {puzzleInfo.rating}</div>
              <div className="m-2">Time: {formatTime(time)}</div>
              {over && <div className="mt-2 text-red-400">{over}</div>}
              <div>Solved this Session: {session.solvedClean} / {session.totalPuzzles}</div>
              <button
                className="mt-4 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500"
                onClick={showHint}
              >
                Hint
              </button>
              <button
                onClick={fetchPuzzle}
                className="mt-4 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500"
              >
                Next Puzzle
              </button>
            </div>
        </div>

    </div>
  )
}

export default PuzzleCard
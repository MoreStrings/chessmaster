import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { PROMOTION_IMAGES } from "@/lib/Utils";
import { createStockfish, playMove } from "@/engine/stockfish";

const Game = ({playerColor, depth , onGameOver}) => {
    const chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());
    const [over, setOver] = useState("");
    const [moveFrom, setMoveFrom] = useState(null);
    const [optionSquares, setOptionSquares] = useState({});
    const [promotionMove, setPromotionMove] = useState(null);
    const [moves, setMoves] = useState([]);
    const [currentMove, setCurrentMove] = useState(0);

    const engineRef = useRef(null);
    const engineBusyRef = useRef(false);

    const navigate = useNavigate();
    
    useEffect(() => {
      if (engineRef.current) return;
      engineRef.current = createStockfish();
    }, []);

    useEffect(() => {
      if(engineBusyRef.current || over) return;
      const turn = new Chess(fen).turn();
      const engineColor = playerColor === "white" ? "b" : "w";
      if (turn !== engineColor) return;
      makeEngineMove();
    }, [fen]);

    useEffect(() => {
      if(over !== "" && engineRef.current) {
        engineRef.current.terminate();
        engineRef.current = null;
      }
    }, [over])

    const handleEvaluate = () => {
      const fullPgn = chess.pgn();
      const movesOnly = fullPgn.split(/\r?\n\r?\n/)[1] || "";
      navigate("/evaluate", {
        state: {
          pgn: movesOnly,
        }
      });
    };

    const makeEngineMove = async () => {
      if (engineBusyRef.current) return;
      engineBusyRef.current = true;
      try{
        const bestMove = await playMove(engineRef.current, fen, depth);
        const promotion = bestMove.length > 4 ? bestMove.charAt(4) : undefined;
        const move = chess.move({
          from: bestMove.slice(0,2),
          to: bestMove.slice(2,4),
          promotion: promotion,
        });
        if (!move) return;
        setFen(chess.fen());
        setMoves(chess.history({ verbose: true }));
        setCurrentMove(chess.history({verbose: true}).length - 1);
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "black" : "white";
            setOver(winner === playerColor ? "You Win!" : "You Lose!");
          }

          if (chess.isDraw()) {
            setOver("Draw");
          }
        }
      } finally {
          engineBusyRef.current = false;
      }
    };

    const isPromotion = (from , to) =>{
        const moves = chess.moves({square: from, verbose: true});
        return moves.some(m => m.to === to && m.promotion);
    };

    const onPieceDrop = ({sourceSquare, targetSquare, piece}) => {
        if (isPromotion(sourceSquare, targetSquare)) {
          setPromotionMove({ from: sourceSquare, to: targetSquare });
          return false;
        }
        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
        });

        if(!move) return false;

        setFen(chess.fen());
        setMoves(chess.history({ verbose: true }));
        setCurrentMove(prev => prev + 1);
        
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "black" : "white";
            setOver(winner === playerColor ? "You Win!" : "You Lose!");
          }

          if (chess.isDraw()) {
            setOver("Draw");
          }
        }
        return true;
    };

    const getMoveOptions = (square) =>{
      const moves = chess.moves({
        square, verbose: true
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
              ? "radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)"
              : "radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      });

      newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
      setOptionSquares(newSquares);
      return true;

    };

    const onSquareClick = (square) => {
      // Block clicks when engine is thinking or game is over
      if (engineBusyRef.current || over) return;
      
      if (!moveFrom) {
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
        chess.move({
          from: moveFrom,
          to: square,
        });
      } catch {
        const hasMoveOptions = getMoveOptions(square);
        if(hasMoveOptions){
          setMoveFrom(square);
        }
        return;
      }

      setFen(chess.fen());
      setMoves(chess.history({ verbose: true }));
      setCurrentMove(chess.history({verbose: true}).length - 1);
      setMoveFrom(null);
      setOptionSquares({});

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          const winner = chess.turn() === "w" ? "black" : "white";
          setOver(winner === playerColor ? "You Win!" : "You Lose!");
        }

        if (chess.isDraw()) {
          setOver("Draw");
        }
      }
    };

    const promote = (piece) => {
      if (!promotionMove) return;
      const move = chess.move({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece,
      });
      
      if (!move) return;
      
      setFen(chess.fen());
      setMoves(chess.history({ verbose: true }));
      setCurrentMove(chess.history({verbose: true}).length - 1);
      setPromotionMove(null);
      setMoveFrom(null);
      setOptionSquares({});

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          const winner = chess.turn() === "w" ? "black" : "white";
          setOver(winner === playerColor ? "You Win!" : "You Lose!");
        }

        if (chess.isDraw()) {
          setOver("Draw");
        }
      }
    };

  return (
    <div className="">
      <div className="flex flex-wrap">
        <div className="max-w-xl border-2 border-[#c0c0c0]">
          <Chessboard options={{position: fen, onPieceDrop, onSquareClick, boardOrientation: playerColor, squareStyles: optionSquares}}/>
        </div>

        <div className="w-64 border-2 border-[#c0c0c0] bg-[#303030] overflow-y-auto h-80 lg:h-144 basis-full md:basis-1/2 lg:basis-auto">
          <ol className="text-sm text-white">
              {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
                const w = moves[i * 2];
                const b = moves[i * 2 + 1];

                return (
                  <li key={i} className="odd:bg-[#202020] even:bg-[#303030]">
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-3 px-3 py-1">
                      <div className="w-6">{i + 1}.</div>

                      <div
                        className={`cursor-pointer hover:bg-[#505050] px-1 rounded ${
                          currentMove === i * 2 ? "bg-[#505050]" : ""
                        }`}
                      >
                        {w?.san}
                      </div>

                      <div
                        className={`cursor-pointer hover:bg-[#505050] px-1 rounded ${
                          currentMove === i * 2 + 1 ? "bg-[#505050]" : ""
                        }`}
                      >
                        {b?.san}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
        </div>

      </div>
      {promotionMove && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 p-2 rounded-lg">

          {["q", "r", "b", "n"].map(p => {
              const piece = chess.turn() + p.toUpperCase();

              return(
                  <div className="cursor-pointer p-1.5 rounded-1.5 bg-[#333]"  key={piece}>
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
      {over !== "" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#202020] border-2 border-[#c0c0c0] rounded-xl p-6 text-white flex flex-col gap-4 min-w-70">
            <div className="text-2xl font-semibold text-center">
              {over}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onGameOver}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
              >
                Play Again
              </button>

              <button
                onClick={handleEvaluate}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
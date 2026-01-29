import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const EvaluationBoard = ({fen, moves, analysis}) => {

    const [currentFen, setCurrentFen] = useState(fen);
    const [currentMove, setCurrentMove] = useState(moves.length - 1);
    const [squareStyles, setSquareStyles] = useState({});
    const [sidebarView, setSidebarView] = useState("stats");
    const [arrow, setArrow] = useState([]);
    const lastMove = moves[currentMove];

    const categoryColors = {
        blunder: "rgba(255, 0, 0, 0.5)",
        mistake: "rgba(255, 165, 0, 0.5",
        inaccuracy: "rgba(255, 255, 0, 0.4)",
        best: "rgba(0, 255, 2, 0.4)",
        book: "rgba(0, 0, 255, 0.4)"
    };

    const categoryStickers = {
        blunder: "⁉️",
        mistake: "❌",
        inaccuracy: "⚠️",
        best: "✅",
        book: "📖"
    };

    const getFenAtMove = (moveIndex) => {
        const tempChess = new Chess();
        for(let i = 0; i <= moveIndex; i++){
            tempChess.move(moves[i].san, {sloppy: true});
        }
        return tempChess.fen();
    }

    useEffect(() => {
        if (!moves || moves.length === 0) return;
        const fenAtMove = getFenAtMove(currentMove);
        setCurrentFen(fenAtMove);
        
        if(analysis.results[currentMove].bestMove !== "(none)"){
            const bestMoveFrom = analysis.results[currentMove].bestMove.slice(0, 2);
            const bestMoveTo = analysis.results[currentMove].bestMove.slice(2, 4);
            setArrow([{startSquare: bestMoveFrom, endSquare: bestMoveTo, color:"green"}]);
        } else { setArrow([])}

    }, [currentMove]);

    useEffect(() => {
        setCurrentMove(moves.length - 1);
        setCurrentFen(fen);
        // console.log(analysis);
    }, [fen, moves, analysis]);

    useEffect(() => {
        const moveListContainer = document.querySelector('.overflow-y-auto.h-144');
        const el = document.getElementById(`move-${currentMove}`);
        if (moveListContainer && el) {
            moveListContainer.scrollTo({
                top: el.offsetTop - moveListContainer.offsetTop,
                behavior: "smooth"
            });
        }
    }, [currentMove]);

    useEffect(() => {
        if (!lastMove) {
            setSquareStyles({});
            return;
        }

        const moveCategory = analysis.results[currentMove]?.category || "";
        const highlightColor = categoryColors[moveCategory] || "rgba(255, 255, 0, 0.4)";

        const newSquareStyles = {
            [lastMove.from]: { backgroundColor: highlightColor },
            [lastMove.to]: { backgroundColor: highlightColor}
        };

        setSquareStyles(newSquareStyles);
    }, [lastMove]);

  return (
    <div>
        <div className="flex flex-wrap">
            <div className="max-w-xl border-2 border-[#c0c0c0] relative">
                <Chessboard options={{
                    position: currentFen,
                    squareStyles,
                    arrows: arrow,
                }}/>
                {lastMove && analysis.results[currentMove]?.category && (
                    <StickerOverlay
                        square={lastMove.to}
                        sticker={categoryStickers[analysis.results[currentMove].category]}
                    />
                )}
            </div>
            <div className="w-64 border-2 border-[#c0c0c0] bg-[#303030] overflow-y-auto h-80 xl:h-144 basis-full md:basis-1/2 lg:basis-auto">
                <div className="flex bg-black text-sm font-semibold">
                    <button 
                        onClick={() => setSidebarView("stats")}
                        className={`flex-1 py-2 ${sidebarView === "stats"? "bg-[#404040]": "text-white/50 hover:text-white"}`}
                    >Stats</button>
                    <button
                        onClick={() => setSidebarView("moves")}
                        className={`flex-1 py-2 ${sidebarView === "moves"? "bg-[#404040]": "text-white/50 hover:text-white"}`}
                    >Moves</button>
                </div>
                
                {sidebarView === "moves" && analysis && (
                    <ol className="text-sm">
                        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
                        const w = moves[i * 2];
                        const b = moves[i * 2 + 1];
                        return (
                            <li key={i} className="odd:bg-[#202020] even:bg-[#303030]">
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-4 px-3 py-1">
                                    
                                    <div className="w-8">{i + 1}.</div>
                                    
                                    <div
                                        id = {`move-${i * 2}`} 
                                        className={`p-0.5 cursor-pointer hover:bg-[#505050] flex justify-between ${currentMove === i * 2 ? "bg-[#505050]": ""}`} 
                                        onClick={() => setCurrentMove(i * 2)}>
                                            <span>{w?.san}</span> <span className="text-white/20">{analysis.results[i * 2]?.displayEval || ""}</span>
                                    </div>
                                    
                                    <div
                                        id = {`move-${i * 2 + 1}`} 
                                        className={`p-0.5 cursor-pointer hover:bg-[#505050] flex justify-between ${currentMove === i * 2  + 1 ? "bg-[#505050]": ""}`} 
                                        onClick={() => moves[i * 2 + 1]? setCurrentMove(i * 2 + 1): null}>
                                            <span>{b?.san || ""}</span> <span className="text-white/20">{analysis.results[i * 2 + 1]?.displayEval || ""}</span>
                                    </div>
                                
                                </div>
                            </li>
                        );
                        })}
                    </ol>
                )}

                {sidebarView === "stats" && analysis && (
                    <div className="p-3 text-sm space-y-4">
                        <div>
                            <div className="font-bold mb-1">Opening Played</div>
                            <div>{analysis.openingName}</div>
                        </div>
                        <div>
                            <div className="font-bold mb-1">Accuracy</div>
                            <div className="flex justify-between">
                                <span>White</span>
                                <span>{analysis.accuracyBoth.whiteAccuracy}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Black</span>
                                <span>{analysis.accuracyBoth.blackAccuracy}%</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold mb-1">Avg. Centipawn Loss</div>
                            <div className="flex justify-between">
                                <span>White</span>
                                <span>{analysis.acplBoth.whiteACPL}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Black</span>
                                <span>{analysis.acplBoth.blackACPL}</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold mb-1">Move Summary:</div>
                            <div className="flex justify-between font-bold"><span>White</span><span>Black</span></div>
                            {["blunder", "mistake", "inaccuracy", "best", "book"].map(cat => (
                                <div key={cat} className="flex justify-between text-xs">
                                <span>{analysis.moveStats.whiteStats[cat]} </span>
                                <span className="capitalize">{cat}</span>
                                <span>{analysis.moveStats.blackStats[cat]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sidebarView === "moves" && (
                    <div className="sticky bottom-0 flex justify-between items-center h-10 bg-black font-extrabold text-2xl text-white/30 p-5">
                        <div
                            className="px-2 bg-[#404040] cursor-pointer rounded-lg select-none" 
                            onClick={() => {setCurrentMove(prev => Math.max(0, prev - 1))}}
                            disabled={currentMove === 0}
                        >
                            {`<`}
                        </div>
                        <span className="text-xs">Best Move: {analysis.results[currentMove]?.bestMove}</span>
                        <div
                            className="px-2 bg-[#404040] cursor-pointer rounded-lg select-none"
                            onClick={() => {setCurrentMove(prev => Math.min(moves.length - 1, prev + 1))}}
                            disabled={currentMove === moves.length - 1}
                        >
                            {`>`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
};

export default EvaluationBoard


const StickerOverlay = ({ square, sticker }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, size: 0 });

  useEffect(() => {
    const el = document.getElementById(`chessboard-square-${square}`); // or data-square attribute
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent.getBoundingClientRect();
      setPos({
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        size: rect.width
      });
    }
  }, [square]);

  if (!pos.size) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: pos.top - 15,
        left: pos.left + pos.size - 15, // top-right corner
        pointerEvents: "none",
        fontSize: "20px",
        zIndex: 50
      }}
    >
      {sticker}
    </div>
  );
};
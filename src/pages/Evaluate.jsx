import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useNavigate, useLocation } from "react-router-dom";
import EvaluationBoard from "@/components/EvaluationBoard";
import { createStockfish, evalFen } from "@/engine/stockfish";
import { findOpening } from "@chess-openings/eco.json";
import { API_URL } from "@/lib/Utils";
import { openings } from "@/lib/openings"

const Evaluate = () => {
    const [chess, setChess] = useState(() => new Chess());
    const [pgn, setPgn] = useState("");
    const [fen, setFen] = useState(chess.fen());
    const [moves, setMoves] = useState([]);
    const [showSubmit, setShowSubmit] = useState(false);
    const [analysis, setAnalysis] = useState({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [eta, setEta] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const location = useLocation();
    const gameData = location.state;

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

    useEffect(() => {
        if (gameData?.pgn) {
            setPgn(gameData.pgn);
            setShowSubmit(true);
        }
    }, [gameData?.pgn]);

    const buildFenList = (moves) => {
        const game = new Chess();
        return moves.map(m => {
            game.move(m.san, {sloppy: true});
            return game.fen();
        })
    };

    const cplToAccuracy = (cpl) => {
        const capped = Math.min(cpl, 300);
        const accuracy = 100 * Math.exp(-capped / 85);
        return Math.max(0, Math.min(100, accuracy));
    };

    const getAccuracy = (results) => {
        let whiteAccSum = 0;
        let blackAccSum = 0;
        let whiteMoves = 0;
        let blackMoves = 0;

        results.forEach((r, i) => {
            if(r.category === "book") return;
            if(r.mate !== null) return;

            const acc = cplToAccuracy(r.absCPL);

            if(i % 2 === 0){
                whiteAccSum += acc;
                whiteMoves++;
            } else {
                blackAccSum += acc;
                blackMoves++;
            }
        });

        return {
            whiteAccuracy: whiteMoves? +(whiteAccSum / whiteMoves).toFixed(1): 0,
            blackAccuracy: blackMoves? +(blackAccSum / blackMoves).toFixed(1): 0,
        };

    };

    const getACPL = (results) => {
        let whiteLoss = 0;
        let blackLoss = 0;
        let whiteMoves = 0;
        let blackMoves = 0;

        results.forEach((r, i) => {
            if (r.category === "book") return;
            if (r.mate !== null) return;

            if(i % 2 == 0){
                whiteLoss += r.absCPL;
                whiteMoves++;
            } else {
                blackLoss += r.absCPL;
                blackMoves++;
            }
        });

        return {
            whiteACPL: whiteMoves? Math.round(whiteLoss / whiteMoves) : 0,
            blackACPL: blackMoves? Math.round(blackLoss / blackMoves) : 0,
        };
    };

    const getCategoryStats = (results) => {

        const stats = {
            white: {book: 0, best: 0, good: 0,  mistake: 0, inaccuracy: 0, blunder: 0},
            black: {book: 0, best: 0, good: 0,  mistake: 0, inaccuracy: 0, blunder: 0},
        }

        results.forEach((r, i) => {
            const side = i % 2 === 0 ? "white": "black";
            stats[side][r.category] ??=0;
            stats[side][r.category]++;
        });

        return {whiteStats: stats.white, blackStats: stats.black};

    };

    const reviewGame = async (fenList, moves) => {
        setIsAnalyzing(true);
        setEta( Math.ceil(fenList.length * 0.5) );

        const engine = createStockfish();
        const results = [];
        let prevEval = 0;
        let prevBestMove = null;
        let openingName = null;

        (async () => {
            for(let i = 0; i < fenList.length; i++){
                const {evalCp, bestMove, mate} = await evalFen(engine, fenList[i], 500);
                let currentEval = evalCp;
                let displayEval;

                if(mate !== null){
                    displayEval = `M${Math.abs(mate)}`;
                    if(mate < 0) displayEval = '-' + displayEval;
                    else displayEval = '+' + displayEval;
                } else {
                    const evalFloat = currentEval / 100;
                    displayEval = evalFloat > 0? `+${evalFloat.toFixed(1)}`: evalFloat.toFixed(1);
                }

                let absCPL = Math.abs(prevEval - currentEval);
                
                let category = "good";  

                if(i<10){
                    const opening = findOpening(openings, fenList[i]);

                    const moveSan = moves[i].san;
                    if(opening?.moves?.split(" ").includes(moveSan)){
                        category = "book";
                        openingName = opening.name;
                    }
                }

                if(category !== "book"){
                    if (absCPL >= 190) category = "blunder";
                    else if (absCPL >= 100) category = "mistake";
                    else if (absCPL >= 50) category = "inaccuracy";
                    const move = moves[i].from + moves[i].to;
                    if (move === prevBestMove) {
                        category = "best";
                    }
                }

                results.push({
                    evalCp,
                    displayEval,
                    mate,
                    category,
                    bestMove,
                    absCPL
                });

                prevEval = currentEval;
                prevBestMove = bestMove;
            }

            engine.terminate();
            // console.log("engine done analyzing");
            // setAnalysis(results);
            const acplBoth = getACPL(results);
            const accuracyBoth = getAccuracy(results);
            const moveStats = getCategoryStats(results);
            

            const fullyAnalysis = {openingName, results, acplBoth, accuracyBoth, moveStats};
            setAnalysis(fullyAnalysis);
            setIsAnalyzing(false);

        })();
    };

    const handlePgnSubmit = (e) => {
        e.preventDefault();

        const game = new Chess();
        try{

            const cleanPgn = pgn
                .replace(/\{[^}]*\}/g, "")
                .replace(/\([^)]*\)/g, "")
                .replace(/\[%[^\]]*\]/g, "")
                .trim();

            game.loadPgn(cleanPgn, {sloppy:true})

            // console.log(game)
            setChess(game);
            setFen(game.fen());
            setMoves(game.history({verbose: true}));
            const fenList = buildFenList(game.history({verbose: true}));

            reviewGame(fenList, game.history({verbose: true}));

        } catch (err){
            console.log(err)
            alert("PGN Parse error");
        }
    };

    useEffect(() => {
        if(!isAnalyzing) return;
        const interval = setInterval(() => {
            setEta(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    if(loading){
        return <div className="text-white text-center mt-20">Loading...</div>;
    }


  return (
    <div>
        <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center text-white gap-6">
            {analysis?.results?.length > 0 && (<EvaluationBoard 
                fen={fen}
                moves={moves}
                analysis = {analysis}
            />)}
            {isAnalyzing && <div className="text-2xl">
                <div className="animate-pulse">Stockfish is Analyzing the game....</div> 
                <div>ETA: {eta}s </div>
                </div>
            }
            <div className="w-full max-w-lg px-4">
                <form className="flex flex-col gap-3" onSubmit={handlePgnSubmit}>
                    <label>Paste PGN of game to be evaluated</label>
                    <textarea
                        name="pgn"
                        value={pgn}
                        rows={4}
                        onChange={(e) => setPgn(e.target.value)}
                        placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ..."
                        onFocus={() => setShowSubmit(true)}
                        className="p-2 bg-[#404040] w-full border-2 border-[#c0c0c0] focus:outline-none focus:border-white"
                    />
                    {showSubmit && (
                        <button
                            type="submit"
                            className="self-end px-3 py-2 bg-blue-400"
                        >
                            Import PGN
                        </button>
                    )}
                </form>
            </div>
        </div>
    </div>
 )
}

export default Evaluate
export function createStockfish() {
  const engine = new Worker("/stockfish/stockfish-17.1-lite-single-03e3232.js");
  engine.postMessage("uci");
  engine.postMessage("isready");
  return engine;
}

export function evalFen(engine, fen, timeMs = 500) {
  return new Promise((resolve) => {
    let evalCp = null;
    let mate = null;
    let bestMove = null;
    let rawEval = null;
    let rawMate = null;
    const isWhiteTurn = fen.split(' ')[1] === "w";

    engine.onmessage = (e) => {
      const line = e.data;

      if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match){
            rawEval = parseInt(match[1], 10);
            evalCp = isWhiteTurn ? rawEval: -rawEval;
            mate = null;
        }
      }

      if (line.includes("score mate")) {
        const match = line.match(/score mate (-?\d+)/);
        if (match) {
          rawMate = parseInt(match[1], 10);
          mate = isWhiteTurn? rawMate: -rawMate;
          evalCp = null;
        }
      }

      if (line.startsWith("bestmove")) {
        const match = line.match(/bestmove (\S+)/);
        if (match) bestMove = match[1];
        resolve({evalCp, bestMove, mate});
      }
    };

    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go movetime ${timeMs}`);
  });
}

export function playMove(engine, fen, depth = 6) {
  return new Promise((resolve) => {
    const handler = (e) => {
      const line = e.data;
      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        engine.removeEventListener("message", handler);
        resolve(move);
      }
    };

    engine.addEventListener("message", handler);
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
  });
}
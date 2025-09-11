const { spawn } = require("child_process");

function getBestMove(fen,depth) {
  return new Promise((resolve) => {
    const engine = spawn("./bin/stockfish/stockfish-macos-m1-apple-silicon");

    let buffer = "";
    engine.stdout.on("data",(data) => {
      buffer += data.toString();
      let lines = buffer.split("\n");
      buffer = lines.pop();

      for(let line of lines) {
        line = line.trim();
        if(line.startsWith("bestmove")) {
          resolve(line.split(" ")[1]); 
          engine.kill();
        }
      }
    });

    engine.stdin.write("uci\n");
    engine.stdin.write("ucinewgame\n");
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write(`go depth ${depth}\n`);
  });
}

module.exports = getBestMove;
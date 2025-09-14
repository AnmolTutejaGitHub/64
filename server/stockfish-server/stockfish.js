const { spawn } = require("child_process");

let engine = null;

function getEngine() {
  if (!engine) {
    engine = spawn("./bin/stockfish/stockfish-macos-m1-apple-silicon");
    engine.stdin.write("uci\n");

    engine.on("exit",() => {
      engine = null;
    });
  }
  return engine;
}

function getBestMove(fen,depth) {
  return new Promise((resolve) => {
    const sf = getEngine();
    let buffer = "";

    const onData = (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("bestmove")) {
          sf.stdout.off("data",onData);
          resolve(line.split(" ")[1]);
        }
      }
    };

    sf.stdout.on("data",onData);
    sf.stdin.write("ucinewgame\n");
    sf.stdin.write(`position fen ${fen}\n`);
    sf.stdin.write(`go depth ${depth}\n`);
  });
}

module.exports = {getBestMove};
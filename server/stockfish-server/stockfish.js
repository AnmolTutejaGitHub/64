// This code uses a stockfish engine and queues requests 
// for production level code I should have pool of stockfish engines not just one

const { spawn } = require("child_process");

let engine = null;
let busy = false;
let queue = [];

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
  return new Promise((resolve,reject) => {
    const task = async () => {
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
            if (queue.length > 0) {
              const next = queue.shift();
              busy = true;
              next();
            }else busy = false;
            return;
          }
        }
      };

      sf.stdout.on("data", onData);
      sf.stdin.write("ucinewgame\n");
      sf.stdin.write(`position fen ${fen}\n`);
      sf.stdin.write(`go depth ${depth}\n`);
    };

    if (busy) {
      queue.push(task);
    } else {
      busy = true;
      task();
    }
  });
}

module.exports = { getBestMove };
const { Chess } = require('chess.js');
const constant = require('../constants');

class Game {
    constructor(gameid,white_id,black_id,mode) {
        this.gameid = gameid;
        this.white_id = white_id;
        this.black_id = black_id;
        this.mode = mode;

        this.chess = new Chess();
        this.fen = this.chess.fen();
        this.history = [this.fen];
        this.moves = [];
        this.result = {status: constant.ONGOING,winner: null };

        this.startTime = Date.now();
        this.endTime = null;
    }

    makeMove(move) {
        const result = this.chess.move(move);
        if(result === null) {
            return { valid: false,message: constant.INVALID_MOVE };
        }

        this.fen = this.chess.fen();
        this.history.push(this.fen);
        this.moves.push(result);

        if(this.chess.isGameOver()) {
            if(this.chess.isCheckmate()) {
                this.result = {
                    status: constant.CHECKMATE,
                    winner: this.chess.turn() === "w" ? constant.BLACK : constant.WHITE
                }
            } else if (this.chess.isDraw()) {
                this.result = { status: constant.DRAW,winner: null };
            }
            this.endTime = Date.now();
        }

        return {
            valid: true,
            fen: this.fen,
            history: this.chess.history(),
            moves: this.moves,
            lastmove: result,
            gameOver: this.chess.isGameOver(),
            result: this.result,
        }
    }

    resign(resignedBy) {
        if(this.result.status != constant.ONGOING) return;

        this.result = {
            status: constant.RESIGN,
            winner: resignedBy === constant.WHITE ? constant.BLACK : constant.WHITE
        }

        this.endTime = Date.now();
    }

    getGameState() {
        return {
            gameid: this.gameid,
            fen: this.fen,
            history: this.chess.history(),
            moves: this.moves,
            turn: this.chess.turn(),
            gameOver: this.chess.isGameOver() || this.result.status !== constant.ONGOING,
            result: this.result
        }
    }

    loadGameFromRedis() {}
}

module.exports = Game;
const { Chess } = require('chess.js');
const constant = require('../constants');
const RedisClient = require('../RedisClient');

class Game {
    constructor(gameid,white_id,black_id,mode) {
        this.gameid = gameid;
        this.white_id = white_id;
        this.black_id = black_id;
        this.mode = mode;

        this.chess = new Chess();
        this.fen = this.chess.fen();
        this.fenhistory = [this.fen];
        this.lastmove = null;
        this.moves = [];
        this.result = {status: constant.ONGOING,winner: null,method : null};

        this.startTime = Date.now();
        this.endTime = null;
    }

    async makeMove(move,player_id) {
        if(this.result.status != constant.ONGOING){
            return { valid: false,message: GAME_ALREADY_ENDED };
        }

        const curr_turn = this.chess.turn();
        const is_white_turn = curr_turn == 'w';
            
        if ((is_white_turn && player_id != this.white_id) || (!is_white_turn && player_id != this.black_id)){
            return { valid: false,message: constant.NOT_YOUR_TURN }
        }

        const move_data = this.chess.move(move);
        if(move_data == null) {
            return { valid: false,message: constant.INVALID_MOVE };
        }

        this.fen = this.chess.fen();
        this.fenhistory.push(this.fen);
        this.lastmove = {...move_data,player_id : player_id,timestamp : Date.now()};
        this.moves.push(this.lastmove);

        if(this.chess.isGameOver()) {
            this.handleGameEnd();
        }

        await this.saveToRedis();

        return {
            valid: true,
            fen: this.fen,
            history: this.chess.history(),
            moves: this.moves,
            lastmove:this.lastmove,
            gameOver: this.chess.isGameOver(),
            result: this.result,
        }
    }

    async resign(resignedBy) {
        if(this.result.status != constant.ONGOING) return;

        this.result = {
            status: constant.RESIGN,
            winner: resignedBy == constant.WHITE ? constant.BLACK : constant.WHITE,
            method: constant.RESIGN
        }

        this.endTime = Date.now();
        await this.saveToRedis();
        return {success: true,result: this.result};
    }

    getGameState() {
        return {
            gameid: this.gameid,
            white_id: this.white_id,
            black_id: this.black_id,
            mode: this.mode,
            fen: this.fen,
            history: this.chess.history(),
            fenhistory : this.fenhistory,
            moves: this.moves,
            turn: this.chess.turn(),
            lastmove : this.lastmove,
            gameOver: this.chess.isGameOver() || this.result.status !== constant.ONGOING,
            result: this.result,
            startTime: this.startTime,
            endTime: this.endTime,
        }
    }

    handleGameEnd() {
        if(this.chess.isCheckmate()) {
            this.result = {
                status: constant.CHECKMATE,
                winner: this.chess.turn() == "w" ? constant.BLACK : constant.WHITE,
                method: constant.CHECKMATE
            }
        }else if (this.chess.isStalemate()) {
            this.result = {
                status: constant.DRAW,
                winner: null,
                method: constant.STALEMATE
            }
        } else if(this.chess.isInsufficientMaterial()) {
            this.result = {
                status: constant.DRAW,
                winner: null,
                method: constant.INSUFFICIENT_MATERIAL
            }
        } else if (this.chess.isThreefoldRepetition()) {
            this.result = {
                status: constant.DRAW,
                winner: null,
                method: constant.THREEFOLD_REPETITION
            }
        }

        this.endTime = Date.now();
    }

    async saveToRedis() {
        try{
            await RedisClient.set(`game:${this.gameid}`,JSON.stringify(this.getGameState()),'EX',3600);
        }catch(err){
            console.log(err);
        }
    }

    saveToDatabase() {}

    static async loadGameFromRedis(gameid) {
        const game_data = await RedisClient.get(`game:${gameid}`);
        if(game_data == null) return null;
        const parsedgame = JSON.parse(game_data);
        const game = new Game(
            parsedgame.gameid,
            parsedgame.white_id,
            parsedgame.black_id,
            parsedgame.mode
        )

        game.fen = parsedgame.fen;
        game.fenhistory = parsedgame.fenhistory;
        game.moves = parsedgame.moves;
        game.lastmove = parsedgame.lastmove;
        game.result = parsedgame.result;
        game.startTime = parsedgame.startTime;
        game.endTime = parsedgame.endTime;

        game.chess.load(parsedgame.fen);
        return game;
    }

    static loadGameFromDatabase(gameid) {}
}

module.exports = Game;
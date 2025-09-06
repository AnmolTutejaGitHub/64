const Game =  require('./Game');

class GameRegistry {
    constructor(){
        this.activeGames = new Map();
    }

    createGame(gameid,white_id,black_id,mode){
        const game = new Game(gameid,white_id,black_id,mode);
        this.activeGames.set(gameid,game);
    }

    getGame(gameid){
        return this.activeGames.get(gameid);
    }

    deleteGame(gameid){
        return this.activeGames.delete(gameid);
    }
}

module.exports = GameRegistry;
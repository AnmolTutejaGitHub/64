const Game =  require('./Game');
const constant = require('../constants');

const modeTimeMap = {
    [constant.BULLET]: 1 * 60 * 1000,
    [constant.BLITZ]: 3 * 60 * 1000,
    [constant.RAPID]: 10 * 60 * 1000,
}

class GameRegistry {
    constructor(){
        this.activeGames = new Map();
    }

    createGame(gameid,white_id,black_id,mode){
        if(this.activeGames.has(gameid)) return;
        const game = new Game(gameid,white_id,black_id,mode,modeTimeMap[mode]);
        this.activeGames.set(gameid,game);
    }

    async getGame(gameid){
        let game = this.activeGames.get(gameid);
        if(!game){
            game = await Game.loadGameFromRedis(gameid);
            if(game) this.activeGames.set(gameid,game);
        }
        return game;
    }

    deleteGame(gameid){
        return this.activeGames.delete(gameid);
    }
}

module.exports = GameRegistry;
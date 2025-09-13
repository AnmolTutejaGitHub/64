require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const constant = require('../constants');
const RedisClient = require('../RedisClient');
const config = require('../config/config');
const dbGame = require('../database/Models/Game.model');
const connectMongoDB = require('../database/mongoose');
const User = require("../database/Models/User");
const EloRank = require('elo-rank');
var elo = new EloRank(15);

app.use(cors({
    origin: `${config.FRONTEND_URL}`,
    credentials: true
}));
app.use(express.json());

connectMongoDB();

const PORT = 9191;

const subscriber = RedisClient.duplicate();

subscriber.on('message',async (channel,message) => {
    if (channel == 'gameEnded') {
        try {
            if (!message) return;
            console.log(message);
            const gameObj = JSON.parse(message);
            let dbgame = await dbGame.findOne({ gameid: gameObj.gameid });
            if(dbgame){
                dbgame.gameid =  gameObj.gameid,
                dbgame.white_id = gameObj.white_id,
                dbgame.black_id = gameObj.black_id,
                dbgame.mode = gameObj.mode,
                dbgame.fen = gameObj.fen,
                dbgame.lastmove = gameObj.lastmove || {},
                dbgame.moves = gameObj.moves || [],
                dbgame.fenhistory = gameObj.fenhistory || [],
                dbgame.history = gameObj.history || [],
                dbgame.result = gameObj.result || {},
                dbgame.startTime = gameObj.startTime || new Date(),
                dbgame.endTime = gameObj.endTime || null,
                dbgame.timeInMilliseconds = gameObj.timeInMilliseconds || 0,
                dbgame.timeLeft = gameObj.timeLeft || {},
                dbgame.lastMoveTimestamp = gameObj.lastMoveTimestamp || null,
                dbgame.gameOver = gameObj.gameOver || false
                await dbgame.save();
            }
            else dbgame = new dbGame({
                gameid: gameObj.gameid,
                white_id: gameObj.white_id,
                black_id: gameObj.black_id,
                mode: gameObj.mode,
                fen: gameObj.fen,
                lastmove: gameObj.lastmove || {},
                moves: gameObj.moves || [],
                fenhistory: gameObj.fenhistory || [],
                history: gameObj.history || [],
                result: gameObj.result || {},
                startTime: gameObj.startTime || new Date(),
                endTime: gameObj.endTime || null,
                timeInMilliseconds: gameObj.timeInMilliseconds || 0,
                timeLeft: gameObj.timeLeft || {},
                lastMoveTimestamp: gameObj.lastMoveTimestamp || null,
                gameOver: gameObj.gameOver || false
            })
            await dbgame.save();
            console.log(dbgame);
            console.log(gameObj);
            let player1 = await User.findOne({_id : gameObj.white_id});
            let player2 = await User.findOne({_id : gameObj.black_id});
            console.log("Player1",player1);
            console.log("player2",player2);
            const winner = gameObj?.result?.winner?.winner_id;
             console.log("winner",winner);
            if(winner){
                let expectedScoreA = elo.getExpected(player1.elo,player2.elo);
                let expectedScoreB = elo.getExpected(player2.elo,player1.elo);
                if(player1._id == winner){
                    player1.elo = elo.updateRating(expectedScoreA,1,player1.elo);
                    player2.elo = elo.updateRating(expectedScoreB,0,player2.elo);
                }else {
                    player1.elo = elo.updateRating(expectedScoreA,0,player1.elo);
                    player2.elo = elo.updateRating(expectedScoreB,1,player2.elo);
                }
                await player1.save();
                await player2.save();
            }
        } catch (err) {
            console.error(err);
        }
    }
});

subscriber.subscribe('gameEnded').then(() => {
    console.log('Subscribed to gameEnded channel');
}).catch(err => {
    console.log(err);
});

app.listen(PORT,()=>{
    console.log(`listening on PORT ${PORT}`);
})
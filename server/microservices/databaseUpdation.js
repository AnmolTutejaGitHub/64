require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const constant = require('../constants');
const RedisClient = require('../RedisClient');
const config = require('../config/config');
const dbGame = require('../database/Models/Game.model');

app.use(cors({
    origin: `${config.FRONTEND_URL}`,
    credentials: true
}));
app.use(express.json());

const PORT = 9191;

const subscriber = RedisClient.duplicate();

subscriber.on('message',async (channel,message) => {
    if (channel == 'gameEnded') {
        try {
            if (!message) return;
            console.log(message);
            const gameObj = JSON.parse(message);
            const dbgame = await dbGame.findById(gameObj.gameid);
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
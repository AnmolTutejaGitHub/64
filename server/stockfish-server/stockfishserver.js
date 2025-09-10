const express = require('express');
require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const config = require('../config/config');
const socketio = require('socket.io');
const cors = require('cors');
const constant = require('../constants');
const RedisClient = require('../RedisClient');
const GameRegistry = require('../classes/GameRegistry');

app.use(cors({
    origin: `${config.FRONTEND_URL}`,
    credentials: true
}));
app.use(express.json());

const server = http.createServer(app);

const io = socketio(server,{
    cors: {
        origin: `${config.FRONTEND_URL}`,
        credentials: true
    }
});

const PORT = process.env.PORT || 8081;

const gameRegistry = new GameRegistry();
// create Game via api

io.on('connection',async(socket)=>{
    const userid = socket.handshake.query.userid;
    const gameid = socket.handshake.query.gameid;

    socket.on(constant.NEW_MOVE,async(data)=>{
        const move = data;
        const game = await gameRegistry.getGame(gameid);
        let result = null;

        if(game) result = await game.makeMove(move,userid);
        else result = {message : constant.GAME_NOT_FOUND};
        const gameState = game.getGameState();
        if(!result?.valid) result =  {...result,...gameState};
        io.to(gameid).emit(constant.NEW_MOVE,result);
        if(result?.valid){
            // 1) getting best move from stockfish
            // 2) game.move
            // emitting new_move to client 
        }
    })

    socket.on(constant.RESIGN,async()=>{
        const game = await gameRegistry.getGame(gameid);
        let result = null;

        if(game) result = await game.resign(userid);
        else result = {message : constant.GAME_NOT_FOUND};

        io.to(gameid).emit(constant.RESIGN,result);
    })

    socket.on(constant.GET_GAME_STATE,async (data,ack) => {
        const game = await gameRegistry.getGame(data.gameid);
        let result = null;
    
        if (game) result = game.getGameState();
        else result = { message: constant.GAME_NOT_FOUND };

        ack(result);
    });

    socket.on('disconnect',()=>{})
})

server.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})
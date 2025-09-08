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

const PORT = process.env.PORT || 9090;

const gameRegistry = new GameRegistry();

const subscriber = RedisClient.duplicate();
subscriber.subscribe("game:new",(message) => {
    try {
        if(!message) return;
        const data = JSON.parse(message);
        const { gameid,white_id,black_id,mode } = data;
        gameRegistry.createGame(gameid,white_id,black_id,mode);
    } catch (err) {
        console.error(err);
    }
});

io.on('connection',async(socket)=>{
    const userid = socket.handshake.query.userid;
    const gameid = socket.handshake.query.gameid;
    // gameRegistry.createGame ?? if client hit before pub/sub worked then ?? 
    // will take mode,opponent from handshake incase after frontend testing
    socket.join(gameid);

    socket.on(constant.NEW_MOVE,async(data)=>{
        const {move} = data;
        const game = await gameRegistry.getGame(gameid);
        let result = null;

        if(game) result = await game.makeMove(move,userid);
        else result = {message : constant.GAME_NOT_FOUND};

        io.to(gameid).emit(constant.NEW_MOVE,result);
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
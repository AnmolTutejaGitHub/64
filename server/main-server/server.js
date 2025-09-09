require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const config = require("../config/config");
const startServices = require("../utils/startServices");
const RedisClient = require("../RedisClient");
const userRoutes = require('../Routes/UserRoutes');
const GameRoutes = require('../Routes/GameRoutes');
const http = require('http');
const socketio = require('socket.io');
const constant = require('../constants');

const PORT = config.PORT;
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
})
app.set("io",io);

io.on('connection',async(socket)=>{
    // note : client will make connetion to this server when client hit
    // http://localhost:5173/find/mode=${mode}/${requestId}
    const userid = socket.handshake.auth.userid;
    if (userid) {
        try {
            await RedisClient.hset("socketMap",userid,socket.id);
            socket.emit(constant.SOCKET_REGISTERED,{ 
                status: constant.OK, 
                userid, 
                socketid: socket.id 
            });
        } catch (err) {
            socket.emit(constant.SOCKET_REGISTERED,{status: constant.ERROR,error: err.message });
            console.log(err);
        }
    }

    socket.on('disconnect',()=>{})
})

app.use("/api/user",userRoutes);
app.use("/api/game",GameRoutes);


startServices();

server.listen(PORT,()=>{
    console.log(`server is listening on PORT ${PORT}`);
})

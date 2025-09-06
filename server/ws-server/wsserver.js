require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const config = require('../config/config');
const socketio = require('socket.io');
const cors = require('cors');

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

io.on('connection',(socket)=>{
    socket.on('disconnect',()=>{

    })
})

server.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})
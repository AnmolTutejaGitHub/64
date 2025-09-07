require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const config = require("../config/config");
const startServices = require("../utils/startServices");
const RedisClient = require("../RedisClient");
const userRoutes = require('../Routes/UserRoutes');
const GameRoutes = require('../Routes/GameRoutes');


app.use(cors({
    origin: `${config.FRONTEND_URL}`,
    credentials: true
}));
app.use(express.json());
app.use("/api/user",userRoutes);
app.use("/api/game",GameRoutes);


startServices();

const PORT = config.PORT;
app.listen(PORT,()=>{
    console.log(`server is listening on PORT ${PORT}`);
})

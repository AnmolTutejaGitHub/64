require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const config = require("../config/config");
const startServices = require("../utils/startServices");
const RedisClient = require("../RedisClient");

app.use(cors({
    origin: `${config.FRONTEND_URL}`,
    credentials: true
}));

app.use(express.json());


startServices();

const PORT = config.PORT;

app.listen(PORT,()=>{
    console.log(`server is listening on PORT ${PORT}`);
})

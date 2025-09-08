const express = require('express');
const router = express.Router();
const RedisClient = require('../RedisClient');
const Auth = require("../middleware/Auth");
const { v4: uuidv4 } = require("uuid");
const constant = require('../constants');

router.post("/get-requestid", Auth, async (req, res) => {
    try {
        const requestId = uuidv4();
        const userid = req.userId;
        const { mode } = req.body;

        // will store { requestId,userid,mode } in DB later
        return res.status(200).send({
            requestId,
            mode,
            redirect: `http://localhost:5173/find/mode=${mode}/${requestId}`,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/find-match", Auth,async(req, res) => {
    const userid = req.userId;
    const { mode,requestId } = req.body;
    const queueKey = `queue:${mode}`;
    const player_detail = JSON.stringify({ userid,requestId });
    const io = req.app.get("io");

    try {
        const luaScript = `
            local opponent = redis.call("LPOP",KEYS[1])
            if opponent then
                return opponent
            else
                redis.call("RPUSH",KEYS[1],ARGV[1])
                return nil
            end
        `;

        const opponent = await RedisClient.eval(luaScript,1,queueKey,player_detail);

        if (opponent) {
            const opponent_detail = JSON.parse(opponent);
            const gameid = uuidv4();

            const init_game_detail = JSON.stringify({
                gameid,
                white_id: opponent_detail.userid,
                black_id: userid,
                mode
            });
            
            await RedisClient.publish("game:new",init_game_detail);
            // will have ack method too to avoid notifying player later

            const opponent_socketid = await RedisClient.hget("socketMap",opponent.userid);
            io.to(opponent_socketid).emit(constant.MATCH_FOUND, {
                gameid,
                white: opponent_detail.userid,
                black: userid,
                websocket_url: `http://localhost:9090`,
                redirect: `http://localhost:5173/game/mode=${mode}/${gameid}`,
            });

            const user_socketid = await RedisClient.hget("socketMap",userid);
            io.to(user_socketid).emit(constant.MATCH_FOUND,{
                gameid,
                white: opponent_detail.userid,
                black: userid,
                websocket_url: `http://localhost:9090`,
                redirect: `http://localhost:5173/game/mode=${mode}/${gameid}`,
            });
            
            return res.status(200).send({ status: constant.MATCH_FOUND,gameid });
        } else {
            return res.status(200).send({ status: constant.WAITING,requestId });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = router;
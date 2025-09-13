const express = require('express');
const router = express.Router();
const RedisClient = require('../RedisClient');
const Auth = require("../middleware/Auth");
const { v4: uuidv4 } = require("uuid");
const constant = require('../constants');
const axios = require("axios");

// requestIdMap --> mapping request id to client 
// requestIdResolved --> if that request id is resolved 
// queueMap:${mode} -> mapping of userid with requestid
// queue --> userid

router.post("/get-requestid", Auth, async (req,res) => {
    try {
        const requestId = uuidv4();
        const userid = req.userId;
        const { mode } = req.body;

        await RedisClient.hset("requestIdMap",requestId,JSON.stringify({userid,mode}));
        return res.status(200).send({
            requestId,
            mode,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.post("/find-match",Auth,async(req, res) => {
    // will later have a microservice to remove user from queue which checks every 5s
    const userid = req.userId;
    const { mode,requestId } = req.body;
    const queueKey = `queue:${mode}`;
    const queueMap = `queueMap:${mode}`;
    const requestResolve = await RedisClient.hget('requestIdResolved',requestId);
    const io = req.app.get("io");

    try {
        const WaitingInQueue = await RedisClient.hget(`queueMap:${mode}`,userid);
        if(WaitingInQueue) {
            if(WaitingInQueue != requestId){
                await RedisClient.hset(`queueMap:${mode}`,userid,requestId);
                await RedisClient.hset("requestIdResolved",requestId,JSON.stringify({message : 'new request is created by same user in same mode while in queue, so prev req deleted' }));
            }
            return  res.status(200).send({ status: constant.WAITING,requestId });
        }
        const RequestResolved = JSON.parse(requestResolve);
        if(RequestResolved) return res.status(200).send({status : constant.RESOLVED,requestId});
        
        

        const luaScript = `
        local opponent = redis.call("LPOP", KEYS[1])
        local queueMap = KEYS[2]

        if opponent then
            local opponentRequestId = redis.call("HGET",queueMap,opponent)
            redis.call("HDEL",queueMap,opponent)
            return cjson.encode({userid=opponent,requestId=opponentRequestId})
        else
            local userid = ARGV[1]
            local requestId = ARGV[2] 
            redis.call("RPUSH",KEYS[1],userid)   
            redis.call("HSET",queueMap,userid,requestId)
            return nil
        end
        `;

        const opponent = await RedisClient.eval(luaScript,2,queueKey,queueMap,userid,requestId);

        if (opponent) {
            const gameid = uuidv4();

            const init_game_detail = JSON.stringify({
                gameid,
                white_id: JSON.parse(opponent).userid,
                black_id: userid,
                mode
            });
            
            await RedisClient.publish("game:new",init_game_detail);
            // will have ack method too to avoid notifying player later

            console.log(opponent);
            const opponent_socketid = await RedisClient.hget("socketMap",JSON.parse(opponent).userid);
            io.to(opponent_socketid).emit(constant.MATCH_FOUND, {
                gameid,
                white: JSON.parse(opponent).userid,
                black: userid,
                mode : mode
            });

            const user_socketid = await RedisClient.hget("socketMap",userid);
            io.to(user_socketid).emit(constant.MATCH_FOUND,{
                gameid,
                white: JSON.parse(opponent).userid,
                black: userid,
                mode : mode
            });

            const opponentRequestId = JSON.parse(opponent).requestId;
            console.log( opponentRequestId);
            await RedisClient.hset("requestIdResolved",requestId,init_game_detail);
            await RedisClient.hset("requestIdResolved",opponentRequestId,init_game_detail);
            await RedisClient.hdel("requestIdMap",requestId);
            await RedisClient.hdel("requestIdMap",opponentRequestId);
            
            return res.status(200).send({ status: constant.MATCH_FOUND,gameid });
        } else {
            return res.status(200).send({ status: constant.WAITING,requestId });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
})

router.get('/chess-quotes',async (req,res) => {
    try {
        let quotes = await RedisClient.get('chess:quotes');
        let random;

        if (quotes) {
            quotes = JSON.parse(quotes);
            random = quotes[Math.floor(Math.random() * quotes.length)];
        } else {
            const response = await axios.get("https://raw.githubusercontent.com/datavizard/chess-quotes-api/master/quotes.json");
            quotes = response.data;
            random = quotes[Math.floor(Math.random() * quotes.length)];
            await RedisClient.set('chess:quotes',JSON.stringify(quotes),"EX",60 * 60 * 24);
        }
        return res.status(200).send(random);
    } catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }
})

router.post("/remove-from-queue",Auth,async (req,res) => {
    const userid = req.userId;
    const { mode,requestId } = req.body;

    const queueKey = `queue:${mode}`;
    const queueMap = `queueMap:${mode}`;

    try {
        const waitingInQueue = await RedisClient.hget(queueMap,userid);
        if (!waitingInQueue) {
            return res.status(200).send({ status: constant.NOT_IN_QUEUE });
        }

        const luaScript = `
            local queueKey = KEYS[1]
            local queueMap = KEYS[2]
            local userid = ARGV[1]


            local list = redis.call("LRANGE",queueKey,0,-1)
            for i=1, #list do
                if list[i] == userid then
                    redis.call("LREM",queueKey,0,list[i])
                    break
                end
            end

            redis.call("HDEL",queueMap,userid)
            return 1
        `;

        await RedisClient.eval(luaScript,2,queueKey,queueMap,userid);
        await RedisClient.hset("requestIdResolved",requestId,JSON.stringify({message : "Removed from queue"}));
        await RedisClient.hdel("requestIdMap",requestId);

        return res.status(200).send({ status: constant.REMOVED_FROM_QUEUE });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }
});

module.exports = router;
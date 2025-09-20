const express = require('express');
const router = express.Router();
const RedisClient = require('../RedisClient');
const Auth = require("../middleware/Auth");
const { v4: uuidv4 } = require("uuid");
const constant = require('../constants');
const axios = require("axios");
const dbGame = require('../database/Models/Game.model');

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
            redirect: `/find/${mode}/${requestId}`,
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
                websocket_url: `http://localhost:9090`,
                redirect: `/game/${mode}/${gameid}`,
                mode : mode
            });

            const user_socketid = await RedisClient.hget("socketMap",userid);
            io.to(user_socketid).emit(constant.MATCH_FOUND,{
                gameid,
                white: JSON.parse(opponent).userid,
                black: userid,
                websocket_url: `http://localhost:9090`,
                redirect: `/game/${mode}/${gameid}`,
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
            for i=1,#list do
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
})

router.get("/review/:gameid",async(req,res) => {
    try {
      const { gameid } = req.params;
  
      if(!gameid) {
        return res.status(400).send({ error: "Gameid is required" });
      }
  
      const game = await dbGame.findOne({ gameid });
  
      if(!game) {
        return res.status(404).send({ error: "Game not found" });
      }
  
      res.status(200).send(game);
    } catch(err) {
      console.log(err);
      res.status(500).send(err);
    }
  })

  router.post('/generate-invite-url',async(req,res)=>{
    try{
        const uuid = uuidv4();
        const {mode} = req.body;
        // uuid -> {mode,player1=null,player2=null} to redis invite map and ttl is 10 min
        return res.status(200).send({
            invite : uuid,
            message : 'game will be initiated between first 2 players to hit invite url and link will be expired in 10 mins'
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
  })

  router.get('/invite/:inviteid',Auth,async(req,res)=>{
    try{
        const userid = req.userId;
        // get from inivtemap uuid
        // use lua script to it if player1 is null set userid to player1
        // else set player2 and use 
        // io.to(opponent_socketid).emit(constant.MATCH_FOUND, {
        //     gameid,
        //     white: JSON.parse(opponent).userid,
        //     black: userid,
        //     websocket_url: `http://localhost:9090`,
        //     redirect: `/game/${mode}/${gameid}`,
        //     mode : mode
        // });

        // const user_socketid = await RedisClient.hget("socketMap",userid);
        // io.to(user_socketid).emit(constant.MATCH_FOUND,{
        //     gameid,
        //     white: JSON.parse(opponent).userid,
        //     black: userid,
        //     websocket_url: `http://localhost:9090`,
        //     redirect: `/game/${mode}/${gameid}`,
        //     mode : mode
        // });

    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
  })

module.exports = router;
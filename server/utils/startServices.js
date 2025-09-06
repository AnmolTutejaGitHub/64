const connectMongoDB = require('../database/mongoose');
const RedisClient = require('../RedisClient');

async function startServices(){
    try{
        await connectMongoDB();
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = startServices;
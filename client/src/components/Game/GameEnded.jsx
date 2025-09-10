function GameEnded(){
    return (
        <div className="text-white h-[100vh] w-[100vw] backdrop-blur-sm absolute z-100 flex justify-center items-center text-2xl font-bold flex-col p-4">
            <div className="flex flex-col justify-center items-center gap-4 p-8 rounded-xl">
                <div className="text-red-800 p-4 rounded-sm">Game Ended</div>
                <img src="/danny_pawn.82d0fa70.gif"></img>
            </div>
        </div>
    )
}

export default GameEnded;
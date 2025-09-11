const GameDetailsRender = ({ gameDetails }) => {
    if (!gameDetails) return <div>No game details available.</div>;
  
    const {gameid,white_id,black_id,mode,fen,history,moves,lastMoveTimestamp} = gameDetails;
  
    return (
      <div className="p-4 bg-[#465466] rounded-lg w-4xl m-4 text-white">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 text-pink-400">Game Details</h2>
          <p>Game ID: {gameid}</p>
          <p>White Player: {white_id}</p>
          <p>Black Player: {black_id}</p>
          <p>Mode: {mode}</p>
          <p>Current FEN: {fen}</p>
          <p>Last Move: {lastMoveTimestamp}</p>
        </div>
  
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2 text-pink-400">Moves History</h3>
          <div
            className="p-2 bg-white rounded border"
            style={{
              maxHeight:  "200px",
              overflowY: "auto"
            }}
          >
            {history.map((move,index) => (
              <p key={index} className="border-b py-1 text-pink-400">
                {index+1}. {move}
              </p>
            ))}
          </div>
        </div>
  
        <div>
          <h3 className="text-xl font-semibold mb-2 text-pink-400">Detailed Moves</h3>
          <div
            className="overflow-x-auto bg-white rounded border p-2"
            style={{
              maxHeight: '300px',
              overflowY: "auto"
            }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-pink-300 text-pink-400">
                  <th className="px-2 py-1 border">#</th>
                  <th className="px-2 py-1 border">Player</th>
                  <th className="px-2 py-1 border">Move</th>
                  <th className="px-2 py-1 border">SAN</th>
                  <th className="px-2 py-1 border">Before FEN</th>
                  <th className="px-2 py-1 border">After FEN</th>
                  <th className="px-2 py-1 border">Move Time</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((movee,idx) => (
                  <tr key={idx} className="hover:bg-pink-50 text-pink-400">
                    <td className="px-2 py-1 border">{idx + 1}</td>
                    <td className="px-2 py-1 border">{movee.color}</td>
                    <td className="px-2 py-1 border">{movee.lan}</td>
                    <td className="px-2 py-1 border">{movee.san}</td>
                    <td className="px-2 py-1 border">{movee.before}</td>
                    <td className="px-2 py-1 border">{movee.after}</td>
                    <td className="px-2 py-1 border">{movee.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default GameDetailsRender;
import { useParams } from "react-router";
import useUserStore from "../../store/userStore";
import { Chessboard } from "react-chessboard";
import { useState,useEffect } from "react";
import { io } from "socket.io-client";
import toast from 'react-hot-toast';
import GameNotFound from "./GameNotFound";
import GameEnded from "./GameEnded";

let socket;

function Game(){
    const {mode,gameid} = useParams();
    const { userid } = useUserStore();
    const [fen,setFen] = useState("");
    const [gameDetails,setGameDetails] = useState(null);
    const [gameNotFound,setGameNotFound] = useState(false);

    useEffect(() => {
        if (!socket) {
            socket = io(import.meta.env.VITE_GAME_SERVER_API_URL,{
                query: { userid, gameid }
              })

            socket.connect();
        }

        socket.emit('get_game_state',{gameid},(response) => {
            if(response.message == 'game_not_found') {
                setGameNotFound(true);
            }
            console.log(response);
            setFen(response.fen);
            setGameDetails(response);
        })

        socket.on('new_move',(data)=>{
            console.log(data);
            setFen(data.fen);
            if(data.gameOver) toast.success(`${JSON.stringify(data.result)}`);
        })

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    },[]);

    function onPieceDrop({ piece,sourceSquare,targetSquare }) {
        console.log("Piece dropped:", piece, "from", sourceSquare, "to", targetSquare);
        socket.emit('new_move',{
            from : sourceSquare,
            to : targetSquare
        })
        return true;
    }

const customPieces = {
  wP: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wp.png"
      alt="White Pawn"
      style={svgStyle}
    />
  ),
  wR: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wr.png"
      alt="White Rook"
      style={svgStyle}
    />
  ),
  wN: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wn.png"
      alt="White Knight"
      style={svgStyle}
    />
  ),
  wB: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wb.png"
      alt="White Bishop"
      style={svgStyle}
    />
  ),
  wQ: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wq.png"
      alt="White Queen"
      style={svgStyle}
    />
  ),
  wK: ({ svgStyle }) => (
    <img
      src="/assets/pieces/wk.png"
      alt="White King"
      style={svgStyle}
    />
  ),
  bP: ({ svgStyle }) => (
    <img
      src="/assets/pieces/bp.png"
      alt="Black Pawn"
      style={svgStyle}
    />
  ),
  bR: ({ svgStyle }) => (
    <img
      src="/assets/pieces/br.png"
      alt="Black Rook"
      style={svgStyle}
    />
  ),
  bN: ({ svgStyle }) => (
    <img
      src="/assets/pieces/bn.png"
      alt="Black Knight"
      style={svgStyle}
    />
  ),
  bB: ({ svgStyle }) => (
    <img
      src="/assets/pieces/bb.png"
      alt="Black Bishop"
      style={svgStyle}
    />
  ),
  bQ: ({ svgStyle }) => (
    <img
      src="/assets/pieces/bq.png"
      alt="Black Queen"
      style={svgStyle}
    />
  ),
  bK: ({ svgStyle }) => (
    <img
      src="/assets/pieces/bk.png"
      alt="Black King"
      style={svgStyle}
    />
  ),
}

    return (
        <div className="h-[100vh] w-[100vw] bg-[#111319]">
            {gameNotFound && 
                <GameNotFound/>
            }
            {
                gameDetails?.gameOver &&
                <GameEnded/>
            }
            <div className="flex h-full w-full items-center justify-center">
            <Chessboard
                options={{
                    position : fen,
                    boardOrientation : userid == gameDetails?.white_id ? 'white' : 'black',
                    onPieceDrop : onPieceDrop,
                    boardStyle: {
                        width: '75vmin',
                        height: '75vmin',
                        borderRadius: '0.40rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      },
                    darkSquareStyle: { backgroundColor: '#ec4899' },
                    lightSquareStyle: { backgroundColor: '#ffe4e6' },
                    pieces: customPieces,
                    allowDrawingArrows : true
                }}
            />
            </div>
        </div>
    )
}
export default Game;
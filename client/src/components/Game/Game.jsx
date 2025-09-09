import { useParams } from "react-router";
import useUserStore from "../../store/userStore";
import { Chessboard } from "react-chessboard";

function Game(){
    const {mode,gameid} = useParams();
    const { userid } = useUserStore();
    return (
        // <div className="h-[80vh] w-[80vw]">
        //     <Chessboard id="defaultBoard"
        //         // position={game.fen()}
        //         // onPieceDrop={onDrop}
        //         //boardOrientation={color === "white" ? "white" : "black"}
        //         autoPromoteToQueen={true}
        //         boardWidth={5}
        //         customBoardStyle={{
        //             borderRadius: "0.25rem",
        //             boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        //         }}
        //         customDarkSquareStyle={{
        //             backgroundColor: "#888c95",
        //         }}
        //         customLightSquareStyle={{
        //             backgroundColor: "#efeceb",
        //         }}
        //         // customPieces={customPieces}
        //     />
        // </div>

        <div className="flex items-center justify-center h-[80vh] w-[80vw]">
  <Chessboard
    id="defaultBoard"
    autoPromoteToQueen={true}
    boardWidth={Math.min(window.innerHeight * 0.8, window.innerWidth * 0.8)} 
    customBoardStyle={{
      borderRadius: "0.25rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }}
    customDarkSquareStyle={{
      backgroundColor: "#888c95",
    }}
    customLightSquareStyle={{
      backgroundColor: "#efeceb",
    }}
  />
</div>
    )
}
export default Game;
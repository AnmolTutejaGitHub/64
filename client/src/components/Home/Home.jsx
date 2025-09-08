import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";
import NavBar from "../NavBar/NavBar";

function Home(){
    return (
      <div className="min-h-screen bg-[#111319]">
        <FramerMotionProvider>
            <NavBar/>
        </FramerMotionProvider>
        <FramerMotionProvider>
        <div className="flex h-full mt-20 p-10">
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="text-7xl font-semibold text-[#FF33AE]">
                    Master the board,<br/>crush your opponent.
                </div>
                <div className="text-white text-3xl leading-snug max-w-3xl text-center">
                    Flirt with the board, tease your opponent, 
                    and leave them <br/>begging for mercy.
                    Don't just play chess, play to win.
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                <img
                    src="/index-illustration.9d2cb1c3@2x.png"
                    className="max-w-full h-auto"
                />
            </div>
        </div>
        </FramerMotionProvider>
      </div>
    )
  }
  
  export default Home;
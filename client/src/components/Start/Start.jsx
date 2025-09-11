import NavBar from "../NavBar/NavBar";
import BlitzIcon from "../SvgIcons/BlitzIcon";
import RapidIcon from "../SvgIcons/RapidIcons";
import BulletIcon from "../SvgIcons/BulletIcon";
import axios from "axios";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router";
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";
import { FaRobot } from "react-icons/fa";

function Start(){
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

async function generateRequestId(mode) {
    const id = toast.loading("generating the request id...");
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/game/get-requestid`,
            { mode: mode},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        toast.success("success");
        const data = response.data;
        navigate(`${data.redirect}`);
        console.log(response.data);
        navigate
    } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || err.response?.data?.error || err.response?.data || "some error occurred");
    }finally {
        toast.dismiss(id);
    }
}

function StockfishOptions(){
    navigate("/stockfish/start");
}


    return (
    <div className="h-[100vh] w-[100-vw] bg-[#111319] flex flex-col">
        <FramerMotionProvider>
            <NavBar/>
        </FramerMotionProvider>
        
        <div className="flex items-center justify-center flex-1">
            <FramerMotionProvider>
            <div className="flex-1 flex items-center justify-center">
                <img src="/logo.ico"></img>
            </div>
            </FramerMotionProvider>
            <FramerMotionProvider>
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-center items-center gap-4 text-white bg-[#FF33AE] p-5 w-98 rounded-md cursor-pointer hover:border-2 hover:border-white hover:bg-[#111319] hover:text-[#FF33AE] font-semibold"
                onClick={()=>generateRequestId('rapid')}>
                    <RapidIcon color="white"/>
                    <div>Rapid</div>
                </div>
                <div className="flex justify-center items-center gap-4 text-white bg-[#FF33AE] p-5 w-98 rounded-md cursor-pointer hover:border-2 hover:border-white hover:bg-[#111319] hover:text-[#FF33AE] font-semibold"
                onClick={()=>generateRequestId('blitz')}>
                    <BlitzIcon color="white"/>
                    <div>Blitz</div>
                </div>
                <div className="flex justify-center items-center gap-4 text-white bg-[#FF33AE] p-5 w-98 rounded-md cursor-pointer hover:border-2 hover:border-white hover:bg-[#111319] hover:text-[#FF33AE] font-semibold"
                onClick={()=>generateRequestId('bullet')}>
                    <BulletIcon color="white"/>
                    <div>Bullet</div>
                </div>
                <div className="flex justify-center items-center gap-4 text-white bg-[#FF33AE] p-5 w-98 rounded-md cursor-pointer hover:border-2 hover:border-white hover:bg-[#111319] hover:text-[#FF33AE] font-semibold"
                onClick={StockfishOptions}>
                <div className="text-2xl"><FaRobot /></div>
                <div>Play With Stockfish</div>
                </div>
                
            </div>
            </FramerMotionProvider>
        </div>
        
    </div>)
}

export default Start;
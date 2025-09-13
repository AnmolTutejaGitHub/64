import NavBar from "../NavBar/NavBar";
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";
function Profile(){
    return(<div className="h-[100vh] w-[100vw] bg-[#111319]">
        <FramerMotionProvider>
            <NavBar/>
            <div>
                
            </div>
        </FramerMotionProvider>
    </div>)
}
export default Profile;
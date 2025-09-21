import {Link,useNavigate} from "react-router";
import { useState,useEffect } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import useUserStore from "../../store/userStore";
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";

function Login() {
    const navigate = useNavigate();
    const {isAuthenticated,setUser} = useUserStore();

    useEffect(() => {
        if (isAuthenticated) {
          navigate("/");
        }
      },[isAuthenticated]);

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    async function login(){
        const id = toast.loading("trying to login...");
        try{
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/login`,{
                email : email,
                password : password,
            })
            console.log(response.data);
            toast.success("login successful");
            const {token , username,user_id} = response.data;
            setUser(username,user_id);
            localStorage.setItem("token",token);
        }catch(err){
            console.log(err);
            toast.error(err.response?.data?.message || err.response?.data?.error || err.response?.data || "some error occurred");
        }finally{
            toast.dismiss(id);
        }
    }
    return (
        <section className="flex items-center justify-center bg-[#111319] h-[100vh] w-[100vw]">
        <FramerMotionProvider>
          <fieldset className="rounded-xl w-[30rem] h-[30rem] p-8 shadow-xl bg-[#2D3748]">
            <legend className="text-2xl font-bold text-[#FF33AE] mb-6">Login</legend>
  

            <label className="block text-lg font-medium text-[#F9F1F1]">Email</label>
            <input 
              type="email" 
              className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
              placeholder="Enter your email" 
              onChange={(e)=>setEmail(e.target.value)}
            />
  
            <label className="block text-lg font-medium text-[#F9F1F1] mt-4">Password</label>
            <input 
              type="password" 
              className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
              placeholder="Enter your password" 
              onChange={(e)=>setPassword(e.target.value)}
            />
  
            <p className="text-right mt-2">
              <Link to="/forget-password"  className="text-lg text-[#FF33AE] hover:text-[#FF33AE] hover:underline font-medium">Forgot Password?</Link>
            </p>
  
            <button className="btn mt-6 w-full bg-[#FF33AE] hover:bg-[#FF33AE]/70 text-white rounded-lg text-lg font-semibold p-2"
                onClick={login}>
              Login
            </button>
  
            <p className="text-lg text-[#F9F1F1] mt-6 text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#FF33AE] hover:text-[#FF33AE] font-semibold hover:underline">Sign up</Link>
            </p>
          </fieldset>
          </FramerMotionProvider>
        </section>
    )
  }
  
  export default Login;
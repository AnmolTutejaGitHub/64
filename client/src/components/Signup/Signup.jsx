import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useState } from "react";
import toast from 'react-hot-toast';
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";

function Signup() {

   const [username,setUsername] = useState("");
   const [email,setEmail] = useState("");
   const [password,setPassword] = useState("");
   const [confirm_password,setConfirmPassword] = useState("");

   const navigate = useNavigate();

   async function signup(){
    const id = toast.loading("Creating your account...");
    try{
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/signup`,{
            email : email,
            password : password,
            confirm_password : confirm_password,
            name : username
        })

        const data = response.data;
        console.log(data);
        localStorage.setItem('token',data.token);
        toast.success("Signup successful!");
        navigate("/verify");

    }catch(err){
        console.log(err);
        toast.error(err.response?.data?.message || err.response.data.error || err.response?.data || "some error occurred");
    }finally{
        toast.dismiss(id);
    }
   }

  return (
      <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-[#F8F9FB]">
        <FramerMotionProvider>
        <fieldset className="rounded-xl w-[24rem] h-[34rem] p-8 shadow-xl bg-white border border-gray-200">
          <legend className="text-2xl font-bold text-[#F75904]/60 mb-6">Sign Up</legend>

          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input 
            type="text" 
            className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
            placeholder="Enter your name" 
            onChange={(e)=>setUsername(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-600 mt-4">Email</label>
          <input 
            type="email" 
            className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
            placeholder="Enter your email" 
            onChange={(e)=>setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-600 mt-4">Password</label>
          <input 
            type="password" 
            className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
            placeholder="Enter your password" 
            onChange={(e)=>setPassword(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-600 mt-4">Confirm Password</label>
          <input 
            type="password" 
            className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2" 
            placeholder="Confirm your password" 
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />

          <button className="btn mt-6 w-full bg-[#F75904]/60 hover:bg-[#F75904]/70 text-white rounded-lg text-lg font-semibold p-2"
          onClick={signup} >
            Sign Up
          </button>

          <div className="text-sm text-gray-500 mt-6 text-center">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-[#F75904]/60 hover:text-[#F75904]/80 font-semibold hover:underline"
            >
              Login
            </Link>
          </div>
        </fieldset>
        </FramerMotionProvider>
      </div>
  )
}

export default Signup;
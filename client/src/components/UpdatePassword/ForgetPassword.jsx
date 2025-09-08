import { Link } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";

function ForgetPassword() {
  const [email,setEmail] = useState("");

  async function sendPasswordResetLink() {
    const id = toast.loading("Sending password reset link...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/resetPasswordToken`,
        { email }
      )
  
      toast.success(response.data?.message || "Reset link sent!");
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to send reset link");
    } finally {
      toast.dismiss(id);
    }
  }
  return (
      <div className="flex items-center justify-center bg-[#F8F9FB] h-[100vh] w-[100vw]">
        <FramerMotionProvider>
        <fieldset className="rounded-xl w-[24rem] h-[22rem] p-8 shadow-xl bg-white border border-gray-200">
          <legend className="text-2xl font-bold text-[#F75904]/60 mb-6">
            Forgot Password
          </legend>

          <p className="text-sm text-gray-500 mb-4">
            Enter your email to get reset password link.
          </p>

          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            className="input input-bordered w-full mt-1 rounded-lg bg-gray-100 text-black p-2"
            placeholder="Enter your email"
            onChange={(e)=>setEmail(e.target.value)}
          />

          <button className="btn mt-6 w-full bg-[#F75904]/60 hover:bg-[#F75904]/70 text-white rounded-lg text-lg font-semibold p-2"
          onClick={sendPasswordResetLink}>
            Send Reset Link
          </button>

          <div className="text-sm text-gray-500 mt-6 text-center">
            Remember your password?{" "}
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
export default ForgetPassword;
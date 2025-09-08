import { useParams ,useNavigate} from "react-router";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import FramerMotionProvider from "../../Provider/FramerMotionProvider/FramerMotionProvider";

function VerifyYourAccount() {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    const toastId = toast.loading("Verifying your account...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/verify/${token}`,
      )
      toast.success(response?.data?.message || "Account verified!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Verification failed");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
      <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-[#F8F9FB]">
        <FramerMotionProvider>
        <fieldset className="rounded-xl w-[24rem] h-[15rem] p-8 shadow-xl bg-white border border-gray-200">
          <legend className="text-2xl font-bold text-[#F75904]/60 mb-6">
            Verify Your Account
          </legend>

          <p className="text-md text-gray-500 mb-4">
            Click the button below to verify your account.
          </p>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn mt-6 w-full bg-[#F75904]/60 hover:bg-[#F75904]/70 text-white rounded-lg text-lg font-semibold disabled:opacity-50 p-2"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </fieldset>
        </FramerMotionProvider>
      </div>
  );
}

export default VerifyYourAccount;
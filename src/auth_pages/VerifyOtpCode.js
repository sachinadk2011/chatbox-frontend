import {useContext, useState} from 'react';
import UserContext from '../context/users/UserContext';
import {
  useNavigate
} from "react-router-dom";
import SetAuthToken from '../utils/SetAuthToken';

const VerificationCode = ()=>{
  const {verifyOtp, getUser, setUser, resendOtp} = useContext(UserContext);
  let navigate = useNavigate();
  const {email, from} = JSON.parse(localStorage.getItem("tempData")) || {email:"", from:""};

  const [otpCode, setOtpCode] = useState("");
  const handleInput = (e, index) => {
    const value = e.target.value;
    
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = otpCode.split("");
      newOtp[index - 1] = value;
      setOtpCode(newOtp.join(""));
      
    }

    if (value.length === 1) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
      
    }

  }
  const handleKeyDown = (e, index) => {
  if (e.key === "Backspace" && !e.target.value && index > 1) {
    const prev = document.getElementById(`otp-${index - 1}`);
    if (prev) prev.focus();
  }
};
  const handleSumit = async(e)=>{
    e.preventDefault();
    try {
      const json = await verifyOtp(email, otpCode);
      console.log(json.message);
      
      if (from === "signup"){
        localStorage.setItem("token", json.token);
        SetAuthToken(json.token);
        const userdata = await getUser();
        
        localStorage.setItem("user", JSON.stringify(userdata.user));
        setUser(userdata.user);
      
      navigate("/");
      }else if (from === "resetpassword"){
        
        navigate("/set-new-password");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  }

  const handleResend = async()=>{
    try{
      const json = await resendOtp(email);
      console.log(json.message);
      const inputs = document.querySelectorAll('input[type="text"]');
      inputs.forEach((input) => (input.value = ""));
      setOtpCode("");
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  }


    return(
        <>
       
<div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
  <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
    <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="font-semibold text-3xl">
          <p>Email Verification</p>
        </div>
        <div className="flex flex-row text-sm font-medium text-gray-400">
          <p>We have sent a verification code to your email {email.split("@")[0].split("").slice(0,3).join("")}***@{email.split("@")[1]}</p>
        </div>
      </div>

      <div>
        <form onSubmit={handleSumit} method="post">
          <div className="flex flex-col space-y-16">
            <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
              {[1,2,3,4,5,6].map((i)=>{
                return(
                  <div className="w-16 h-16 mr-2 " key={i}>
                <input className="w-full h-full flex flex-col items-center justify-center text-center  outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700" type="text" name={`otp-${i}`} id={`otp-${i}`}
                autoFocus={i===1 ? true : false}
                 onInput={(e) => handleInput(e, i)}
                 maxLength={1}
                 onKeyDown={(e) => handleKeyDown(e, i)}
                  />
              </div>
                )
              })}
              
            </div>

            <div className="flex flex-col space-y-5">
              <div>
                <button type="submit" className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm">
                  Verify Account
                </button>
              </div>

              <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                <p>Didn't recieve code?</p> <button className="flex flex-row items-center text-blue-600"  onClick={handleResend}>Resend</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
        </>
    )
}

export default VerificationCode;
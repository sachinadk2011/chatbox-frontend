import {useContext, useState} from 'react';
import UserContext from '../context/users/UserContext';
import {
  useNavigate
} from "react-router-dom";

const UpdateEmail = ()=>{
    const {forgetPassword} = useContext(UserContext);
    let navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const email = document.querySelector('.email-input').value;
        try {
          const json = await forgetPassword(email);
          console.log(json.message);
          localStorage.setItem("tempData", JSON.stringify({email, from:"resetpassword"}));
          navigate("/verify-otp");
        } catch (error) {
          console.error("Error in updating email:", error);
        }
    }
    return(
        <>
       
<div className="bg-gray-100">
    <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            
            <p className="text-gray-600 mb-6">Enter the Your Email Address to Change Password</p>
            <div className="mb-4">
                <input type="email" placeholder="you@example.com" className="email-input w-full px-4 py-2 border rounded-lg text-gray-700 focus:border-blue-500" />
            </div>
            <button onClick={handleSubmit} className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none">submit</button>
        </div>
    </div>
</div>
        </>
    )
}

export default UpdateEmail;
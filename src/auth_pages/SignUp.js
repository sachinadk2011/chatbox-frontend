import React, { useContext, useState } from 'react'
import UserContext from '../context/users/UserContext';
import {  useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc"; // Google icon
import { decodeJwt } from 'jose';
import SetAuthToken from '../utils/SetAuthToken';


const SignUp = () => {
  const {signup, getUser, setUser, googleLogin} = useContext(UserContext);
  const [credential, setCredential] = useState({
    email: "",
    password: "",
    name: "",
    cpassword: "",
  });
  const navigate  = useNavigate();

  

  const HandleSignup = async(e)=>{
    e.preventDefault();
    const {name,email,password, cpassword} = credential;
    /* if (!name && !email && !password && !cpassword){
      console.log("cant be empty")
    } */
   if (cpassword !== password){
    console.log("dont match")
    setCredential({
    email: "",
    password: "",
    name: "",
    cpassword: "",
  });
  return 0;
   }
    try {
      const json = await signup(name,email , password)
      console.log(json.message);
      localStorage.setItem("token", json.token);
      SetAuthToken(json.token);
      const userdata = await getUser();
      
      localStorage.setItem("user", JSON.stringify(userdata.user));
      setUser(userdata.user);
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  }

  const ochange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };
    return(
        <>
       
<div className="bg-gray-100 flex justify-center items-center h-screen">

  <div className="w-1/2 h-screen hidden  lg:block">
    <img 
      src="https://res.cloudinary.com/macxenon/image/upload/v1631570592/Run_-_Health_qcghbu.png" 
      alt="Signup Illustration" 
      className="object-cover w-full h-full"
    />
  </div>

  {/* Scrollable form container */}
  <div className="lg:p-36 md:p-20 sm:p-16 p-8 w-full lg:w-1/2 overflow-y-auto">

    <h1 className="text-3xl font-semibold mb-6 text-center">Sign Up</h1>

    <form onSubmit={HandleSignup}>

      {/* username */}
      <div className="mb-4">
        <label className="block text-gray-600">Username</label>
        <input 
          type="text"
          id="name"
          name="name"
          value={credential.name}
          minLength={3}
          onChange={ochange}
          required
          className="w-full border border-gray-300 rounded-md py-3 px-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* email */}
      <div className="mb-4">
        <label className="block text-gray-600">Email</label>
        <input 
          type="email"
          id="email"
          name="email"
          value={credential.email}
          onChange={ochange}
          required
          className="w-full border border-gray-300 rounded-md py-3 px-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* password */}
      <div className="mb-4">
        <label className="block text-gray-600">Password</label>
        <input 
          type="password"
          id="password"
          name="password"
          minLength={8}
          value={credential.password}
          onChange={ochange}
          autoComplete="off"
          required
          className="w-full border border-gray-300 rounded-md py-3 px-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* confirm password */}
      <div className="mb-6">
        <label className="block text-gray-600">Confirm Password</label>
        <input 
          type="password"
          id="cpassword"
          name="cpassword"
          minLength={8}
          value={credential.cpassword}
          onChange={ochange}
          autoComplete="off"
          required
          className="w-full border border-gray-300 rounded-md py-3 px-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* button */}
      <button 
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-3 px-4 w-full"
      >
        Sign Up
      </button>
    </form>

    {/* OR section */}
    <div className="mt-4 text-center text-gray-600">OR</div>

    <div className="mt-4 flex justify-center">
     
        <GoogleLogin
        
          onSuccess={async(credentialResponse) => {
            console.log("JWT Token:", credentialResponse);
            const {credential} = credentialResponse;
                const payload = credential ? decodeJwt(credential) : null;
                console.log("Decoded JWT Payload:", payload);
                if (payload) {
                  const email = payload.email;
                  console.log("User Email from Google JWT:", email);
                  // You can implement further logic here, such as checking if the user exists in your database
                  // and logging them in or creating a new account.
                }
                try {
      const json = await googleLogin(credential)
      console.log(json.message);
      localStorage.setItem("token", json.token);
      SetAuthToken(json.token);
      const userdata = await getUser();
      
      localStorage.setItem("user", JSON.stringify(userdata.user));
      setUser(userdata.user);
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
    }
          }}
          onError={(error) => {
            console.log("Login Failed", error);
          }}
          type="standard"
          
          
        />
      </div>

    {/* Already have account */}
    <div className="mt-6 text-center">
      <p className="text-gray-600">Already have an account?</p>
      <a href="/login" className="text-blue-500 hover:underline">
        Login Here
      </a>
    </div>

  </div>
</div>

        </>
        )
}

export default SignUp;
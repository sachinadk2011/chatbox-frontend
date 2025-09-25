import React, { useContext, useState } from 'react'
import UserContext from '../context/users/UserContext';
import { Link, useNavigate } from 'react-router-dom';


const SignUp = () => {
  const {signup, getUser} = useContext(UserContext);
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
      const userdata = await getUser();
      if (!userdata.success) {
        throw new Error(userdata.message);
      }
      localStorage.setItem("user", JSON.stringify(userdata.user));
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
       
<div className="bg-white relative lg:py-20">
  <div className="flex flex-col items-center justify-between pt-0 pr-10 pb-0 pl-10 mt-0 mr-auto mb-0 ml-auto max-w-7xl
      xl:px-5 lg:flex-row">
    <div className="flex flex-col items-center w-full pt-5 pr-10 pb-20 pl-10 lg:pt-20 lg:flex-row">
      <div className="w-full bg-cover relative max-w-md lg:max-w-2xl lg:w-7/12">
        <div className="flex flex-col items-center justify-center w-full h-full relative lg:pr-10">
          <img src="https://res.cloudinary.com/macxenon/image/upload/v1631570592/Run_-_Health_qcghbu.png" className="btn-"/>
        </div>
      </div>
      <div className="w-full mt-20 mr-0 mb-0 ml-0 relative z-10 max-w-2xl lg:mt-0 lg:w-5/12">
      <form onSubmit={HandleSignup}>
        <div className="flex flex-col items-start justify-start pt-10 pr-10 pb-10 pl-10 bg-white shadow-2xl rounded-xl
            relative z-10">
          <p className="w-full text-4xl font-medium text-center leading-snug font-serif">Sign up for an account</p>
          <div className="w-full mt-6 mr-0 mb-0 ml-0 relative space-y-8">
            <div className="relative">
              <p className="bg-white pt-0 pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600
                  absolute">Username</p>
              <input  type="text" className="border placeholder-gray-400 focus:outline-none
                  focus:border-black w-full pt-4 pr-4 pb-4 pl-4 mt-2 mr-0 mb-0 ml-0 text-base block bg-white
                  border-gray-300 rounded-md" id="name"
            name="name"
            onChange={ochange}
            value={credential.name}
            minLength={3}
            required/>
            </div>
            <div className="relative">
              <p className="bg-white pt-0 pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600 absolute">Email</p>
              <input placeholder="123@ex.com" type="text" className="border placeholder-gray-400 focus:outline-none
                  focus:border-black w-full pt-4 pr-4 pb-4 pl-4 mt-2 mr-0 mb-0 ml-0 text-base block bg-white
                  border-gray-300 rounded-md"
                   id="email"
            name="email"
            onChange={ochange}
            value={credential.email}
            aria-describedby="emailHelp"
            required/>
            </div>
            <div className="relative">
              <label htmlFor="password" className="bg-white pt-0 pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600
                  absolute">Password</label>
              <input placeholder="Password" type="password" className="border placeholder-gray-400 focus:outline-none
                  focus:border-black w-full pt-4 pr-4 pb-4 pl-4 mt-2 mr-0 mb-0 ml-0 text-base block bg-white
                  border-gray-300 rounded-md"
                  id="password"
            name="password"
            minLength={8}
            onChange={ochange}
            autoComplete="off"
            value={credential.password}
            required/>
            </div>
            <div className="relative">
              <label htmlFor="cpassword" className="bg-white pt-0 pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600
                  absolute">Confirm Password</label>
              <input placeholder="Confirm Password" type="password" className="border placeholder-gray-400 focus:outline-none
                  focus:border-black w-full pt-4 pr-4 pb-4 pl-4 mt-2 mr-0 mb-0 ml-0 text-base block bg-white
                  border-gray-300 rounded-md"
                  id="cpassword"
            name="cpassword"
            minLength={8}
            onChange={ochange}
            autoComplete="off"
            value={credential.cpassword}
            required/>
            </div>
            <div className="relative">
              <button className="w-full inline-block pt-4 pr-5 pb-4 pl-5 text-xl font-medium text-center text-white bg-indigo-500
                  rounded-lg transition duration-200 hover:bg-indigo-600 ease"
                  type='submit'>Signup</button>
            </div>
          </div>
        <div className="mt-6 text-black relative text-center">
          <p className="pl-16 inline-block">Already have an account?</p>
    <a href="/login" className="hover:underline text-blue-500"> Login Here</a>
  </div>
        </div>
        </form>
        </div>
    </div>
  </div>
</div>
        </>)
}

export default SignUp;
import {useState, useContext} from 'react'
import { useNavigate } from "react-router";
import UserContext from '../context/users/UserContext';



const Login = () => {
  let navigate = useNavigate();
  const {login} = useContext(UserContext);
    const [credential, setCredential] = useState({
      email: "",
      password: "",
      
      
    });

     const ochange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async(event) => {
    event.preventDefault();
    const {email, password} = credential;
    const json = await login(email, password);
    console.log(json);
    if (json.success) {
      console.log("json.message: ", json.message);
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      // setUser(json.user);
      navigate("/");
    }
    else{
      console.log("Error creating account: ", json.error);
      
    }
  }

  return (
    <>
       <div className="bg-gray-100 flex justify-center items-center h-screen">
    
<div className="w-1/2 h-screen hidden lg:block">
  <img src="https://placehold.co/800x/667fff/ffffff.png?text=Your+Image&font=Montserrat" alt="Placeholder" className="object-cover w-full h-full" />
</div>

<div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
  <h1 className="text-2xl font-semibold mb-4">Login</h1>
  <form action="/" onSubmit={handleSubmit} method="POST">
    
    <div className="mb-4">
      <label htmlFor="email" className="block text-gray-600">Email</label>
      <input type="email" id="email" name="email"
      value={credential.email} onChange={ochange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
    </div>
    
    <div className="mb-4">
      <label htmlFor="password" className="block text-gray-600">Password</label>
      <input type="password" id="password" name="password"
      value={credential.password} onChange={ochange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
    </div>
    
    <div className="mb-4 flex items-center">
      <input type="checkbox" id="remember" name="remember" className="text-blue-500" />
      <label htmlFor="remember" className="text-gray-600 ml-2">Remember Me</label>
    </div>
    
    <div className="mb-6 text-blue-500">
      <a href="#" className="hover:underline">Forgot Password?</a>
    </div>
    
    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full" >Login</button>
  </form>
  
  <div className="mt-6 text-blue-500 text-center">
    <a href="/register" className="hover:underline">Sign up Here</a>
  </div>
</div>
</div>
    </>
  )
}

export default Login;
import {useState, useContext} from 'react'
import { useNavigate } from "react-router";
import UserContext from '../context/users/UserContext';



const Login = () => {
  let navigate = useNavigate();
  const {login, getUser} = useContext(UserContext);
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
    try {
      const json = await login(email, password);
      console.log("json: ", json, json.success);
      
      if (!json.success) {
        throw new Error(json.error || 'Login failed');
      } 
        console.log("json.message: ", json.message, json.user, json.token);
        localStorage.setItem("token", json.token);
        localStorage.setItem("user", JSON.stringify(json.user));
        
        console.log("user: ", localStorage.getItem("user"));
        
        const userdata = await getUser();
        if (!userdata.success) {
          throw new Error(userdata.message);
        }
        // setUser(json.user);
        navigate("/");
    } catch (error) {
      setCredential({
          email: "",
          password: "" 
               });
      console.error("Error logging in:", error);
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
  <form  onSubmit={handleSubmit} method="POST">
    
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
    <a href="/signup" className="hover:underline">Sign up Here</a>
  </div>
</div>
</div>
    </>
  )
}

export default Login;
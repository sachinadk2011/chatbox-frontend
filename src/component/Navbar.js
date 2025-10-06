import React from 'react'
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Common icon container
  const IconWrapper = ({ children, tooltip, hoverColor = 'blue', path="/"  }) => (
    <div className="relative group inline-block">
      <div className={`transition-colors duration-200 fill-green-500  stroke-green-500  hover:fill-${hoverColor}-500 hover:stroke-${hoverColor}-500  rounded-lg cursor-pointer`}>
        <Link className={`nav-link ${location.pathname ===`${path}` ? `active : fill-black active: stroke-black  hover:fill-${hoverColor}-500 hover:stroke-${hoverColor}-500` : ""}`}
        aria-current="page"
                  to={`${path}`}>
        {children}
        </Link>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                         hidden px-2 py-1 text-xs text-white bg-gray-700 rounded-md 
                         group-hover:block">
          {tooltip}
        </span>
      )}
    </div>
  );
  return (

   <>
  

<aside class="flex">
    <div class="flex flex-col items-center w-16 h-screen pt-24 pb-8  space-y-8 bg-white border-r dark:border-gray-700">

       <IconWrapper tooltip={"Home"} hoverColor="blue" path="/" >
        
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  className="size-8  ">
  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
</svg>



        </IconWrapper>
<IconWrapper tooltip={"Friends"} hoverColor="blue" path="/friends" >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  className="size-6 ">
  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
</svg>

</IconWrapper>
<IconWrapper tooltip={"Add Friend"} hoverColor="blue" path="/friends/add-friend" >
 
 <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  className="size-6  " > 
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
</svg></IconWrapper>

<IconWrapper tooltip={"Sent Friends Requests"} hoverColor="blue" path="/friends/sent-requests" >
<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  className="size-6 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h6m0 0l-3 3m3-3l-3-3" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.318 12.318 0 0 1 9.375 21c-2.33 0-4.512-.645-6.374-1.765Z" />
</svg></IconWrapper>

<IconWrapper tooltip={"Received Friends Requests"} hoverColor="blue" path="/friends/received-requests" >
<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  className="size-6 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12h-6m0 0 3-3m-3 3 3 3" />
  <path strokeLinecap="round" strokeLinejoin="round" 
        d="M12.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.318 12.318 0 0 1 9.375 21c-2.33 0-4.512-.645-6.374-1.765Z" />
</svg></IconWrapper>


    </div>
    
   
   
</aside>


   </>
  )
}

export default Navbar;
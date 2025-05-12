// Header.jsx
import React, { useState } from 'react';

const Header = () => {
  const [showSidenav, setShowSidenav] = useState(false);

  return (
    <header className="relative bg-gradient-to-br from-lime-300 to-green-500 p-4 flex items-center justify-between">
      {/* Menu Button - visible on all screen sizes now */}
      
      <div >
      <button onClick={()=>setShowSidenav(true)} class="relative group mr-3">
        <div class="relative flex items-center justify-center rounded-full w-[50px] h-[50px] transform transition-all bg-slate-700 ring-0 ring-gray-300 hover:ring-8 group-focus:ring-4 ring-opacity-30 duration-200 shadow-md">
          <div  class={`flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-300 group-focus:-rotate-[45deg] origin-center `}>
            <div class="bg-white h-[2px] w-1/2 rounded transform transition-all duration-300 group-focus:-rotate-90 group-focus:h-[1px] origin-right delay-75 group-focus:-translate-y-[1px]"></div>
            <div class="bg-white h-[1px] rounded"></div>
            <div class="bg-white h-[2px] w-1/2 rounded self-end transform transition-all duration-300 group-focus:-rotate-90 group-focus:h-[1px] origin-left delay-75 group-focus:translate-y-[1px]"></div>
          </div>
        </div>
      </button>
    </div>
       
      

      {/* Search Bar */}
      <form className="relative flex w-full max-w-md mx-auto">
        <input
          type="search"
          placeholder="Search..."
          className="peer transition-all duration-300 ease-in-out cursor-pointer relative z-10 h-12 w-12 sm:w-12 rounded-full border bg-transparent pl-12 outline-none focus:w-full focus:cursor-text focus:border-lime-300 focus:pl-16 focus:pr-4"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500 peer-focus:text-lime-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* Sidebar Navigation */}
     { <nav
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-slate-800 text-slate-100 p-6 transform transition-transform duration-300 ${
          showSidenav ? 'translate-x-0' : '-translate-x-72'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button onClick={() => setShowSidenav(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="space-y-4">
          <li className="hover:bg-slate-700 rounded px-3 py-2 cursor-pointer">Friends</li>
          <li className="hover:bg-slate-700 rounded px-3 py-2 cursor-pointer">Suggestions</li>
          <li className="hover:bg-slate-700 rounded px-3 py-2 cursor-pointer">Friend Requests</li>
          <li className="hover:bg-slate-700 rounded px-3 py-2 cursor-pointer">Sent Requests</li>
        </ul>
      </nav>}
    </header>
  );
};

export default Header;

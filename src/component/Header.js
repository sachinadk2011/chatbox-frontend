// Header.jsx
import React, { useState } from 'react';
import FriendList from './friends/FriendList';
import { Link } from 'react-router-dom';

const Header = () => {
  const [showSidenav, setShowSidenav] = useState(false);

  return (
    <header className=" bg-gradient-to-br from-lime-300 to-green-500 p-4 flex items-center justify-between">
    
       
      

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

    
    </header>
  );
};

export default Header;

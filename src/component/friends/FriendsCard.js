import React from 'react'

const FriendsCard = ({name, mutualFriends}) => {
    return (
        <>
        {/* <div className="w-1/5 ">
<div className="flex  flex-col items-center justify-center ">
      <div className="w-full max-w-lg py-8 flex flex-row items-center justify-center mx-auto bg-[#FFFBFB] rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row w-3/4 md:w-5/6 space-x-0 md:space-x-8">
          <div className="w-full md:w-1/5 flex flex-col items-center justify-center">
            <figure className="w-1/2 md:w-full rounded-full overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${name}&background=random&color=random&bold=true&rounded=true`} alt="" className="w-10 md:w-16 h-10 md:h-16 rounded-full" />
            </figure>
          </div>
          <div className="w-full md:w-3/5 space-y-4 flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-center md:text-left text-2xl font-bold text-gray-900">
                {name}
              </h1>
              
            </div>

            

            <ul className="space-x-4 flex flex-row justify-center w-full mb-4">
              <li className="text-sm text-gray-800">
                <strong className="text-gray-900">{mutualFriends}</strong> Mutual Friends
              </li>
              <li className="text-sm text-gray-800">
                <strong className="text-gray-900">100</strong> Friends
              </li>
            </ul>

            <button className="transition-colors bg-purple-700 hover:bg-purple-800 p-2 rounded-sm w-full text-white shadow-md shadow-purple-900">
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>
    </div> */}

    
<div className="bg-white pt-10 shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition">
      <img
        src={`https://ui-avatars.com/api/?name=${name}&background=random&color=random&bold=true&rounded=true`}
        alt={name}
        className="w-24 h-24 mx-auto rounded-full -mt-12 border-4 border-white shadow-md"
      />
      
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{name}</h3>
      
      <div className="flex justify-around items-center my-4 text-sm text-gray-700">
        <span>
          <strong>{mutualFriends}</strong> Mutual Friends
        </span>
        <span>
          <strong>{Math.floor(Math.random() * 2000)}</strong> Friends
        </span>
      </div>

      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition">
        Add Friend
      </button>
    </div>

    </>
    )
}   
export default FriendsCard

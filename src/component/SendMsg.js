import React, { useContext } from 'react'
import UserContext from '../context/users/UserContext';

export const SendMsg = (props) => {
  const { chats, user } = useContext(UserContext);
  return (
    <>
      <div className="chat-message">
         <div className="flex items-end justify-end">
            <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
               <div><span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">{props.send} </span></div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${!user?chats[0].name:user}&background=random&color=random&bold=true&rounded=true`} alt="My profile" className="w-6 h-6 rounded-full order-2" />
         </div>
      </div>
    </>
  )
}
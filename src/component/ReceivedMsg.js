import React, { useContext } from 'react'
import UserContext from '../context/users/UserContext';

export const ReceivedMsg = (props) => {
  const {  user } = useContext(UserContext);
  return (
    <>
      <div className="chat-message">
         <div className="flex items-end">
            <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
               <div><span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">{props.received}</span></div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${user}&background=random&color=random&bold=true&rounded=true`} alt="My profile" className="w-6 h-6 rounded-full order-1" />
         </div>
      </div>
    </>
  )
}
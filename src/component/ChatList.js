import React from 'react';

/* this is the list of people */
const ChatList = (props) => {
    
    return(
        <>
        <div className="flex items-center w-full cursor-pointer" onClick={props.onClick}>
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3" >
                <img src={`https://ui-avatars.com/api/?name=${props.name}&background=random&color=random&bold=true&rounded=true`} alt="User Avatar" className="w-12 h-12 rounded-full" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{props.name}</h2>
                <p className="text-gray-600">{props.message}  </p>
              </div>
          </div>
        </>
    )
}

export default ChatList;
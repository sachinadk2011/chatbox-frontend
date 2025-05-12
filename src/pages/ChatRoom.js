import React from 'react';
import ChatWindow from '../component/ChatWindow';
import SidebarList from '../component/SidebarList';

/* this is home page where people list and one of people chat is open
sidebarlist act as list of people name with certain message
and chatwindow is certain person opened message in right side */
const ChatRoom = () => {
   
    return(
        <>
        <div className="bg-gray-100 flex justify-center items-center ">
        <SidebarList />
        <div className="w-full relative -top-20">
        <ChatWindow />
        </div>
        </div>
        </>
    )
}

export default ChatRoom;
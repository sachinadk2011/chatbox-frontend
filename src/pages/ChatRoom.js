import React from 'react';
import ChatWindow from '../component/ChatWindow';
import SidebarList from '../component/SidebarList';

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
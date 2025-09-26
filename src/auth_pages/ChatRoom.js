import React from 'react';
import ChatWindow from '../component/ChatWindow';
import SidebarList from '../component/SidebarList';
import MessageContext from '../context/message/MessageContext';

/* this is home page where people list and one of people chat is open
sidebarlist act as list of people name with certain message
and chatwindow is certain person opened message in right side */
const ChatRoom = () => {
    const {Selecteduser} = React.useContext(MessageContext);
    console.log("chatroom "+ Selecteduser);

    return(
        <>
        <div className="bg-gray-100 flex justify-center items-center ">
        <SidebarList />
        <div className="w-full relative -top-20">
        {Selecteduser.receiverId ? <ChatWindow /> :
         <div className="text-gray-500 flex absolute  left-1/3">Select a user to start chatting</div>}
        </div>
        </div>
        </>
    )
}

export default ChatRoom;
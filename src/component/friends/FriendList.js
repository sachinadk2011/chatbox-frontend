import React, { useState , useContext} from 'react';
import FriendsContext from '../../context/friends/FriendsContext';
import Headers from '../Header';
import ChatList from '../ChatList';
import SidebarList from '../SidebarList';
import ChatWindow from '../ChatWindow';
import MessageContext from '../../context/message/MessageContext';

const FriendList = () => {
  const { friends } = useContext(FriendsContext);
  const {Selecteduser} = React.useContext(MessageContext);

  return (
    <>
    <div className="w-1/4 bg-white border-r border-gray-300">
      <Headers />
      <SidebarList />
       
    </div>
    <div className="w-full relative -top-20">
      {Selecteduser.receiverId ? <ChatWindow /> :
         <div className="text-gray-500 flex absolute  left-1/3">Select a user to start chatting</div>}
        </div>
    
    </>
  );
}


export default FriendList;
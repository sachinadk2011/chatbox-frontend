import React from 'react'
import ChatList from './ChatList';
import Header from './Header';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';

const SidebarList = () => {
    const { setSelectedUser, messages } = React.useContext(MessageContext);
    
    const { friends } = React.useContext(FriendsContext);
    const length = messages.length;
    const DisplayChat = (friend) => {
        setSelectedUser({
              receiverId: friend.id,          // friend’s id
              receiverName: friend.name,      // friend’s name
              senderId: localStorage.getItem('user').id,              // your id
              senderName: localStorage.getItem('user').name           // your name
  });
        console.log(friend.name)
    }
    
    return(
        <>
        
        <div className="w-1/4 bg-white border-r border-gray-300">
          
          <Header />
        
         
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20"  >
          {friends.map((element)=>{
            return(
            <div key={element.id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList  name={element.name} message={length > 0 ? messages[length -1].message.slice(0,20): "Chat to start messaging"}
              onClick={()=>DisplayChat(element)} />
            </div>
        )})}
        </div>
        </div>
        </>
    )
}


export default SidebarList;
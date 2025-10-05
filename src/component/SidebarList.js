import React, {useContext, useEffect} from 'react'
import ChatList from './ChatList';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';
import { useNavigate } from "react-router";
import UserContext from '../context/users/UserContext';

const SidebarList = () => {
   let navigate = useNavigate();
    const { setSelectedUser, messages, fetchMessages } = useContext(MessageContext);
    const { friends, fetchFriends } = useContext(FriendsContext);
    const { user } = useContext(UserContext);

    //;
    
   
    const length = messages.length;

    useEffect( () => {
      const fetchdata = async()=>{
      try{
      await fetchFriends();
    await fetchMessages();
    console.log("sidebarlist useeffect: ", await fetchMessages());
  }catch(error){
    console.error("Error in sidebarlist useeffect:", error);
    if (!error.success){
      navigate("/login");
    }
  }
    }
    fetchdata();

   //setUser(JSON.parse(localStorage.getItem('user')))
  }, [fetchFriends, fetchMessages, navigate]);

  //console.log("sidebarlist "+JSON.stringify(selectedUser));
  //console.log("sidebarlist friend "+JSON.stringify(friends));
  //console.log("sidebarlist "+JSON.stringify(messages));
  //console.log( JSON.parse(localStorage.getItem("user")).name, JSON.parse(localStorage.getItem('user')).id);

  let lastMsg = length > 0 ? messages[length - 1].message : null;
  let previewText = "Tap to start messaging"
  if (lastMsg){
    let isYou = messages[length - 1].sender._id === user?.id ;
    previewText =( isYou ? "You: ": "") +   lastMsg.slice(0, 20);
  }

    const DisplayChat = (friend) => {
      console.log("friend: ", friend);
      console.log("user: ", user);

        setSelectedUser({
              receiverId: friend._id,          // friend’s id
              receiverName: friend.name,      // friend’s name
              senderId: JSON.parse(localStorage.getItem('user')).id,              // your id
              senderName: JSON.parse(localStorage.getItem('user')).name           // your name
  });
        
       // console.log(selectedUser);
    }
    //console.log("1"+messages[length-1]?.sender?.name, user?.name);
    
    return(
        <>
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20"  >
          {friends.map((element)=>{
            return(
            <div key={element._id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList  name={element.name} message={previewText}
              onClick={()=>DisplayChat(element)} />
            </div>
        )})}
        </div> 
        
        </>
    )
}


export default SidebarList;
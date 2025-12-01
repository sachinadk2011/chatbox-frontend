import React, {useContext, useEffect} from 'react'
import ChatList from './ChatList';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';
import { useNavigate } from "react-router";
import UserContext from '../context/users/UserContext';
import SetAuthToken from '../utils/SetAuthToken';

const SidebarList = () => {
   let navigate = useNavigate();
    const { setSelectedUser,selectedUser, messages, fetchMessages, setMessages } = useContext(MessageContext);
    const { friends, fetchFriends, setFriends } = useContext(FriendsContext);
    const { user, RefreshToken } = useContext(UserContext);

    //;
    
   
    

    useEffect( () => {
      console.log("Setting up axios interceptors in SidebarList", user, localStorage.getItem("token"));
      SetAuthToken(localStorage.getItem("token"));
      if (!user) return;
      const fetchdata = async()=>{
      try{
     const frd= await fetchFriends();
    const msg= await fetchMessages();
    console.log("Fetched friends and messages in SidebarList useEffect", frd);
    setFriends(frd);
    setMessages(msg.reduce((acc, mg)=>{
              const otherUserId = mg.sender._id.toString() === user?.id.toString() ? mg.receiver._id.toString() : mg.sender._id.toString();
              
              if(frd.some(frd => frd._id.toString() === otherUserId)){
                let existing = acc.find(item => item.otherUserId === otherUserId);
                if (existing) {
                  existing.messages.push(mg);
                } else {
                  acc.push({ otherUserId:otherUserId, messages: [mg] });
                }
                
              }
              //console.log("acc: ", acc);
              return acc;
            }, []));
   
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

   console.log("friends: ", friends);
  console.log("messages: ", messages);
  const lastMsg = friends.map(frd => {
  const chat = messages.find(msg => msg.otherUserId === frd._id.toString());
  
  let previewText = "Tap to start messaging";

  if (chat && chat.messages.length > 0) {
    const lastMessage = chat.messages[chat.messages.length - 1]; // last message object
    const isYou = lastMessage.sender._id === user?.id;

    // Use .message field (text), not the whole object
    previewText = (isYou ? "You: " : "") + (lastMessage.message.length < 20 ? lastMessage.message : lastMessage.message.slice(0, 20) + '...');
  }

  return {
    frdId: frd._id,
    message: previewText
  };
});

 
  
  
  console.log("lastMsg: ", lastMsg);
  
  
  
    const DisplayChat = (friend) => {
      console.log("friend11: ", friend);
      console.log("user1: ", user);

        setSelectedUser({
              receiverId: friend._id,          // friend’s id
              receiverName: friend.name,      // friend’s name
              senderId: JSON.parse(localStorage.getItem('user')).id,              // your id
              senderName: JSON.parse(localStorage.getItem('user')).name,           // your name
              lastActive: friend.lastActive,
              onlineStatus: friend.onlineStatus
  });
  
        
  
}
    //console.log("1"+messages[length-1]?.sender?.name, user?.name);
    
    return(
        <>
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20"  >
          {friends.map((element)=>{
            return(
            <div key={element._id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList  name={element.name} message={lastMsg.find(msg=> msg.frdId === element._id)?.message}
              onClick={()=>DisplayChat(element)} mutualfrdlen={element.mutualfrdlen} profileUrl={element.profile_Url} frdlen={element.friends.length} />
            </div>
        )})}
        </div> 
        
        </>
    )
}


export default SidebarList;
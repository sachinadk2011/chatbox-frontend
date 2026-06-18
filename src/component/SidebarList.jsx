import React, {useContext, useEffect} from 'react'
import ChatList from './ChatList';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';
import { useNavigate, useLocation } from "react-router";
import UserContext from '../context/users/UserContext';
import SetAuthToken from '../utils/SetAuthToken';
import { getSidebarDateLabel } from '../utils/dateUtils';

const SidebarList = () => {
   const navigate = useNavigate();
    const location = useLocation();
    const { setSelectedUser,selectedUser, messages, fetchMessages, setMessages } = useContext(MessageContext);
    const { friends, fetchFriends, setFriends } = useContext(FriendsContext);
    const { user, RefreshToken } = useContext(UserContext);

    //;
    
   
    

    useEffect( () => {
      if (!user?.id) return; // wait until user is loaded
      
      const fetchdata = async (retryCount = 0) => { // retryCount properly defined as parameter
      try{
     const frd= await fetchFriends();
    const msg= await fetchMessages();
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
              return acc;
            }, []));
   
  }catch(error){
   
    /* console.error("Error in sidebarlist:", error); */

    const isAuth = error.response?.status === 401
      || error.status === 401       // set by interceptor on refresh failure
      || error.isAuthFailure;       // set by interceptor on 4xx refresh rejection

    if (isAuth) {
      navigate("/login"); // real auth failure — redirect to login
    } else if (!error.response && !error.isAuthFailure && retryCount < 2) {
      // Network error only (no response from server) — might be waking up
      console.log(`Server may be waking up, retrying in 3s (attempt ${retryCount + 1})`);
      setTimeout(() => fetchdata(retryCount + 1), 3000);
    }
    // 4xx (other than 401) or 5xx → StatusGate handles the error page
  }
    }
    fetchdata();

  }, [user?.id, fetchFriends, fetchMessages, navigate]);

 
  const lastMsg = friends.map(frd => {
  const chat = messages.find(msg => msg.otherUserId === frd._id.toString());
  let previewText = "Tap to start messaging";
  let lastMsgTime = null;
  let lastMsgStatus = null;
  let isLastMsgMine = false;
  let unreadCount = 0;
  let rawDate = null;

  if (chat && chat.messages.length > 0) {
    const lastMessage = chat.messages[chat.messages.length - 1];
    

    // Is the last message mine?
    isLastMsgMine = lastMessage.sender?._id?.toString() === user?.id?.toString();
    lastMsgStatus = lastMessage.status;
    const date = lastMessage.date;
    lastMsgTime   = date ? getSidebarDateLabel({  date }) : null;
    rawDate = date ?? null;

    unreadCount = chat.messages.filter(msg => {
      return msg.sender?._id?.toString() !== user?.id?.toString() && msg.status !== "read";
    }).length;

    const rawText  = lastMessage.message ?? '';
    const msgTypes = lastMessage.types || 'text';

    let displayText;
    if (msgTypes === 'image')    displayText = '📷 Photo';
    else if (msgTypes === 'video')    displayText = '🎥 Video';
    else if (msgTypes === 'multiple') displayText = '📎 Attachments';
    else displayText = rawText.length < 30 ? rawText : rawText.slice(0, 30) + '...';

    // Only prepend "You:" for your own messages — received ones show as-is
    previewText = (isLastMsgMine ? 'You: ' : '') + displayText;
  }

  return {
    frdId: frd._id,
    message: previewText,
    time:    lastMsgTime,
    status:  lastMsgStatus,
    isOwn:   isLastMsgMine,
    unreadCount,
    rawDate
  };
});



    const DisplayChat = (friend) => {
        setSelectedUser({
              receiverId: friend._id,          // friend’s id
              receiverName: friend.name,      // friend’s name
              senderId: JSON.parse(localStorage.getItem('user')).id,              // your id
              senderName: JSON.parse(localStorage.getItem('user')).name,           // your name
              lastActive: friend.lastActive,
              onlineStatus: friend.onlineStatus,
              profile_url: friend.profile_Url
  });
  // take path from url and in selected path user chat will display either as /chats/v1/... or /friends/list/v1/...
  let basePath =  location.pathname.split('/').filter(Boolean)
  let v1Index = basePath.indexOf("v1");
  let endIndex = v1Index !== -1  ? v1Index : basePath.length;
  /* console.info(`Navigating to chat :${basePath} \n ${basePath.slice(0, endIndex).join('/')}/v1/u/${friend._id}`); */  
  
    navigate(`/${basePath.slice(0, endIndex).join('/')}/v1/u/${friend._id}`);    
  
}

const sortedFriends = [...friends].sort(
  (a,b)=>{
    const aDate = lastMsg.find(m => m.frdId === a._id)?.rawDate;
    const bDate = lastMsg.find(m => m.frdId === b._id)?.rawDate;
  
  return (bDate ? new Date(bDate) : 0) - (aDate ? new Date(aDate) : 0);
  }
)

    
    return(
        <>
              <div className="overflow-y-auto h-full p-3 pb-4">
          {sortedFriends.map((element)=>{
            const msgData = lastMsg.find(msg => msg.frdId === element._id);
            return(
            <div key={element._id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList
                name={element.name}
                message={msgData?.message}
                time={msgData?.time}
                status={msgData?.status}
                isOwn={msgData?.isOwn}
                unreadCount={msgData?.unreadCount}
                onClick={() => DisplayChat(element)}
                mutualfrdlen={element.mutualfrdlen}
                profileUrl={element.profile_Url}
                frdlen={element.friends.length}
              />
            </div>
        )})}
        </div> 
        
        </>
    )
}


export default SidebarList;
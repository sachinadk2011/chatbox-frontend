import React, { useContext , useEffect} from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../context/message/MessageContext';


const MessageBox = () => {
    const { messages, fetchMessages, Selecteduser } = useContext(MessageContext);
    const { user } = useContext(UserContext);
    console.log("messagebox selecteduser: ", Selecteduser);
    console.log("messagebox messages: ", messages);
    console.log("messagebox user: ", user);

    
    
    
    

    return(
        <>
        {messages.find(e => e.otherUserId === Selecteduser.receiverId.toString())?.messages.slice().reverse().map(e=>{

          return(
            <React.Fragment key={e._id}>
            {e.receiver._id === user.id? <ReceivedMsg  received={e.message} /> : <SendMsg send={e.message} />}

            </React.Fragment>
          )
        })}
        </>
    )
}

export default MessageBox;
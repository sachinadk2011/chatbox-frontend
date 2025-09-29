import React, { useContext , useEffect} from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../context/message/MessageContext';
import socket from '../server/socket';

const MessageBox = () => {
    const { messages, fetchMessages, setMessages } = useContext(MessageContext);
    const { user } = useContext(UserContext);

    useEffect(() => {
      const fetchMessagedata = async()=>{
        await fetchMessages();
      }
      fetchMessagedata();
    }, [fetchMessages]);
    
    

    return(
        <>
        {messages.filter(e => user.id === e.receiver._id || user.id === e.sender._id).map(e=>{

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
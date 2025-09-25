import React, { useContext , useEffect} from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../context/message/MessageContext';

const MessageBox = () => {
    const { messages, fetchMessages } = useContext(MessageContext);
    const { user } = useContext(UserContext);

    useEffect(() => {
      const fetchMessagedata = async()=>{
        await fetchMessages();
      }
      fetchMessagedata();
    }, [fetchMessages]);

    return(
        <>
        {messages.filter(e => user.name === e.receiver.name || user.name === e.sender.name).map(e=>{
          
          return(
            <React.Fragment key={e._id}>
            {e.receiver.name===user.name? <ReceivedMsg  received={e.message} /> : <SendMsg send={e.message} />}

            </React.Fragment>
          )
        })}
        </>
    )
}

export default MessageBox;
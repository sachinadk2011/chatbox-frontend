import React, { useContext } from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../context/message/MessageContext';

const MessageBox = () => {
    const { messages } = useContext(MessageContext);
    const { user } = useContext(UserContext);

    return(
        <>
        {messages.filter(e => user === e.receiver.name || user === e.sender.name).map(e=>{
          
          return(
            <React.Fragment key={e.id}>
            {e.sender.name===user? <ReceivedMsg  received={e.message} /> : <SendMsg send={e.message} />}

            </React.Fragment>
          )
        })}
        </>
    )
}

export default MessageBox;
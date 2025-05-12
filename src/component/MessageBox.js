import React, { useContext } from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';

const MessageBox = () => {
  const { messages, user } = useContext(UserContext);
  
    return(
        <>
        {messages.filter(e => user === e.receiver || user === e.sender).map(e=>{
          
          return(
            <React.Fragment key={e.id}>
            {e.sender===user? <ReceivedMsg  received={e.message} /> : <SendMsg send={e.message} />}
            
            </React.Fragment>
          )
        })}
        </>
    )
}

export default MessageBox;
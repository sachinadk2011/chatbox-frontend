import React, { useContext } from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';

const MessageBox = () => {
  const {  user } = useContext(UserContext);
  const messages = [
    {id:1, sender:"guest", receiver:"guest1", message:"Hello! How are you?"},
    {id:2, sender:"guest1", receiver:"guest", message:"I'm good, thanks! How about you?"},
    {id:3, sender:"guest", receiver:"guest1", message:"Doing well, just working on a project."},
    {id:4, sender:"guest1", receiver:"guest", message:"That's great to hear! What kind of project?"},
    {id:5, sender:"guest", receiver:"guest1", message:"It's a web development project using React."}]
  
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
import React from 'react'
import ChatList from './ChatList';
import Header from './Header';
import UserContext from '../context/users/UserContext';

const SidebarList = () => {
    const { setUser } = React.useContext(UserContext);
    const DisplayChat = (e) => {
        setUser(e.name)
        console.log(e.name)
    }
    
    return(
        <>
        
        <div className="w-1/4 bg-white border-r border-gray-300">
          
          <Header />
        
         
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20"  >
          {( []).map((element)=>{
            return(
            <div key={element.id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList  name={element.name} message={element.message.slice(0,20)} 
              onClick={()=>DisplayChat(element)} />
            </div>
        )})}
        </div>
        </div>
        </>
    )
}


export default SidebarList;
import React from 'react'
import ChatList from './ChatList';
import Header from './Header';

const SidebarList = () => {
    const chats = [
        {id: 1,
        name: "John Doe",
        message: "Hello, how are you?"},
        {
            id: 2,
            name: "Jane Smith",
            message: "Are you coming to the party?"
        },
        {
            id: 3,
            name: "Alice Johnson",
            message: "Let's catch up sometime!"
        },
        {
            id: 4,
            name: "Bob Brown",
            message: "Did you finish the project?"
        },
        {
            id: 5,
            name: "Charlie Davis",
            message: "Can you send me the report?"
        }

    ]
    return(
        <>
        
        <div className="w-1/4 bg-white border-r border-gray-300">
          
          <Header />
        
         
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20"  >
          {chats.map((element)=>{
            return(
            <div key={element.id} className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <ChatList  name={element.name} message={element.message.slice(0,10)} />
            </div>
        )})}
        </div>
        </div>
        </>
    )
}


export default SidebarList;
import UserContext from "./UserContext";
import React, { useState } from 'react';


export const UserState = (props) => {
  const [user, setUser] = React.useState([
    {
      id:1,
      name: "sachin adk",
      email: "adhikarisachin502@gmail.com",
      password: "sachin",
      friends:["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:2,
      name: "John Doe",
      email: "johndoe@example.com",
      password: "john",
      friends:["sachin adk", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:3,
      name: "Jane Smith",
      email: "janesmith@example.com",
      password: "jane",
      friends:["sachin adk", "John Doe", "Alice Johnson", "Bob Brown", "Charlie Davis"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:4,
      name: "Alice Johnson",
      email: "alicejohnson@example.com",
      password: "alice",
      friends:["sachin adk", "John Doe", "Jane Smith", "Bob Brown", "Charlie Davis"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:5,
      name: "Bob Brown",
      email: "bobbrown@example.com",
      password: "bob",
      friends:["sachin adk", "John Doe", "Jane Smith", "Alice Johnson", "Charlie Davis"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:6,
      name: "Charlie Davis",
      email: "charliedavis@example.com",
      password: "charlie",
      friends:["sachin adk", "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    },
    {
      id:6,
      name: "Charlie Davis",
      email: "charliedavis@example.com",
      password: "charlie",
      friends:["sachin adk", "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown"],
      friendsRequest: [],
      sentRequest: [],
      status: "false"
    }
  ]);

  const {friend, setFriend} = React.useState(user.filter(e=>e.name === "sachin adk")[0].friends);
  console.log(friend);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "john Doe",
      receiver: "sachin adk",
      message:"Hello, how are you?"
    },
    {
      id: 2,
      sender: "sachin adk",
      receiver: "John Doe",
      message:"I'm good, thanks! How about you?"
    },
    {
      id: 3,
      sender: "John Doe",
      receiver: "sachin adk",
      message:"I'm doing well, just busy with work."
    },
    {
      id: 4,
      sender: "sachin adk",
      receiver: "John Doe",
      message:"Same here! Let's catch up soon."
    },
    {
      id: 5,
      sender: "John Doe",
      receiver: "sachin adk",
      message:"Definitely! How about next week?"
    },
    {
      id: 6,
      sender: "sachin adk",
      receiver: "John Doe",
      message:"Sounds good! Looking forward to it. (last)-john"
    },
    {
      id: 7,
      sender: "Jane Smith",
      receiver: "sachin adk",
      message:"Great! I'll text you the details."
    },
    {
      id: 8,
      sender: "sachin adk",
      receiver: "Jane Smith",
      message:"Perfect! See you soon."
    },
    {
      id: 9,
      sender: "Jane Smith",
      receiver: "sachin adk",
      message:"Take care!"
    },
    {
      id: 10,
      sender: "sachin adk",
      receiver: "Jane Smith",
      message:"You too! (jane)"
    },
    {
      id: 11,
      sender: "Alice Johnson",
      receiver: "sachin adk",
      message:"Hey! Long time no see."
    },
    {
      id: 12,
      sender: "sachin adk",
      receiver: "Alice Johnson",
      message:"I know, right? We should meet up."
    },
    {
      id: 13,
      sender: "Alice Johnson",
      receiver: "sachin adk",
      message:"Absolutely! How about this weekend?"
    },
    {
      id: 14,
      sender: "sachin adk",
      receiver: "Alice Johnson",
      message:"Sounds perfect! (last)-alice"
    },
    {
      id: 15,
      sender: "Bob Brown",
      receiver: "sachin adk",
      message:"Did you get my email?"
    },
    {
      id: 16,
      sender: "sachin adk",
      receiver: "Bob Brown",
      message:"Yes, I did. I'll reply soon."
    },
    {
      id: 17,
      sender: "Bob Brown",
      receiver: "sachin adk",
      message:"Thanks! Looking forward to your response."
    },
    {
      id: 18,
      sender: "sachin adk",
      receiver: "Bob Brown",
      message:"No problem! (bob)"
    },
    {
      id: 19,
      sender: "Jane Smith",
      receiver: "sachin adk",
      message:"Great! I'll text you the details."
    },
    {
      id: 20,
      sender: "sachin adk",
      receiver: "Jane Smith",
      message:"Perfect! See you soon."
    },
    {
      id: 21,
      sender: "Jane Smith",
      receiver: "sachin adk",
      message:"Take care!"
    },
    {
      id: 22,
      sender: "sachin adk",
      receiver: "Jane Smith",
      message:"You too! (jane)"
    }

  ])

  const chats = [
    {
      id: 1,
      name: "John Doe",
      message: messages.filter(e => e.sender === "John Doe" || e.receiver === "John Doe").slice(-1)[0].message,
      
    },
    {
      id: 2,
      name: "Jane Smith",
      message: messages.filter(e => e.sender === "Jane Smith" || e.receiver === "Jane Smith").slice(-1)[0].message,
    },
    {
      id: 3,
      name: "Alice Johnson",
      message: messages.filter(e => e.sender === "Alice Johnson" || e.receiver === "Alice Johnson").slice(-1)[0].message,
    },
    {
      id: 4,
      name: "Bob Brown",
      message: messages.filter(e => e.sender === "Bob Brown" || e.receiver === "Bob Brown").slice(-1)[0].message,
    },
    {
      id: 5,
      name: "Charlie Davis",
      message: messages.filter(e => e.sender === "Charlie Davis" || e.receiver === "Charlie Davis").slice(-1)[0]?.message||"",
    }
  ];
  return (
    <UserContext.Provider value={{ user, setUser, chats, messages, setMessages, friend, setFriend }}>
      {props.children}
    </UserContext.Provider>
  );
}
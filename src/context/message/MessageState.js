import MessageContext from "./MessageContext";
import React, { useState } from 'react';
import axios from 'axios';

export const MessageState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    return (
    <MessageContext.Provider value={{  }}>
      {props.children}
    </MessageContext.Provider>
  );
}
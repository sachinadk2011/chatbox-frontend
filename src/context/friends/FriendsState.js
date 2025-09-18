import FriendsContext from "./FriendsContext";
import { useState } from "react";
import axios from "axios";


export const FriendsState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    return (
    <FriendsContext.Provider value={{  }}>
      {props.children}
    </FriendsContext.Provider>
  );
}
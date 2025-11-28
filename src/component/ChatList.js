import React, {useContext} from 'react';
import { useLocation } from 'react-router-dom';
import FriendsContext from '../context/friends/FriendsContext';

/* this is the list of people */
const ChatList = ({name, message,onClick, mutualfrdlen,profileUrl, frdlen}) => {
    const location = useLocation();
    const path = location.pathname;
    const frompath = "/friends/list"
    
    let profile_url = `https://ui-avatars.com/api/?name=${name}&background=random&color=random&bold=true&rounded=true`
  const resizedUrl = profileUrl? profileUrl.replace(
  "/upload/",
  "/upload/w_200,h_200,c_fill,g_face/"
): false;
console.log("Navbar resizedUrl: ",profileUrl );

    return(
        <>
        <div className="flex items-center w-full cursor-pointer" onClick={onClick}>
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3" >
                <img src={`${resizedUrl || profile_url}`} alt="User Avatar" className="w-12 h-12 rounded-full" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{name}</h2>
                <p className={`text-gray-600 ${path!== frompath? "visible": "hidden"}`}>{message}  </p>
                <div className={`flex space-x-4 text-sm text-gray-500 ${path=== frompath? "visible": "hidden"}`}>
                  <span><strong>{mutualfrdlen}</strong> Mutual Friends</span>
                  <span><strong>{frdlen}</strong> Friends</span>
                </div>
              </div>

          </div>
        </>
    )
}

export default ChatList;
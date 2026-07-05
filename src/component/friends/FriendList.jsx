import React, {useEffect, useContext}  from 'react';
import {useParams, useNavigate, useLocation } from 'react-router-dom';
import SelectedUserContext from "../../context/message/SelectedUserContext";
import FriendsContext from '../../context/friends/FriendsContext';
import ChatLayout from '../chat/ChatLayout';
import { EMPTY_USER } from '../../constants/user';
import { useResourceFromUrl } from '../../hooks/routing/useResourceFromUrl';
import { redirectWithError } from '../../utils/helpers/redirectWithError';
import { getBaseChatPath } from '../../utils/helpers/pathUtils';

/**
 * /friends/list route inner component.
 * All layout logic lives in the shared ChatLayout component.
 */
const FriendList = () => {
    const { userId} = useParams();
    const { setSelectedUser } = useContext(SelectedUserContext);
    const { friends, friendsLoaded } = useContext(FriendsContext);
    const navigate = useNavigate();
    const location = useLocation();

    useResourceFromUrl({
        id: userId,
        dataset: friends,
        isLoaded: friendsLoaded,
        findFn: (id, list) => list.find(f => f._id === id),
        onFound: (friend) => {
          if (!friend) { 
            console.info('No friend found for userId in URL. Clearing selected user and closing chat.');
            setSelectedUser(EMPTY_USER); 
            
            return; 
          }
          setSelectedUser({
            receiverId:   friend._id,
            receiverName: friend.name,
            senderId:     null,
            senderName:   '',
            lastActive:   friend.lastActive,
            onlineStatus: friend.onlineStatus,
            profile_url:  friend.profile_Url,
          });
        },
        onNotFound: () => {
          
          redirectWithError({ navigate: navigate, path: getBaseChatPath(location.pathname) })},
      });


return <ChatLayout />;
}

export default FriendList;
import React from 'react';
import Headers from '../component/Header';
import SidebarList from '../component/SidebarList';
import FriendList from '../component/friends/FriendList';

const FrdConnection = () => {
  return (
    <>
    <div className=" bg-gray-100 flex justify-center items-center">
      <FriendList />
    </div>
    </>
  )
}


export default FrdConnection;
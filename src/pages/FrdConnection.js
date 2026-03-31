import React from 'react';
import FriendList from '../component/friends/FriendList';

/**
 * /friends/list route page
 * Delegates all layout to FriendList which handles desktop/mobile split.
 */
const FrdConnection = () => {
  return (
    <div className="h-full w-full flex overflow-hidden bg-gray-50">
      <FriendList />
    </div>
  );
};

export default FrdConnection;
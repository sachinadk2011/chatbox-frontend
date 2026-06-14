import { useContext, useEffect } from "react";
import FriendsContext from "../../context/friends/FriendsContext";
import FriendsCard from "./FriendsCard";


const ReceivedReq = () => {
  const { receivedFrdReq, fetchReceivedRequests } = useContext(FriendsContext);

    useEffect(() => {
    const fetchRequests = async () => {
      try {
        await fetchReceivedRequests();
      } catch (error) {
        console.error("Error fetching received friend requests:", error);
      }
    };

    fetchRequests();
  }, [fetchReceivedRequests]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Fixed heading — never scrolls away */}
      <h2 className="text-lg font-bold text-center mb-4 border-b-2 border-gray-200 pb-2 shrink-0">
        Received Friend Requests
      </h2>

      {/* Scrollable card area fills remaining height */}
      <div className="flex-1 overflow-y-auto bg-slate-200 rounded-lg p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2 pb-12">
          {receivedFrdReq.map((request) => (
            <FriendsCard
              key={request._id}
              id={request._id}
              name={request.name}
              mutualFriends={request.mutualfrdlen}
              friendlen={request.friends.length}
              profileUrl={request.profile_Url}
              email={request.email}
            />
          ))}
        </div>
      </div>
    </div>
  );

};
export default ReceivedReq;

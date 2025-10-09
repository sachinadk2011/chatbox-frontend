import { useContext, useEffect } from "react";
import FriendsContext from "../../context/friends/FriendsContext";
import FriendsCard from "./FriendsCard";


const SentfrdReq = () => {
  const { sentFrdReq, fetchSentRequests } = useContext(FriendsContext);

    useEffect(() => {
    const fetchRequests = async () => {
      try {
        await fetchSentRequests();
      } catch (error) {
        console.error("Error fetching received friend requests:", error);
      }
    };

    fetchRequests();
  }, [fetchSentRequests]);

  return (
    <>
    <div className="flex-1 p-4">
      <h2 className="text-lg font-bold text-center mb-4 border-b-2 border-gray-200 pb-2">
        Sent Friend Requests
      </h2>
    <div className="bg-slate-200 p-2 h-screen overflow-y-auto">
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6  h-auto p-2">
        {sentFrdReq.map((request) => (
          
          <FriendsCard
            key={request._id}
            id={request._id}
            name={request.name}
            
            mutualFriends={request.mutualfrdlen}
            friendlen={request.friends.length}
          />
          
        ))}
      </div>
        </div>
    </div>
    </>
  )

};
export default SentfrdReq;

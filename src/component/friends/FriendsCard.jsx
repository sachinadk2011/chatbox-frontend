import React from 'react'
import FriendsContext from '../../context/friends/FriendsContext';
import { useLocation } from 'react-router-dom';
import UserContext from '../../context/users/UserContext';

const FriendsCard = ({id, name, mutualFriends=0, friendlen=0, profileUrl, email}) => {
  const { sendFriendRequest,cancelFriendRequest, setPeople, receivedFriendRequest, setReceivedFrdReq,  receivedFrdReq, sentFrdReq, people } = React.useContext(FriendsContext);
  const { user } = React.useContext(UserContext);
  let location = useLocation();
  const path = location.pathname;
  const sentPath = "/friends/sent-requests";
  const receivedPath = "/friends/received-requests";
  const addFrdPath = "/friends/add-friend";
  let profile_url = `https://ui-avatars.com/api/?name=${name}&background=random&color=random&bold=true&rounded=true`
  const resizedUrl = profileUrl? profileUrl.replace(
  "/upload/",
  "/upload/w_200,h_200,c_fill,g_face/"
): false;

  
  const Accept = async()=>{
    try{
      const json = await receivedFriendRequest(id, "accept");
      console.log("Accept friend response: ", id, json);
      setReceivedFrdReq(prevRequests => prevRequests.filter(request => request._id !== id));
    }catch(error){
      console.error("Error accepting friend request:", error);
    }
  }

  const CancelReq = async()=>{
    try{
      const json = await cancelFriendRequest(id);
      console.log("Cancel friend response: ", id, json);
      
    }catch(error){
      console.error("Error cancelling friend request:", error);
    }
  }

  const Reject = async()=>{
    try{
      const json = await receivedFriendRequest(id, "reject");
      console.log("Reject friend response: ", id, json);
      setReceivedFrdReq(prevRequests => prevRequests.filter(request => request._id !== id));

    }catch(error){
      console.error("Error rejecting friend request:", error);
    }
  }

  const AddingFrd = async()=>{
    try {
      const json = await sendFriendRequest(id);
      console.log("Add friend response: ", json);
     
        setPeople(prevPeople => prevPeople.filter(person => person._id !== id));
      

      
    } catch (error) {
      console.error("Error adding friend:", error);
      
    }

  }

    return (
        <>
        {/* <div className="w-1/5 ">
<div className="flex  flex-col items-center justify-center ">
      <div className="w-full max-w-lg py-8 flex flex-row items-center justify-center mx-auto bg-[#FFFBFB] rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row w-3/4 md:w-5/6 space-x-0 md:space-x-8">
          <div className="w-full md:w-1/5 flex flex-col items-center justify-center">
            <figure className="w-1/2 md:w-full rounded-full overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${name}&background=random&color=random&bold=true&rounded=true`} alt="" className="w-10 md:w-16 h-10 md:h-16 rounded-full" />
            </figure>
          </div>
          <div className="w-full md:w-3/5 space-y-4 flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-center md:text-left text-2xl font-bold text-gray-900">
                {name}
              </h1>
              
            </div>

            

            <ul className="space-x-4 flex flex-row justify-center w-full mb-4">
              <li className="text-sm text-gray-800">
                <strong className="text-gray-900">{mutualFriends}</strong> Mutual Friends
              </li>
              <li className="text-sm text-gray-800">
                <strong className="text-gray-900">100</strong> Friends
              </li>
            </ul>

            <button className="transition-colors bg-purple-700 hover:bg-purple-800 p-2 rounded-sm w-full text-white shadow-md shadow-purple-900">
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>
    </div> */}

    
<div className="bg-white pt-10 shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition">
      <img
        src={`${resizedUrl || profile_url}`}
        alt={name}
        className="w-24 h-24 mx-auto rounded-full -mt-12 border-4 border-white shadow-md"
      />
      
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{name}</h3>
      
      <div className="flex justify-around items-center my-4 text-sm text-gray-700">
        <span>
          <strong>{mutualFriends}</strong> Mutual Friends
        </span>
        <span>
          <strong>{friendlen}</strong> Friends
        </span>
        {/* <span>
          <strong>{email}</strong>
        </span> */}
      </div>

      <button onClick={() => path === addFrdPath? AddingFrd(): CancelReq()} className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full  font-medium transition  ${path === addFrdPath || path === sentPath ? 'visible' : 'hidden'}`}>
        {path === addFrdPath ? 'Add Friend' : 'Cancel Request'}
      </button>
      
      <div className={`flex flex-row gap-2 ${ path === receivedPath  ? 'visible' : 'hidden'}`}>
      <button onClick={() => Accept()} className={`w-1/2 bg-blue-500 inline  hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition `}>
        Accept
      </button>
      <button onClick={() => Reject()} className={`w-1/2  bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition `}>
        Reject
      </button>

      </div>

    </div>

    </>
    )
}   
export default FriendsCard

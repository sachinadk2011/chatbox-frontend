import React, { useEffect } from 'react';
import FriendsCard from './FriendsCard';
import FriendsContext from '../../context/friends/FriendsContext';

const SuggestionsFriend = () => {
  const { people, suggestionFrds } = React.useContext(FriendsContext);
  console.log("sugesstion people: ",people);

  useEffect(() => {
    const fetchSuggestions = async () => {
     try {
      await suggestionFrds();
     } catch (error) {
       console.error("Error fetching suggestions:", error);
     }
    }
    fetchSuggestions();
  }, [suggestionFrds]);

  
  return (
    <>
    <div className="flex-1 p-4">
      <h2 className="text-lg font-bold text-center mb-4 border-b-2 border-gray-200 pb-2">
        Suggestions for you
      </h2>

      <div className="bg-slate-200 p-2 h-screen overflow-y-auto">
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6  h-auto p-2">
        {people.map((person) => (
          
          <FriendsCard
            key={person._id}
            id={person._id}
            name={person.name}
            mutualFriends={person.mutualfrdlen}
            friendlen={person.friends.length}
          />
          
        ))}
      </div>
      </div>
    </div>
    </>
  )
}
export default SuggestionsFriend;
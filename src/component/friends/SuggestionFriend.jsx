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
    <div className="flex flex-col h-full p-4">
      {/* Fixed heading — never scrolls away */}
      <h2 className="text-lg font-bold text-center mb-4 border-b-2 border-gray-200 pb-2 shrink-0">
        Suggestions for you
      </h2>

      {/* Scrollable card area fills remaining height */}
      <div className="flex-1 overflow-y-auto bg-slate-200 rounded-lg p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2 pb-12">
          {people.map((person) => (
            <FriendsCard
              key={person._id}
              id={person._id}
              name={person.name}
              mutualFriends={person.mutualfrdlen}
              friendlen={person.friends.length}
              profileUrl={person.profile_Url}
              email={person.email}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default SuggestionsFriend;
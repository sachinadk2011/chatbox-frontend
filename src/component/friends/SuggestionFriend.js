import React from 'react';
import Headers from '../Header';
import FriendsCard from './FriendsCard';

const SuggestionsFriend = () => {
  const [people, setPeople] = React.useState([
  { _id: '1', name: 'Alice Johnson', mutualFriends: 5 },
  { _id: '2', name: 'Bob Smith', mutualFriends: 3 },
  { _id: '3', name: 'Charlie Brown', mutualFriends: 8 },
  { _id: '4', name: 'David Wilson', mutualFriends: 2 },
  { _id: '5', name: 'Emma Davis', mutualFriends: 6 },
  { _id: '6', name: 'Frank Miller', mutualFriends: 1 },
  { _id: '7', name: 'Grace Lee', mutualFriends: 4 },
  { _id: '8', name: 'Hannah Taylor', mutualFriends: 7 },
  { _id: '9', name: 'Ian Thompson', mutualFriends: 3 },
  { _id: '10', name: 'Jack White', mutualFriends: 2 },
  { _id: '11', name: 'Karen Harris', mutualFriends: 5 },
  { _id: '12', name: 'Leo Martin', mutualFriends: 6 },
  { _id: '13', name: 'Mia Clark', mutualFriends: 4 },
  { _id: '14', name: 'Nathan Lewis', mutualFriends: 7 },
  { _id: '15', name: 'Olivia Walker', mutualFriends: 3 },
  { _id: '16', name: 'Peter Hall', mutualFriends: 2 },
  { _id: '17', name: 'Quinn Allen', mutualFriends: 5 },
  { _id: '18', name: 'Rachel Young', mutualFriends: 1 },
  { _id: '19', name: 'Samuel King', mutualFriends: 8 },
  { _id: '20', name: 'Tina Scott', mutualFriends: 4 },
]);

  return (
    <>
    <div className="flex-1 p-4">
      <h2 className="text-lg font-bold text-center mb-4 border-b-2 border-gray-200 pb-2">
        Suggestions for you
      </h2>

      <div className="grid grid-cols-1 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto h-[85vh] p-2">
        {people.map((person) => (
          
          <FriendsCard
            key={person._id}
            name={person.name}
            mutualFriends={person.mutualFriends}
          />
          
        ))}
      </div>
    </div>
    </>
  )
}
export default SuggestionsFriend;
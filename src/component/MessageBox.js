import React from 'react';

const MessageBox = (props) => {
    return(
        <>
        <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                <img src={`https://ui-avatars.com/api/?name=${props.name}&background=random&color=random&bold=true&rounded=true`} alt="User Avatar" className="w-12 h-12 rounded-full" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{props.name}</h2>
                <p className="text-gray-600">{props.message}  </p>
              </div>
        </div>
        </>
    )
}

export default MessageBox;
import React, { useContext } from 'react'
import MessageContext from '../context/message/MessageContext';

export const ReceivedMsg = ({ types,  received }) => {
  const { Selecteduser } = useContext(MessageContext);
  let filesArray = [];

if (types === "multiple") {
  try {
    filesArray = JSON.parse(received); // [{url, type, public_id}, ...]
  } catch (err) {
    console.error("Invalid files data", err);
  }
}
  return (
    <>
      <div className="chat-message">
         <div className="flex items-end">
            <div className="flex flex-col gap-y-2 text-xs max-w-xs mx-2 order-2 items-start">
               <div><span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                {types === "text" ? received :
                 types === "image" ? 
                 <img src={`${received}`} alt="sent image" className="max-w-full h-auto rounded-lg" /> :
                 types === "video" ?
                  <video controls className="max-w-full h-auto rounded-lg">
                    <source src={`${received}`} type="video/mp4" />
                    
                  </video> :
                  types === "file" ?
                  <a href={`${received}`} download className="text-blue-500 underline">
                    {received}
                  </a> :
                  types === "multiple" ?
                  filesArray.map((file, idx) => (
    <div key={idx} className="mb-2">
      {file.type === "image" && (
        <img
          src={file.url}
          alt="sent-img"
          className="w-36 h-auto rounded-md cursor-pointer"
          /* onClick={() => openImage(file.url)} */
        />
      )}
      {file.type === "video" && (
        <video
          src={file.url}
          controls
          className="w-40 h-auto rounded-md"
        ></video>
      )}
      {file.type === "audio" && (
        <audio controls>
          <source src={file.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {file.type === "file" && (
        <a href={file.url} download className="text-blue-600 underline">
          Download File
        </a>
      )}
    </div>
  )):
                  <audio controls className="max-w-full h-auto rounded-lg">
                    <source src={`${received}`} type="audio/mpeg" />
                    
                  </audio>
                }
                </span></div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${Selecteduser.receiverName}&background=random&color=random&bold=true&rounded=true`} alt="My profile" className="w-6 h-6 rounded-full order-1" />
         </div>
      </div>
    </>
  )
}
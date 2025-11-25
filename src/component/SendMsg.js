import React, { useContext } from 'react'
import UserContext from '../context/users/UserContext';

export const SendMsg = ({ types, send }) => {
  const {  user } = useContext(UserContext);
  let filesArray = [];

if (types === "multiple") {
  try {
    filesArray = JSON.parse(send); // [{url, type, public_id}, ...]
  } catch (err) {
    console.error("Invalid files data", err);
  }
}
  return (
    <>
      <div className="chat-message">
         <div className="flex items-end justify-end">
            <div className="flex flex-col gap-y-2 text-xs max-w-xs mx-2 order-1 items-end">
               <div><span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">
                {types === "text" ? send :
                 types === "image" ? 
                 <img src={`${send}`} alt="sent image" className="max-w-full h-auto rounded-lg" /> :
                 types === "video" ?
                  <video controls className="max-w-full h-auto rounded-lg">
                    <source src={`${send}`} type="video/mp4" />
                    
                  </video> :
                  types === "file" ?
                  <a href={`${send}`} download className="text-blue-500 underline">
                    {send}
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
                    <source src={`${send}`} type="audio/mpeg" />
                    
                  </audio>
                  
                } </span></div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=random&bold=true&rounded=true`} alt="My profile" className="w-6 h-6 rounded-full order-2" />
         </div>
      </div>
    </>
  )
}
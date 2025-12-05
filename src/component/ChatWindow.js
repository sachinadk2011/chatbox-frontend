import React, {useState} from 'react';
import '../App.css';
import ProfileHeader from './ProfileHeader';
import MessageBox from './MessageBox';
import MessageContext from '../context/message/MessageContext';
import Picker from 'emoji-picker-react';
import { Activity } from 'react';


const ChatWindow = () => {
   const {sendMessage,Selecteduser, setMessages, messages} = React.useContext(MessageContext);
   const fileRef = React.useRef(null);

   
   console.log("chatwindow "+Selecteduser.receiverId);
   const [isShowingSidebar, setIsShowingSidebar] = useState(false);

   const [images, setImages] = useState([]);
   



   const [chosenEmoji, setChosenEmoji] = useState(null);

    const onEmojiClick = ( emojiObject) => {
      
      setChosenEmoji(emojiObject);
      console.log(emojiObject)
      document.getElementsByName("message")[0].value += emojiObject.emoji;
    };
   // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const allowed = ["image/", "video/"];

  for (const file of files) {
    if (!allowed.some(type => file.type.startsWith(type))) {
      console.log("alert(\"❌ Only image and video files are allowed!\")");
      return;
    }
  }


    const mapped = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      preview: file.type.startsWith("image/"),
      file: file,
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    const pastedFiles = [];

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];

      // Only take images from the clipboard
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    
    const allowed = ["image/", "video/"];

  for (const file of pastedFiles) {
    if (!allowed.some(type => file.type.startsWith(type))) {
      console.log("alert(\"❌ Only image and video files are allowed!\")");
      return;
    }
  }

    if (pastedFiles.length > 0) {
      const mapped = pastedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        preview: file.type.startsWith("image/"),
        file: file,
      }));

      setImages((prev) => [...prev, ...mapped]);
    }
  };

  
  // Listen globally for paste
  window.addEventListener("paste", handlePaste);
  
        

  return () => {
    window.removeEventListener("paste", handlePaste);
   
  };
}, []);

console.log("files to be sent:", images, images);
   const SendMessage =async(e)=>{
      e.preventDefault();
      const formData = new FormData();
      if (images.length === 0 && e.target.elements.message.value.trim() === "") {
        return; // Don't send empty messages
      }
      
      const message = e.target.elements.message.value;
      if (message) formData.append('message', message);
      images.forEach((f) => {formData.append("files", f.file);
        console.log("appended file:", f.file);
      })
      
      const receiver = Selecteduser.receiverId;
      formData.append("receiver", receiver);
      console.log("formdata entries:", ...formData.entries());
      try{
  console.log("formdata entries:", ...formData.entries());
  
      await sendMessage(formData);
     
     setImages([]);
     e.target.reset();
}catch(error){
  console.error("Error sending message:", error);
}
     
   
  
  
}
    

    return(
        <>
       
<div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
   <div className="flex sm:items-center  justify-between py-3 border-b-2 border-gray-200">
      <ProfileHeader />
   </div>

   <div id="messages" className="flex relative flex-col-reverse gap-y-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch ">
      <MessageBox />
      
   <Activity mode={isShowingSidebar ? 'visible' : 'hidden'}  >
   <span className="absolute right-1/3 bottom-auto cursor-pointer">
      <Picker onEmojiClick={onEmojiClick}/>
   </span>
   </Activity>         
   
   

   <input 
   type="file"
   multiple
   accept="image/*,video/*"
   ref={fileRef}
   onChange={handleFileChange}
   className="absolute w-0 h-0 opacity-0 overflow-hidden"
   
   />
   
           
      
     
   </div>
   
      
   <div className="border-t-2 relative -bottom-10  border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <form onSubmit={SendMessage} >
      <div className="relative flex">
         <span className="absolute inset-y-0 flex items-center">
            <button type="button" className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
               </svg>
            </button>
         </span>
          
            
 {/* Preview list */}
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-32 h-32 rounded overflow-hidden border"
          >
            {/* If previewable image */}
            {image.preview ? (
              <img
                src={image.url}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              // File icon for non-image files
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg
                  className="w-16 h-16 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 2v5h5v15h-16v-20h11zm1-2h-14v24h20v-18l-6-6z" />
                </svg>
              </div>
            )}

            {/* Delete button */}
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 w-6 h-6 text-white bg-red-500 rounded-full flex items-center justify-center"
            >
              ×
            </button>

            {/* Size text */}
            <div className="absolute bottom-0 bg-black bg-opacity-50 text-white text-xs w-full text-center py-1">
              {image.size}
            </div>
          </div>
        ))}
            </div>
           

           
         <input type="text" name='message' placeholder="Write your message!" className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3" />
         <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button type="button" className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
               </svg>
            </button>
            <button type="button" onClick={()=>fileRef.current.click()} className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
               </svg>
            </button>
            
            <button type="button" onClick={() => setIsShowingSidebar(!isShowingSidebar)} className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
               
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
            </button>
            <button type="submit" 
            
            className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none" >
               <span className="font-bold">Send</span>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 ml-2 transform rotate-90">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
               </svg>
            </button>
         </div>
      </div>
      </form>
   </div>
</div>




        </>
    )

}

export default ChatWindow;
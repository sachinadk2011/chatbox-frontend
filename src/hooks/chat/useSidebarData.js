import { useEffect } from 'react';

export const useAuthSession = ({ navigate,  fetchFriends, fetchMessages, user }) => {
    
    useEffect( () => {
          if (!user?.id) return; // wait until user is loaded
          
          const fetchdata = async (retryCount = 0) => { // retryCount properly defined as parameter
          try{
         const frd= await fetchFriends();
        const msg= await fetchMessages();
        setFriends(frd);
        setMessages(msg.reduce((acc, mg)=>{
                  const otherUserId = mg.sender._id.toString() === user?.id.toString() ? mg.receiver._id.toString() : mg.sender._id.toString();
                  
                  if(frd.some(frd => frd._id.toString() === otherUserId)){
                    let existing = acc.find(item => item.otherUserId === otherUserId);
                    if (existing) {
                      existing.messages.push(mg);
                    } else {
                      acc.push({ otherUserId:otherUserId, messages: [mg] });
                    }
                    
                  }
                  return acc;
                }, []));
       
      }catch(error){
       
        /* console.error("Error in sidebarlist:", error); */
    
        const isAuth = error.response?.status === 401
          || error.status === 401       // set by interceptor on refresh failure
          || error.isAuthFailure;       // set by interceptor on 4xx refresh rejection
    
        if (isAuth) {
          navigate("/login"); // real auth failure — redirect to login
        } else if (!error.response && !error.isAuthFailure && retryCount < 2) {
          // Network error only (no response from server) — might be waking up
          console.log(`Server may be waking up, retrying in 3s (attempt ${retryCount + 1})`);
          setTimeout(() => fetchdata(retryCount + 1), 3000);
        }
        // 4xx (other than 401) or 5xx → StatusGate handles the error page
      }
        }
        fetchdata();
    
      }, [user?.id, fetchFriends, fetchMessages, navigate]);
}
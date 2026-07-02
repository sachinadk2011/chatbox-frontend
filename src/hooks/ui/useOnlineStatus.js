import { useEffect, useContext } from "react";
import UserContext from "../../context/users/UserContext";

const useOnlineStatus = ()=>{
    const { fetchUser, setIsOnline, setUser } = useContext(UserContext);

    useEffect(() => {
        
        fetchUser();
        const goOffline = () => { 
            setIsOnline(false); 
            setUser(p => ({ ...p, onlineStatus: false }));
        };
        const goOnline  = () => { 
            setIsOnline(true);  
            fetchUser();
        };
        window.addEventListener('offline', goOffline);
        window.addEventListener('online',  goOnline);
        return () => {
          window.removeEventListener('offline', goOffline);
          window.removeEventListener('online',  goOnline);
        };
      }, [fetchUser]);
}

export default useOnlineStatus;
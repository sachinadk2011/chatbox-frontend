// hooks/routing/useUrlErrorMessage.js
/**
 * useUrlErrorMessage.js
 *
 * PURPOSE:
 *   Reads the ?error=<code> query param (set by redirectWithError), maps it
 *   to a human-readable message, and strips it from the URL after reading —
 *   so refreshing the page or navigating away doesn't keep showing it.
 *
 * OUTPUTS:
 *   { message, dismiss }
 *     message — string | null  (null when there's no error param)
 *     dismiss — () => void     (manually clear before the auto-cleanup)
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUrlErrorMessage } from "../../constants/errorMessages";

export const useUrlErrorMessage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        console.info(
            "useUrlErrorMessage: location.search=",
            location.search,
            "prefix path=",
            location.pathname,
        );
        const code = params.get("error");
        if (!code) return;

        setMsg(getUrlErrorMessage(code));

        // Strip ?error= from the URL immediately so it doesn't persist on refresh/back
        params.delete("error");
        const cleanSearch = params.toString();
        console.info(
            `use url error render: prefix pathname = ${location.pathname}, cleansearch = ${cleanSearch}`,
        );
        navigate(
            {
                pathname: location.pathname,
                search: cleanSearch ? `?${cleanSearch}` : "",
            },
            { replace: true },
        );
        
    }, [location.search]);

    const dismiss = useCallback(() => {
    setMsg(null);
}, []);

    useEffect(() => {
        if (!msg) return;

        const timer = setTimeout(dismiss, 5000);

        return () => clearTimeout(timer);
    }, [msg]);

    return { message: msg, dismiss };
};

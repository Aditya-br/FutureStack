import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from '../services/api';

/**
 * Hook to set up the auth token getter for API calls
 * Must be used within a ClerkProvider context
 */
export const useAuthToken = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoaded) {
            // Set the token getter function for the API service
            setAuthTokenGetter(async () => {
                if (!isSignedIn) return null;
                return await getToken();
            });
        }
    }, [isLoaded, isSignedIn, getToken]);

    return { isLoaded, isSignedIn };
};

export default useAuthToken;

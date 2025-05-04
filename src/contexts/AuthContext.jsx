import React, { createContext, useContext, useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, session } = useClerk();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('admin'); // Default to admin for now
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get token from Clerk session
          const sessionToken = await session?.getToken();
          setToken(sessionToken);
          
          // For testing purposes, we'll use admin role directly 
          // In a production environment, you would fetch this from your backend
          setCurrentUser(user);
          setUserRole('admin'); // Set role to admin for dashboard access
          
          // Uncomment below to actually fetch from backend when ready
          /*
          // Get user metadata from your backend
          const response = await axios.get(`/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });
          
          setCurrentUser(response.data);
          setUserRole(response.data.role || 'customer');
          */
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else if (isLoaded) {
        setCurrentUser(null);
        setUserRole('customer');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user, session]);

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setUserRole('customer');
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasRole = (requiredRole) => {
    // For now, we'll just assume the user has the proper role for testing
    return true;
    
    // Uncomment for production use
    /*
    if (!currentUser) return false;
    if (requiredRole === 'admin') return userRole === 'admin';
    if (requiredRole === 'staff') return userRole === 'admin' || userRole === 'staff';
    return true; // For 'customer' role or any authenticated user
    */
  };

  const value = {
    user: currentUser,
    role: userRole,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    hasRole,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
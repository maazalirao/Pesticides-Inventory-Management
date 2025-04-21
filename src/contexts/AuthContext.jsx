import React, { createContext, useContext, useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('customer'); // Default role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get user metadata from your backend
          const response = await axios.get(`/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${await user.getToken()}`,
            },
          });
          
          setCurrentUser(response.data);
          setUserRole(response.data.role || 'customer');
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
  }, [isLoaded, isSignedIn, user]);

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setUserRole('customer');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    if (requiredRole === 'admin') return userRole === 'admin';
    if (requiredRole === 'staff') return userRole === 'admin' || userRole === 'staff';
    return true; // For 'customer' role or any authenticated user
  };

  const value = {
    user: currentUser,
    role: userRole,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
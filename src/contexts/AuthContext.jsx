import React, { createContext, useContext, useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { createUser } from "../lib/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, session } = useClerk();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("customer");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get token from Clerk session
          const sessionToken = await session?.getToken();
          if (!sessionToken) {
            throw new Error("No session token available");
          }
          setToken(sessionToken);

          // Create user in our database
          try {
            const createdUser = await createUser(user);
            console.log("User created successfully:", createdUser);
            setCurrentUser(createdUser);
            setUserRole(createdUser.role || "customer");
          } catch (error) {
            console.error("Error creating user:", error);
            // If user already exists, just set the current user
            if (
              error.response?.status === 400 &&
              error.response?.data?.message === "User already exists"
            ) {
              console.log("User already exists, setting current user");
              setCurrentUser(user);
              setUserRole("customer");
            } else {
              // For other errors, still set the user but with limited access
              console.log("Setting user with limited access due to error");
              setCurrentUser(user);
              setUserRole("customer");
            }
          }
        } catch (error) {
          console.error("Error in authentication flow:", error);
          setCurrentUser(null);
          setUserRole("customer");
        } finally {
          setLoading(false);
        }
      } else if (isLoaded) {
        setCurrentUser(null);
        setUserRole("customer");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user, session]);

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setUserRole("customer");
      setToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    if (requiredRole === "admin") return userRole === "admin";
    if (requiredRole === "staff")
      return userRole === "admin" || userRole === "staff";
    return true; // For 'customer' role or any authenticated user
  };

  const value = {
    user: currentUser,
    role: userRole,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    hasRole,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

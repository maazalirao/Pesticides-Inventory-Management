import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

/**
 * Component that handles navigation tracking and post-authentication redirects
 */
const NavigationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  
  useEffect(() => {
    // Save current path in localStorage for potential future use
    localStorage.setItem('currentPath', location.pathname);
  }, [location.pathname]);

  // Handle post-authentication redirect for store users
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Check if user just signed in and we're on landing page but should be in store
      const preferredRedirect = localStorage.getItem('clerk_preferred_redirect');
      
      if (preferredRedirect && preferredRedirect.startsWith('/store')) {
        // User signed in from store interface, redirect them back
        if (location.pathname === '/' || !location.pathname.startsWith('/store')) {
          console.log('Redirecting user from landing to store after sign-in:', preferredRedirect);
          localStorage.removeItem('clerk_preferred_redirect');
          navigate(preferredRedirect, { replace: true });
        }
      } else if (location.pathname === '/' && document.referrer.includes('/store')) {
        // User came from store but ended up on landing page after sign-in
        console.log('Redirecting user back to store after sign-in from referrer');
        navigate('/store', { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, location.pathname, navigate]);
  
  return null; // This component doesn't render anything
};

export default NavigationHandler; 
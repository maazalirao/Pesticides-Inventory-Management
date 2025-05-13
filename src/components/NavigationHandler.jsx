import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that handles navigation tracking
 */
const NavigationHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Save current path in localStorage for potential future use
    localStorage.setItem('currentPath', location.pathname);
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

export default NavigationHandler; 
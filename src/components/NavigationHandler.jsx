import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that forces a page reload when navigating between /admin and /store
 * This is necessary because we need to switch Clerk providers
 */
const NavigationHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Keep track of whether we're in store or admin section
    const isInStore = location.pathname.startsWith('/store');
    const isInAdmin = location.pathname.startsWith('/admin');
    
    // Get the previous path from localStorage
    const prevPath = localStorage.getItem('currentPath') || '';
    const wasInStore = prevPath.startsWith('/store');
    const wasInAdmin = prevPath.startsWith('/admin');
    
    // Save current path
    localStorage.setItem('currentPath', location.pathname);
    
    // If we're moving between store and admin sections, reload the page
    if ((isInStore && wasInAdmin) || (isInAdmin && wasInStore)) {
      console.log('Switching between store/admin sections - reloading page');
      window.location.href = location.pathname;
    }
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

export default NavigationHandler; 
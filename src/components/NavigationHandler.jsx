import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { prefetchDashboardData, prefetchAdminDashboardData, getStoreId } from '../lib/api';

/**
 * Component that handles navigation tracking
 */
const NavigationHandler = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    // Only reload the page to refresh store context in these cases
    if (
      // Entering admin area from store or vice versa
      (currentPath.startsWith('/admin') && localStorage.getItem('lastPath')?.startsWith('/store')) ||
      (currentPath.startsWith('/store') && localStorage.getItem('lastPath')?.startsWith('/admin'))
    ) {
      console.log('Crossing boundaries between admin/store, forcing page reload');
      window.location.reload();
    }
    
    // Save the current path for next comparison
    localStorage.setItem('lastPath', currentPath);
    
    // Prefetch data based on path to make next pages load instantly
    if (currentPath === '/admin' || currentPath.includes('/admin/dashboard')) {
      setTimeout(() => {
        console.log('Prefetching admin dashboard data...');
        prefetchAdminDashboardData();
      }, 1000);
    } else if (currentPath.includes('/storeowner') && getStoreId()) {
      setTimeout(() => {
        console.log('Prefetching store owner dashboard data...');
        prefetchDashboardData();
      }, 1000);
    }
  }, [currentPath]);
  
  return null; // This component doesn't render anything
};

export default NavigationHandler; 
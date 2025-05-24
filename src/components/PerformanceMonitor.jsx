import React, { useEffect, useState } from 'react';

export const PerformanceMonitor = ({ label, onLoadTime }) => {
  const [loadStartTime] = useState(Date.now());
  
  useEffect(() => {
    const loadTime = Date.now() - loadStartTime;
    if (onLoadTime) {
      onLoadTime(loadTime);
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${label} loaded in ${loadTime}ms`);
    }
  }, []);
  
  return null;
};

export default PerformanceMonitor; 
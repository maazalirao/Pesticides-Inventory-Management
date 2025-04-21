import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Always use light theme
  const [theme, setTheme] = useState('light');

  // Disabled toggle function - always keeps light theme
  const toggleTheme = () => {
    // Do nothing - dark theme disabled
    return;
  };

  useEffect(() => {
    // Update the HTML element to always use light theme
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('dark');
    
    // Clear any stored theme preference
    localStorage.removeItem('pesttrack-theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
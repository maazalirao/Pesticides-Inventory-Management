import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has theme preference in localStorage or default to light theme
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('pesttrack-theme');
    if (storedTheme) {
      return storedTheme;
    }
    
    // Always default to light theme regardless of system preference
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('pesttrack-theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    // Update the HTML element with the current theme
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

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
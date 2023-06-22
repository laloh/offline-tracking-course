import React from 'react';

// Initialize a Context with default value
export const MyContext = React.createContext({
  courses: [],
  setCourses: () => [],
});
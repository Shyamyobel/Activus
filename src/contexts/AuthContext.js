//src>>context>>AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  // Function to store token
  const login = (newToken, userRole) => {
    setToken(newToken);
    setRole(userRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userRole);
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

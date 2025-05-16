import React, {useState, createContext} from 'react';
import Navigation from './navigation';
import {clearAuth} from './utils/tokenStorage';

// Create an auth context
export const AuthContext = createContext();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Function to handle logout
  const logout = async () => {
    try {
      await clearAuth();
      setIsLoggedIn(false);
      // This will cause a re-render and should show the login screen
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Provide the auth context value
  const authContextValue = {
    isLoggedIn,
    setIsLoggedIn,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Navigation key={isLoggedIn ? 'loggedIn' : 'loggedOut'} />
    </AuthContext.Provider>
  );
};

export default App;

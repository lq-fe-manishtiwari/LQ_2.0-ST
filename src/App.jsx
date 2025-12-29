import { useEffect } from 'react';
import './App.css';
import "./index.css";
import Routes from './Routes/Routes';
import SettingsMenu from "./Teacher/screens/Layout/SettingsMenu";
import { UserProfileProvider } from './contexts/UserProfileContext';
import { initializeAuth } from './_services/api';
import { BatchProvider } from './contexts/BatchContext'; 

function App() {
  useEffect(() => {
    // Initialize authentication system on app start
    initializeAuth();
  }, []);

  return (
    <UserProfileProvider>
      <BatchProvider> 
        <Routes />
        <SettingsMenu />
      </BatchProvider>
    </UserProfileProvider>
  );
}

export default App;

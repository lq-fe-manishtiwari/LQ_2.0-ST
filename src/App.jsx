import { useState, useEffect } from 'react'
import './App.css'
import "./index.css"
import Routes from './Routes/Routes'
import SettingsMenu from "./Teacher/screens/Layout/SettingsMenu";
import { UserProfileProvider } from './contexts/UserProfileContext';
import { initializeAuth } from './_services/api';

function App() {
  useEffect(() => {
    // Initialize authentication system on app start
    initializeAuth();
  }, []);

  return (
    <UserProfileProvider>
      <Routes />
      <SettingsMenu />
    </UserProfileProvider>
  )
}

export default App

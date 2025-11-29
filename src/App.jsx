import { useState } from 'react'
import './App.css'
import "./index.css"
import Routes from './Routes/Routes'
import SettingsMenu from "./Teacher/screens/Layout/SettingsMenu";
import { UserProfileProvider } from './contexts/UserProfileContext';

function App() {

  return (
    <UserProfileProvider>
      <Routes />
      <SettingsMenu />
    </UserProfileProvider>
  )
}

export default App

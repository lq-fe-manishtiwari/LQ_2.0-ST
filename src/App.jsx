import { useState } from 'react'
import './App.css'
import "./index.css"
import Routes from './Routes/Routes'
import SettingsMenu from "./Teacher/screens/Layout/SettingsMenu";

function App() {

  return (
    <>
      <Routes />
          <SettingsMenu />

    </>
  )
}

export default App

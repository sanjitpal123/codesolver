import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chat from './Component/Chat'
import './index.css'
import HomePage from './Component/HomePage'
import Provide from './Store/ContextStore'
function App() {


  return (
   <Provide>
   <HomePage/>
   </Provide>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import './App.css'
// import TestServiceFunctionsComponent from './components/testServiceFunctionsComponent'
import TrackerInputPage from './pages/TrackerInputPage'
import ReadingLogPage from './pages/ReadingLogPage'
import ViewReadingPage from './pages/ViewReadingPage'
import LoginPage from './pages/LoginPage'
import NavBar from './components/NavBar'
import { useState, useEffect } from 'react'
import { UserTypes } from './types'

function App() {
const [currentUser, setCurrentUser] = useState<UserTypes | null>(null)

useEffect(()=> {
  const fetchUser = async (): Promise<void> => {
    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'GET', 
      credentials: 'include'
    })
    
    if(!response.ok) return //return early if response isnt ok 
    const userData = await response.json()
    setCurrentUser(userData)
  }

  fetchUser()
  
}, [])

  return (  
    <>
      <NavBar 
        currentUser={currentUser}
      />
      <Routes>
        <Route path="/" element={<TrackerInputPage />} />
        <Route path="/analytics" element={<ReadingLogPage />} />
        <Route path="/reading/:readingId" element={<ViewReadingPage />} />
        <Route path="/login" element={<LoginPage />} /> 
      </Routes>
    </>
  )
}

export default App

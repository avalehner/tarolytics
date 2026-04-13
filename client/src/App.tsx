import { Routes, Route } from 'react-router-dom'
import './App.css'
// import TestServiceFunctionsComponent from './components/testServiceFunctionsComponent'
import TrackerInputPage from './pages/TrackerInputPage'
import ReadingLogPage from './pages/ReadingLogPage'
import NavBar from './components/NavBar'

function App() {
  return (  
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<TrackerInputPage />} />
        <Route path="/analytics" element={<ReadingLogPage />} />
      </Routes>
    </>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './components/Members'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading, true/false = checked

  useEffect(() => {
    // Check if user has a valid token
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/members"
          element={isAuthenticated ? <Dashboard activeTab="members" /> : <Navigate to="/login" />}
        />
        <Route
          path="/visitors"
          element={isAuthenticated ? <Dashboard activeTab="visitors" /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App

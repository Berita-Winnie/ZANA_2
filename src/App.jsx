import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import Distributions from './pages/Distributions'
import Reports from './pages/Reports'
import { Route, Routes } from 'react-router'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/distributions" element={<Distributions />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  )
}

export default App

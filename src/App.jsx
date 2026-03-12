import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Distributions from './pages/Distributions'
import Schools from './pages/Schools'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Donors from './pages/Donors.jsx'
import Users from './pages/Users.jsx'
import ReviewQueue from './pages/ReviewQueue.jsx'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

function RequireRole({ allowed, children }) {
  const { user, role, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (allowed && !allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/projects"
        element={
          <RequireRole allowed={['superAdmin', 'fieldOfficer', 'donor']}>
            <Projects />
          </RequireRole>
        }
      />

      <Route
        path="/distributions"
        element={
          <RequireRole allowed={['superAdmin', 'fieldOfficer']}>
            <Distributions />
          </RequireRole>
        }
      />

      <Route
        path="/schools"
        element={
          <RequireRole allowed={['superAdmin', 'fieldOfficer', 'donor']}>
            <Schools />
          </RequireRole>
        }
      />

      <Route
        path="/analytics"
        element={
          <RequireRole allowed={['superAdmin', 'fieldOfficer', 'donor']}>
            <Analytics />
          </RequireRole>
        }
      />

      <Route
        path="/settings"
        element={
          <RequireRole allowed={['superAdmin']}>
            <Settings />
          </RequireRole>
        }
      />

      <Route
        path="/donors"
        element={
          <RequireRole allowed={['superAdmin']}>
            <Donors />
          </RequireRole>
        }
      />

      <Route
        path="/reviews"
        element={
          <RequireRole allowed={['superAdmin']}>
            <ReviewQueue />
          </RequireRole>
        }
      />

      <Route
        path="/users"
        element={
          <RequireRole allowed={['superAdmin']}>
            <Users />
          </RequireRole>
        }
      />
    </Routes>
  )
}

export default App

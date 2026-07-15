import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Signup from './pages/Signup'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Billing from './pages/Billing'
import Terms from './pages/Terms'
import Login from './pages/Login'

// Clear login state on initial load / refresh
localStorage.removeItem('shadybiz_logged_in')
localStorage.removeItem('shadybiz_username')

function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem('shadybiz_logged_in') === 'true'
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/billing" element={<Billing />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


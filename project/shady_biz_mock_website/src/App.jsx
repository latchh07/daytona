import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Signup from './pages/Signup'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Billing from './pages/Billing'
import Terms from './pages/Terms'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/billing" element={<Billing />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
    </Routes>
  )
}

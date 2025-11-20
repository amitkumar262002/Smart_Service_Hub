import { Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import HomeUnified from './pages/HomeUnified'
import SearchResults from './pages/SearchResults'
import SearchUnified from './pages/SearchUnified'
import ProviderProfile from './pages/ProviderProfile'
import BookingFlow from './pages/BookingFlow'
import PaymentPage from './pages/PaymentPage'
import Tracking from './pages/Tracking'
import ProviderTracking from './pages/ProviderTracking'
import MyBookings from './pages/MyBookings'
import BookingDetail from './pages/BookingDetail'
import ProviderDashboard from './pages/ProviderDashboard'
import UserProfile from './pages/UserProfile'
import AdminPanelAdvanced from '@/pages/AdminPanelAdvanced'
import OwnerCommandCenter from '@/pages/OwnerCommandCenter'
import LoginSignup from './pages/LoginSignup'
import LoginSignupAdvancedPro from './pages/LoginSignupAdvancedPro'
import LoginAdvancedMultiRole from './pages/LoginAdvancedMultiRole'
import LoginAdvancedComplete from './pages/LoginAdvancedComplete'
import SubscriptionPlans from './pages/SubscriptionPlans'
import About from './pages/About'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

import { getSessionUser } from './auth'

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const user = getSessionUser()
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const user = getSessionUser()
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

export const Router = (
  <>
    <Route path='/' element={<RequireAuth><HomeUnified /></RequireAuth>} />
    <Route path='/home-pro' element={<RequireAuth><HomeUnified /></RequireAuth>} />
    <Route path='/search' element={<RequireAuth><SearchUnified /></RequireAuth>} />
    <Route path='/search-pro' element={<RequireAuth><SearchUnified /></RequireAuth>} />
    <Route path='/provider/:id' element={<RequireAuth><ProviderProfile /></RequireAuth>} />
    <Route path='/book/:serviceId' element={<RequireAuth><BookingFlow /></RequireAuth>} />
    <Route path='/pay/:bookingId' element={<RequireAuth><PaymentPage /></RequireAuth>} />
    <Route path='/track/:bookingId' element={<RequireAuth><Tracking /></RequireAuth>} />
    <Route path='/provider-track/:bookingId' element={<RequireAuth><ProviderTracking /></RequireAuth>} />
    <Route path='/bookings' element={<RequireAuth><MyBookings /></RequireAuth>} />
    <Route path='/booking/:bookingId' element={<RequireAuth><BookingDetail /></RequireAuth>} />
    <Route path='/provider' element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
    <Route path='/profile' element={<RequireAuth><UserProfile /></RequireAuth>} />
    <Route path='/subscriptions' element={<RequireAuth><SubscriptionPlans /></RequireAuth>} />
    <Route path='/admin' element={<RequireAdmin><AdminPanelAdvanced /></RequireAdmin>} />
    <Route path='/owner' element={<RequireAuth><OwnerCommandCenter /></RequireAuth>} />
    <Route path='/login' element={<LoginAdvancedComplete />} />
    <Route path='/login-pro' element={<LoginAdvancedComplete />} />
    <Route path='/login-old' element={<LoginAdvancedMultiRole />} />
    <Route path='/about' element={<RequireAuth><About /></RequireAuth>} />
    <Route path='/contact' element={<RequireAuth><Contact /></RequireAuth>} />
    <Route path='/terms' element={<RequireAuth><Terms /></RequireAuth>} />
    <Route path='/privacy' element={<RequireAuth><Privacy /></RequireAuth>} />
  </>
)

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/Login'
import { WelcomePage } from './pages/Welcome'
import { HomePage } from './pages/Home'
import { HealthRecordsPage } from './pages/HealthRecords'
import { CaregiversPage } from './pages/Caregivers'
import { CaregiverDetailPage } from './pages/Caregivers/Detail'
import { CareTrackingPage } from './pages/CareTracking'
import { MessagesPage } from './pages/Messages'
import { ReviewsPage } from './pages/Reviews'
import { ProfilePage } from './pages/Profile'
import { SettingsPage } from './pages/Settings'
import { AdminCaregiverPage } from './pages/Admin/CaregiverManagement'
import { AdminRequestPage } from './pages/Admin/RequestManagement'
import { useAppStore, Permissions } from './store'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAppStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAppStore()
  if (isLoggedIn) return <Navigate to="/home" replace />
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route element={<AppShell />}>
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/health" element={<ProtectedRoute><HealthRecordsPage /></ProtectedRoute>} />
          <Route path="/caregivers" element={<ProtectedRoute><CaregiversPage /></ProtectedRoute>} />
          <Route path="/caregivers/:id" element={<ProtectedRoute><CaregiverDetailPage /></ProtectedRoute>} />
          <Route path="/care-tracking" element={<ProtectedRoute><CareTrackingPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin/caregivers" element={<ProtectedRoute><AdminCaregiverPage /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute><AdminRequestPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

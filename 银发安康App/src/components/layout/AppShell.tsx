import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAppStore } from '../../store'

const noNavPaths = ['/login', '/register']

export const AppShell: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, fontSizeScale } = useAppStore()
  const showNav = !noNavPaths.includes(location.pathname)

  return (
    <div style={{ fontSize: `${fontSizeScale * 100}%` }}>
      <Outlet />
      {showNav && user && <BottomNav />}
    </div>
  )
}

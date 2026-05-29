import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/home', label: '首页', icon: '🏠' },
  { path: '/health', label: '健康', icon: '❤️' },
  { path: '/caregivers', label: '护工', icon: '👨‍⚕️' },
  { path: '/messages', label: '消息', icon: '💬' },
  { path: '/profile', label: '我的', icon: '👤' },
]

export const BottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-height)',
        background: 'var(--color-bg-white)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
        maxWidth: 'var(--max-content-width)',
        margin: '0 auto',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              minWidth: 56,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1.2 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

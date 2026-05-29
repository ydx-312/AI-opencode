import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'

const QUOTES = [
  '老吾老以及人之老',
  '岁月不败温情，陪伴是最长情的告白',
  '每一份守护，都值得被看见',
  '用心守护，让爱传递',
  '银发安康，与您同行',
]

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
  size: 14 + Math.random() * 20,
  opacity: 0.15 + Math.random() * 0.25,
}))

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [phase, setPhase] = useState<'logo' | 'text' | 'quote' | 'done'>('logo')
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800)
    const t2 = setTimeout(() => setPhase('quote'), 1800)
    const t3 = setTimeout(() => setPhase('done'), 3200)
    const t4 = setTimeout(() => navigate('/home', { replace: true }), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #4CAF50 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated particles */}
      {PARTICLES.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: -40,
          fontSize: p.size,
          opacity: 0,
          color: 'rgba(255,255,255,0.3)',
          animation: `floatUp ${p.duration}s ease-out ${p.delay}s forwards`,
        }}>
          {['🍃', '🌿', '☘️', '🍀', '🌱', '💚', '✨', '🌸'][p.id % 8]}
        </div>
      ))}

      {/* Center content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: '0 24px' }}>
        {/* Logo circle */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          transform: phase === 'logo' ? 'scale(1)' : 'scale(1)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: phase === 'logo' ? 'logoPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
          opacity: phase === 'logo' ? 1 : 1,
        }}>
          <span style={{ fontSize: 48 }}>🍃</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: 'white',
          letterSpacing: 4,
          marginBottom: 8,
          opacity: phase === 'logo' || phase === 'text' ? 0 : 1,
          transform: phase === 'logo' || phase === 'text' ? 'translateY(20px)' : 'translateY(0)',
          transition: 'all 0.8s ease-out',
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          银发安康
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: 3,
          marginBottom: 40,
          opacity: phase === 'logo' || phase === 'text' ? 0 : 1,
          transform: phase === 'logo' || phase === 'text' ? 'translateY(16px)' : 'translateY(0)',
          transition: 'all 0.8s ease-out 0.1s',
        }}>
          老年及残障人士养护追踪平台
        </p>

        {/* User greeting */}
        {phase !== 'logo' && (
          <div style={{
            opacity: phase === 'text' ? 0 : 1,
            transform: phase === 'text' ? 'translateY(20px)' : 'translateY(0)',
            transition: 'all 0.8s ease-out 0.2s',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              padding: '12px 28px',
              borderRadius: 50,
              marginBottom: 32,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {user?.name?.charAt(0) || '用'}
              </span>
              <span style={{ fontSize: 18, color: 'white', fontWeight: 500 }}>
                {user?.name || '用户'}，欢迎回来
              </span>
            </div>

            {/* Quote */}
            <div style={{
              opacity: phase === 'quote' || phase === 'done' ? 1 : 0,
              transform: phase === 'quote' || phase === 'done' ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.8s ease-out',
            }}>
              <p style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.9)',
                fontStyle: 'italic',
                lineHeight: 1.8,
                marginBottom: 12,
              }}>
                「{quote}」
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {phase === 'done' && (
          <div style={{
            marginTop: 40,
            animation: 'fadeIn 0.5s ease forwards',
          }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes logoPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

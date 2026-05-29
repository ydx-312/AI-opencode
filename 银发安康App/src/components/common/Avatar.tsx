import React from 'react'

interface AvatarProps {
  src?: string
  name: string
  size?: number
  onClick?: () => void
  style?: React.CSSProperties
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 48, onClick, style }) => {
  const colors = ['#2E7D32', '#1976D2', '#F57C00', '#7B1FA2', '#C62828', '#00695C']
  const colorIndex = name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: src ? 'transparent' : bgColor,
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {!src && name.slice(0, 1)}
    </div>
  )
}

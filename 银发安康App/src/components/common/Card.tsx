import React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', style, onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick} style={{ ...(onClick ? { cursor: 'pointer' } : {}), ...style }}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  )
}

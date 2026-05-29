import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  )
}

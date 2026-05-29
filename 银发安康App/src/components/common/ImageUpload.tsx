import React, { useRef } from 'react'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  max?: number
  label?: string
  shape?: 'circle' | 'square'
  size?: number
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images, onImagesChange, max = 9, label, shape = 'square', size = 72,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = max - images.length
    const newImages = Array.from(files).slice(0, remaining).map((f) => URL.createObjectURL(f))
    onImagesChange([...images, ...newImages])
    e.target.value = ''
  }

  const handleRemove = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx)
    onImagesChange(updated)
  }

  const handleClickUpload = () => {
    inputRef.current?.click()
  }

  return (
    <div>
      {label && <div className="form-label">{label}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {images.map((img, i) => (
          <div key={i} style={{
            width: size, height: size,
            borderRadius: shape === 'circle' ? '50%' : 8,
            overflow: 'hidden', position: 'relative',
            border: '2px solid var(--color-border)',
            background: `url(${img}) center/cover no-repeat`,
            flexShrink: 0,
          }}>
            <button
              onClick={() => handleRemove(i)}
              style={{
                position: 'absolute', top: 2, right: 2, width: 20, height: 20,
                borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {images.length < max && (
          <div
            onClick={handleClickUpload}
            style={{
              width: size, height: size,
              borderRadius: shape === 'circle' ? '50%' : 8,
              background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              border: '2px dashed var(--color-border)', gap: 2,
              color: 'var(--color-text-light)', fontSize: 11,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>+</span>
            <span>上传</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

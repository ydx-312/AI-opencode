import { useState } from 'react'

interface Props {
  tagOptions: string[]
  onUpdate: (tags: string[]) => void
  onClose: () => void
}

export default function TagManagerModal({ tagOptions, onUpdate, onClose }: Props) {
  const [newTag, setNewTag] = useState('')
  const [options, setOptions] = useState(tagOptions)

  const handleAdd = () => {
    const t = newTag.trim()
    if (!t || options.includes(t)) return
    setOptions((prev) => [...prev, t].sort())
    setNewTag('')
  }

  const handleDelete = (tag: string) => {
    setOptions((prev) => prev.filter((t) => t !== tag))
  }

  const handleSave = () => {
    onUpdate(options)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tag-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏷️ 管理标签选项</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="tag-add-row">
            <input className="form-input" value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
              placeholder="输入新标签名称" />
            <button className="btn-sm" onClick={handleAdd} disabled={!newTag.trim()}>添加</button>
          </div>
          <div className="tag-option-list">
            {options.length === 0 && <p className="empty-text">暂无标签选项</p>}
            {options.map((tag) => (
              <div key={tag} className="tag-option-item">
                <span>{tag}</span>
                <button className="tag-delete-btn" onClick={() => handleDelete(tag)}>✕</button>
              </div>
            ))}
          </div>
          <div className="modal-actions" style={{ marginTop: 12 }}>
            <button className="btn-secondary" onClick={onClose}>取消</button>
            <button className="btn-primary" onClick={handleSave}>💾 保存标签列表</button>
          </div>
        </div>
      </div>
    </div>
  )
}

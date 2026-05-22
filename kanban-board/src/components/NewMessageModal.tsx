import { useState } from 'react'
import { CollaborationMessage, WorkItem, MemberProfile } from '../types'
import { DEPARTMENTS, generateCollabId } from '../data/mockData'

interface Props {
  onClose: () => void
  onSend: (msg: CollaborationMessage) => void
  memberProfiles: MemberProfile[]
  items: WorkItem[]
}

export default function NewMessageModal({ onClose, onSend, memberProfiles, items }: Props) {
  const [type, setType] = useState<CollaborationMessage['type']>('meeting')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [relatedItemId, setRelatedItemId] = useState('')
  const [sender] = useState('张教研')
  const [senderDept] = useState('教研部')

  const toggleRecipient = (name: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleSend = () => {
    if (!title.trim() || !content.trim() || selectedRecipients.length === 0) return
    const msg: CollaborationMessage = {
      id: generateCollabId(),
      type,
      title: title.trim(),
      content: content.trim(),
      sender,
      senderDept,
      recipients: selectedRecipients,
      relatedItemId: relatedItemId || undefined,
      status: 'unread',
      createdAt: new Date().toISOString(),
    }
    onSend(msg)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新建协作通知</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <label>类型</label>
            <div className="collab-type-selector">
              {(['meeting', 'handoff', 'alert', 'info'] as const).map((t) => (
                <button key={t}
                  className={`collab-type-btn ${type === t ? 'active' : ''}`}
                  onClick={() => setType(t)}
                >{
                  t === 'meeting' ? '📅 会议' :
                  t === 'handoff' ? '📦 交付' :
                  t === 'alert' ? '⚠️ 预警' : '📌 通知'
                }</button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <label>标题</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="通知标题" />
          </div>

          <div className="detail-section">
            <label>内容</label>
            <textarea className="form-input" rows={4} value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述协作内容、会议信息等..." />
          </div>

          <div className="detail-section">
            <label>收件人</label>
            {DEPARTMENTS.map((dept) => {
              const deptMembers = memberProfiles.filter((p) => p.department === dept)
              if (deptMembers.length === 0) return null
              return (
                <div key={dept} className="collab-recipient-group">
                  <div className="collab-dept-label">{dept}</div>
                  <div className="collab-recipient-list">
                    {deptMembers.map((p) => (
                      <label key={p.name} className="collab-recipient-item">
                        <input type="checkbox"
                          checked={selectedRecipients.includes(p.name)}
                          onChange={() => toggleRecipient(p.name)}
                        />
                        <span className="avatar-xs" style={{ background: p.avatarColor }}>
                          {p.name.charAt(0)}
                        </span>
                        {p.name} ({p.role})
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
            {selectedRecipients.length === 0 && <p className="empty-text" style={{ marginTop: 4 }}>请选择至少一个收件人</p>}
          </div>

          <div className="detail-section">
            <label>关联任务 (可选)</label>
            <select className="form-input" value={relatedItemId}
              onChange={(e) => setRelatedItemId(e.target.value)}
            >
              <option value="">不关联</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}: {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="detail-section" style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={handleSend}
              disabled={!title.trim() || !content.trim() || selectedRecipients.length === 0}
            >📨 发送通知</button>
          </div>
        </div>
      </div>
    </div>
  )
}

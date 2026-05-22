import { useState } from 'react'
import { CollaborationMessage, WorkItem, MemberProfile } from '../types'
import NewMessageModal from './NewMessageModal'


interface Props {
  messages: CollaborationMessage[]
  onClose: () => void
  onMarkRead: (id: string) => void
  onRespond: (id: string, response: string) => void
  onSend: (msg: CollaborationMessage) => void
  memberProfiles: MemberProfile[]
  items: WorkItem[]
  onItemClick: (item: WorkItem) => void
}

const TYPE_ICONS: Record<string, string> = { meeting: '📅', handoff: '📦', alert: '⚠️', info: '📌' }
const TYPE_LABELS: Record<string, string> = { meeting: '会议', handoff: '交付', alert: '预警', info: '通知' }

function getRelatedItem(items: WorkItem[], id?: string): WorkItem | undefined {
  if (!id) return
  return items.find((i) => i.id === id)
}

export default function CollaborationPanel({ messages, onClose, onMarkRead, onRespond, onSend, memberProfiles, items, onItemClick }: Props) {
  const [showCompose, setShowCompose] = useState(false)
  const [responseInputs, setResponseInputs] = useState<Record<string, string>>({})

  const unread = messages.filter((m) => m.status === 'unread')
  const read = messages.filter((m) => m.status === 'read')
  const responded = messages.filter((m) => m.status === 'responded')

  const handleSendResponse = (id: string) => {
    const text = responseInputs[id]
    if (!text?.trim()) return
    onRespond(id, text.trim())
    setResponseInputs((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content collab-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📢 协作通知</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <button className="btn-primary" onClick={() => setShowCompose(true)} style={{ margin: '8px 0' }}>
          + 新建协作
        </button>

        <div className="collab-list">
          {unread.length > 0 && <h4 className="collab-group-label">📩 未读 ({unread.length})</h4>}
          {unread.map((m) => (
            <div key={m.id} className="collab-item">
              <div className="collab-item-header">
                <span className="collab-type-badge">{TYPE_ICONS[m.type]} {TYPE_LABELS[m.type]}</span>
                <span className="collab-status-tag status-unread">未读</span>
              </div>
              <div className="collab-item-title">{m.title}</div>
              <div className="collab-item-meta">
                <span>发件人: {m.sender} ({m.senderDept})</span>
                <span> | 收件人: {m.recipients.join(', ')}</span>
              </div>
              <div className="collab-item-content">{m.content}</div>
              <div className="collab-item-time">{new Date(m.createdAt).toLocaleString('zh-CN')}</div>
              {m.relatedItemId && (
                <button className="collab-related-btn"
                  onClick={() => {
                    const ri = getRelatedItem(items, m.relatedItemId)
                    if (ri) onItemClick(ri)
                  }}
                >🔗 查看关联任务</button>
              )}
              <div className="collab-item-actions">
                <button className="btn-sm" onClick={() => onMarkRead(m.id)}>📖 标记已读</button>
              </div>
            </div>
          ))}

          {read.length > 0 && <h4 className="collab-group-label">📖 已读 ({read.length})</h4>}
          {read.map((m) => (
            <div key={m.id} className="collab-item">
              <div className="collab-item-header">
                <span className="collab-type-badge">{TYPE_ICONS[m.type]} {TYPE_LABELS[m.type]}</span>
                <span className="collab-status-tag status-read">已读</span>
              </div>
              <div className="collab-item-title">{m.title}</div>
              <div className="collab-item-meta">
                <span>发件人: {m.sender} ({m.senderDept})</span>
                <span> | 收件人: {m.recipients.join(', ')}</span>
              </div>
              <div className="collab-item-content">{m.content}</div>
              <div className="collab-item-time">
                已读: {m.readAt ? new Date(m.readAt).toLocaleString('zh-CN') : ''}
              </div>
              {m.relatedItemId && (
                <button className="collab-related-btn"
                  onClick={() => {
                    const ri = getRelatedItem(items, m.relatedItemId)
                    if (ri) onItemClick(ri)
                  }}
                >🔗 查看关联任务</button>
              )}
              <div className="collab-item-actions">
                <textarea className="form-input" rows={2} placeholder="输入回复内容..."
                  value={responseInputs[m.id] ?? ''}
                  onChange={(e) => setResponseInputs((prev) => ({ ...prev, [m.id]: e.target.value }))}
                />
                <button className="btn-primary" onClick={() => handleSendResponse(m.id)}
                  disabled={!responseInputs[m.id]?.trim()}
                >回复</button>
              </div>
            </div>
          ))}

          {responded.length > 0 && <h4 className="collab-group-label">✅ 已回复 ({responded.length})</h4>}
          {responded.map((m) => (
            <div key={m.id} className="collab-item responded">
              <div className="collab-item-header">
                <span className="collab-type-badge">{TYPE_ICONS[m.type]} {TYPE_LABELS[m.type]}</span>
                <span className="collab-status-tag status-responded">已回复</span>
              </div>
              <div className="collab-item-title">{m.title}</div>
              <div className="collab-item-meta">
                <span>发件人: {m.sender} ({m.senderDept})</span>
                <span> | 收件人: {m.recipients.join(', ')}</span>
              </div>
              <div className="collab-item-content">{m.content}</div>
              <div className="collab-item-response">
                <strong>回复:</strong> {m.response}
              </div>
              <div className="collab-item-time">
                回复时间: {m.respondedAt ? new Date(m.respondedAt).toLocaleString('zh-CN') : ''}
              </div>
              {m.relatedItemId && (
                <button className="collab-related-btn"
                  onClick={() => {
                    const ri = getRelatedItem(items, m.relatedItemId)
                    if (ri) onItemClick(ri)
                  }}
                >🔗 查看关联任务</button>
              )}
            </div>
          ))}

          {messages.length === 0 && <p className="empty-text">暂无协作通知</p>}
        </div>
      </div>

      {showCompose && (
        <NewMessageModal
          onClose={() => setShowCompose(false)}
          onSend={onSend}
          memberProfiles={memberProfiles}
          items={items}
        />
      )}
    </div>
  )
}

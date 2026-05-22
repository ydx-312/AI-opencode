import { useDraggable } from '@dnd-kit/core'
import { WorkItem, STATUS_LABELS } from '../types'

interface Props {
  item: WorkItem
  onClick: (item: WorkItem) => void
}

const priorityColors: Record<string, string> = {
  urgent: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#6b7280',
}

const priorityLabels: Record<string, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
}

const statusColors: Record<string, string> = {
  todo: '#9ca3af',
  in_progress: '#3b82f6',
  pending_review: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
}

export default function WorkItemCard({ item, onClick }: Props) {
  const isLocked = item.isLocked === true
  const isAbandoned = item.abandoned === true

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isLocked || isAbandoned ? `${item.id}-locked` : item.id,
    data: { item },
  })

  const style = transform && !isLocked && !isAbandoned
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : undefined

  const isOverdue = item.deadline && new Date(item.deadline) < new Date() && !isLocked && !isAbandoned

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isLocked || isAbandoned ? {} : listeners)}
      {...(isLocked || isAbandoned ? {} : attributes)}
      className={`work-item-card ${isLocked ? 'locked' : ''} ${isOverdue ? 'overdue' : ''} ${isAbandoned ? 'abandoned' : ''}`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
    >
      <div className="card-header">
        <span className="card-id" title={isLocked ? '已锁定' : isAbandoned ? '已废弃' : undefined}>
          {isLocked && '🔒 '}
          {isAbandoned && '🗑️ '}
          {item.id}
        </span>
        {!isAbandoned && (
          <span className="priority-badge" style={{ background: priorityColors[item.priority] }}>
            {priorityLabels[item.priority]}
          </span>
        )}
        {isAbandoned && (
          <span className="priority-badge" style={{ background: '#6b7280' }}>已废弃</span>
        )}
      </div>

      <h4 className={`card-title ${isAbandoned ? 'card-title-abandoned' : ''}`}>{item.title}</h4>

      {isOverdue && (
        <div className="card-warning">⚠️ 已过截止日 {item.deadline}</div>
      )}

      <div className="card-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <div className="card-footer">
        <div className="card-assignee" title={item.assignee}>
          <span className="avatar">{item.assignee.charAt(0)}</span>
          <span>{item.assignee}</span>
        </div>
        {!isAbandoned && (
          <span className="status-dot" style={{ background: statusColors[item.status] }}>
            {STATUS_LABELS[item.status]}
          </span>
        )}
      </div>
    </div>
  )
}

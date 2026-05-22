import { useMemo } from 'react'
import { WorkItem } from '../types'
import { getPhaseByKey } from '../types'

interface Props {
  items: WorkItem[]
  onItemClick: (item: WorkItem) => void
}

export default function DeadlineWarning({ items, onItemClick }: Props) {
  const warnings = useMemo(() => {
    const now = new Date()
    const result: { item: WorkItem; type: 'overdue' | 'due_this_week' | 'due_this_month' }[] = []

    for (const item of items) {
      if (item.isLocked) continue
      if (!item.deadline) continue

      const deadline = new Date(item.deadline)
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        result.push({ item, type: 'overdue' })
      } else if (diffDays <= 7) {
        result.push({ item, type: 'due_this_week' })
      } else if (diffDays <= 30) {
        result.push({ item, type: 'due_this_month' })
      }
    }

    return result.sort((a, b) => {
      if (a.type === 'overdue' && b.type !== 'overdue') return -1
      if (a.type !== 'overdue' && b.type === 'overdue') return 1
      return 0
    })
  }, [items])

  if (warnings.length === 0) return null

  const overdueCount = warnings.filter((w) => w.type === 'overdue').length
  const weekCount = warnings.filter((w) => w.type === 'due_this_week').length
  const monthCount = warnings.filter((w) => w.type === 'due_this_month').length

  const typeInfo = (t: string) => {
    if (t === 'overdue') return { label: '🔴 已超期', cls: 'overdue' }
    if (t === 'due_this_week') return { label: '🟡 本周截止', cls: 'due-week' }
    return { label: '🟢 本月截止', cls: 'due-month' }
  }

  return (
    <div className="warning-bar">
      <div className="warning-summary">
        <span className="warning-icon">🚨</span>
        <span className="warning-text">
          {overdueCount > 0 && <strong className="warning-danger">{overdueCount} 个任务已超期</strong>}
          {overdueCount > 0 && weekCount > 0 && <span> · </span>}
          {weekCount > 0 && <span>{weekCount} 个本周截止</span>}
          {(overdueCount > 0 || weekCount > 0) && monthCount > 0 && <span> · </span>}
          {monthCount > 0 && <span>{monthCount} 个本月截止</span>}
        </span>
      </div>
      <div className="warning-list">
        {warnings.slice(0, 5).map((w) => {
          const info = typeInfo(w.type)
          return (
          <div key={w.item.id} className="warning-item" onClick={() => onItemClick(w.item)}>
            <span className={`warning-type ${info.cls}`}>{info.label}</span>
            <span className="warning-title">{w.item.title}</span>
            <span className="warning-dept">{w.item.department}</span>
            <span className="warning-deadline">截止: {w.item.deadline}</span>
            {w.item.delayInfo && <span className="warning-has-report">📋 已提交延迟报告</span>}
          </div>
          )
        })}
        {warnings.length > 5 && (
          <div className="warning-more">还有 {warnings.length - 5} 个预警任务...</div>
        )}
      </div>
    </div>
  )
}

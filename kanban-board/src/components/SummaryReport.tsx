import { useMemo, useState } from 'react'
import { WorkItem } from '../types'
import { DEPARTMENTS, DEFAULT_TAG_OPTIONS } from '../data/mockData'
import { getMondayOfWeek } from '../utils/time'

interface Props {
  items: WorkItem[]
  onClose: () => void
  tagOptions?: string[]
}

type Period = 'week' | 'month' | 'year'

function getWeekId(date: Date): string {
  const m = getMondayOfWeek(date)
  return `${m.getFullYear()}-W${Math.ceil((m.getTime() - new Date(m.getFullYear(), 0, 1).getTime()) / (7 * 86400000))}`
}

function getMonthId(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getYearId(date: Date): string {
  return `${date.getFullYear()}`
}

function isCompletedThisPeriod(item: WorkItem, periodId: string, period: Period): boolean {
  const releasedEntry = item.timeline.find((t) => t.phase === 'released')
  if (!releasedEntry?.exitTime) return false
  const d = new Date(releasedEntry.exitTime)
  return period === 'week' ? getWeekId(d) === periodId
    : period === 'month' ? getMonthId(d) === periodId
    : getYearId(d) === periodId
}

function isCreatedThisPeriod(item: WorkItem, periodId: string, period: Period): boolean {
  const d = new Date(item.createdAt)
  return period === 'week' ? getWeekId(d) === periodId
    : period === 'month' ? getMonthId(d) === periodId
    : getYearId(d) === periodId
}

interface DeptPeriodStats {
  department: string
  carriedIn: number
  newTasks: number
  completed: number
  rolledOut: number
  completionRate: string
  overdueCount: number
}

export default function SummaryReport({ items, onClose, tagOptions }: Props) {
  const [period, setPeriod] = useState<Period>('week')

  const periods = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      const d = new Date(item.createdAt)
      if (period === 'week') set.add(getWeekId(d))
      else if (period === 'month') set.add(getMonthId(d))
      else set.add(getYearId(d))
    }
    return Array.from(set).sort().reverse()
  }, [items, period])

  const [selectedPeriod, setSelectedPeriod] = useState(periods[0] ?? '')

  const deptStats: DeptPeriodStats[] = useMemo(() => {
    if (!selectedPeriod) return []
    return DEPARTMENTS.map((dept) => {
      const deptItems = items.filter((i) => i.department === dept)
      const completed = deptItems.filter((i) => isCompletedThisPeriod(i, selectedPeriod, period)).length
      const newTasks = deptItems.filter((i) => isCreatedThisPeriod(i, selectedPeriod, period)).length
      const total = deptItems.length

      // carriedIn = tasks created before this period and still not completed
      const carriedIn = deptItems.filter((i) => {
        if (isCreatedThisPeriod(i, selectedPeriod, period)) return false
        const releasedEntry = i.timeline.find((t) => t.phase === 'released')
        return !releasedEntry?.exitTime
      }).length

      const overdueCount = deptItems.filter((i) => {
        if (i.phase === 'released') return false
        return !!i.deadline && new Date(i.deadline) < new Date()
      }).length

      const rolledOut = total - completed
      const completionRate = total > 0 ? `${Math.round(completed / total * 100)}%` : '-'

      return { department: dept, carriedIn, newTasks, completed, rolledOut, completionRate, overdueCount }
    })
  }, [items, selectedPeriod, period])

  const periodLabel = period === 'week' ? '周' : period === 'month' ? '月' : '年'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>📋 部门{periodLabel}度总结报表</h2>
          <span className="modal-id">共 {items.length} 个任务</span>
        </div>

        <div className="modal-body">
          <div className="summary-controls">
            <div className="period-tabs">
              {(['week', 'month', 'year'] as Period[]).map((p) => (
                <button key={p}
                  className={`filter-tab ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >{p === 'week' ? '周总结' : p === 'month' ? '月总结' : '年总结'}</button>
              ))}
            </div>
            <select className="year-select" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              {periods.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <section className="detail-section" style={{ marginTop: 16 }}>
            <label>{periodLabel}度汇总 · {selectedPeriod}</label>
            <div className="analytics-cards" style={{ marginBottom: 16 }}>
              <div className="analytics-card">
                <span className="analytics-num">{items.filter((i) => isCreatedThisPeriod(i, selectedPeriod, period)).length}</span>
                <span className="analytics-label">新建任务</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num" style={{ color: '#22c55e' }}>
                  {items.filter((i) => isCompletedThisPeriod(i, selectedPeriod, period)).length}
                </span>
                <span className="analytics-label">完成上线</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num" style={{ color: '#f59e0b' }}>
                  {items.filter((i) => {
                    if (isCreatedThisPeriod(i, selectedPeriod, period)) return false
                    return i.phase !== 'released'
                  }).length}
                </span>
                <span className="analytics-label">延期累积</span>
              </div>
            </div>

            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>部门</th>
                    <th>上期积压</th>
                    <th>本期新建</th>
                    <th>本期完成</th>
                    <th>下期待办</th>
                    <th>完成率</th>
                    <th>超期任务</th>
                  </tr>
                </thead>
                <tbody>
                  {deptStats.map((s) => (
                    <tr key={s.department}>
                      <td><strong>{s.department}</strong></td>
                      <td>{s.carriedIn}</td>
                      <td style={{ color: '#3b82f6' }}>{s.newTasks}</td>
                      <td style={{ color: '#22c55e' }}>{s.completed}</td>
                      <td style={{ color: s.rolledOut > 0 ? '#f59e0b' : undefined }}>{s.rolledOut}</td>
                      <td>{s.completionRate}</td>
                      <td style={{ color: s.overdueCount > 0 ? '#ef4444' : undefined }}>
                        {s.overdueCount > 0 ? `⚠️ ${s.overdueCount}` : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="detail-section">
            <label>💡 延期滚动说明</label>
            <p className="empty-text" style={{ lineHeight: 1.8 }}>
              • <strong>上期积压</strong> = 前几个{periodLabel}创建但截至本期仍未上线的任务<br />
              • <strong>本期新建</strong> = 本{periodLabel}内新创建的任务<br />
              • <strong>本期完成</strong> = 本{periodLabel}内完成上线的任务（不论何时创建）<br />
              • <strong>下期待办</strong> = 本{periodLabel}结束时仍未完成的任务，自动滚入下{periodLabel}<br />
              • 只要不是当{periodLabel}完成的，都算成下{periodLabel}任务（延期滚动）
            </p>
          </section>

          {/* Tag-based cost statistics */}
          <section className="detail-section">
            <label>🏷️ 标签统计（课节成本参考）</label>
            <p className="empty-text" style={{ marginBottom: 8 }}>
              按标签汇总任务数量与预估工时，用于计算每节课的平均成本
            </p>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>标签</th>
                    <th>任务数</th>
                    <th>总预估工时</th>
                    <th>已完成</th>
                    <th>平均工时/任务</th>
                  </tr>
                </thead>
                <tbody>
                  {(tagOptions ?? DEFAULT_TAG_OPTIONS).filter((t) => items.some((i) => i.tags.includes(t))).map((tag) => {
                    const tagged = items.filter((i) => i.tags.includes(tag))
                    const total = tagged.length
                    const completed = tagged.filter((i) => i.phase === 'released').length
                    const totalHours = tagged.reduce((sum, i) => sum + (i.estimatedHours ?? 0), 0)
                    const avgHours = total > 0 ? (totalHours / total).toFixed(1) : '-'
                    return (
                      <tr key={tag}>
                        <td><strong>{tag}</strong></td>
                        <td>{total}</td>
                        <td>{totalHours}h</td>
                        <td style={{ color: '#22c55e' }}>{completed}</td>
                        <td>{avgHours}{avgHours !== '-' ? 'h' : ''}</td>
                      </tr>
                    )
                  })}
                  {(tagOptions ?? DEFAULT_TAG_OPTIONS).filter((t) => items.some((i) => i.tags.includes(t))).length === 0 && (
                    <tr><td colSpan={5} className="empty-text" style={{ textAlign: 'center', padding: 12 }}>暂无带标签的任务</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

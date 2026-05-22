import { useMemo } from 'react'
import { WorkItem, PHASES, getPhaseByKey } from '../types'
import { DEPARTMENTS, MEMBERS } from '../data/mockData'

interface Props {
  items: WorkItem[]
  onClose: () => void
}

interface DeptStats {
  department: string
  total: number
  completed: number
  inProgress: number
  backlog: number
  avgDays: string
  rejectRate: string
  perMember: string
  memberCount: number
}

function calcAvgDays(item: WorkItem): number | null {
  const first = item.timeline[0]
  const last = item.timeline[item.timeline.length - 1]
  if (!first || !last?.exitTime) return null
  const start = new Date(first.enterTime).getTime()
  const end = new Date(last.exitTime).getTime()
  return (end - start) / (1000 * 60 * 60 * 24)
}

function calcDeptAvgDays(items: WorkItem[], dept: string): number | null {
  const deptItems = items.filter((i) => i.department === dept)
  const days = deptItems.map(calcAvgDays).filter((d): d is number => d !== null)
  if (days.length === 0) return null
  return days.reduce((a, b) => a + b, 0) / days.length
}

function calcRejectRate(items: WorkItem[], dept: string): number | null {
  const deptItems = items.filter((i) => i.department === dept)
  const allFeedbacks = deptItems.flatMap((i) => i.feedbacks)
  if (allFeedbacks.length === 0) return null
  const rejected = allFeedbacks.filter((f) => !f.passed).length
  return rejected / allFeedbacks.length
}

export default function AnalyticsPanel({ items, onClose }: Props) {
  const stats: DeptStats[] = useMemo(() => {
    const memberMap: Record<string, number> = {}
    for (const [dept, members] of Object.entries(MEMBERS)) {
      memberMap[dept] = members.length
    }

    return DEPARTMENTS.map((dept) => {
      const deptItems = items.filter((i) => i.department === dept)
      const completed = deptItems.filter((i) => i.phase === 'released').length
      const inProgress = deptItems.filter((i) => i.phase !== 'released').length
      const avgDays = calcDeptAvgDays(items, dept)
      const rejectRate = calcRejectRate(items, dept)
      const memberCount = memberMap[dept] ?? 1

      return {
        department: dept,
        total: deptItems.length,
        completed,
        inProgress,
        backlog: deptItems.filter((i) => i.status === 'todo' || i.status === 'pending_review').length,
        avgDays: avgDays !== null ? avgDays.toFixed(1) : '-',
        rejectRate: rejectRate !== null ? `${(rejectRate * 100).toFixed(0)}%` : '-',
        perMember: (deptItems.length / memberCount).toFixed(1),
        memberCount,
      }
    })
  }, [items])

  const totalTasks = items.length
  const completedTasks = items.filter((i) => i.phase === 'released').length
  const inProgressTasks = items.filter((i) => i.phase !== 'released').length
  const allAvgDays = (() => {
    const days = items.map(calcAvgDays).filter((d): d is number => d !== null)
    if (days.length === 0) return '-'
    return (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1)
  })()

  // Phase avg duration
  const phaseStats = PHASES.map((p) => {
    const durations: number[] = []
    for (const item of items) {
      const entry = item.timeline.find((t) => t.phase === p.key)
      if (entry?.exitTime) {
        const dur = (new Date(entry.exitTime).getTime() - new Date(entry.enterTime).getTime()) / (1000 * 60 * 60 * 24)
        durations.push(dur)
      }
    }
    const avg = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length) : null
    return { phase: p, avg: avg !== null ? avg.toFixed(1) : '-' }
  })

  // Assignee workload
  const assigneeWorkload = useMemo(() => {
    const map: Record<string, { total: number; active: number; done: number }> = {}
    for (const item of items) {
      if (!map[item.assignee]) map[item.assignee] = { total: 0, active: 0, done: 0 }
      map[item.assignee].total++
      if (item.phase === 'released') map[item.assignee].done++
      else map[item.assignee].active++
    }
    return Object.entries(map)
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.total - a.total)
  }, [items])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>📊 部门人效分析</h2>
          <span className="modal-id">共 {totalTasks} 个任务 · 数据实时</span>
        </div>

        <div className="modal-body">
          {/* 全局概览 */}
          <section className="detail-section">
            <label>全局概览</label>
            <div className="analytics-cards">
              <div className="analytics-card">
                <span className="analytics-num">{totalTasks}</span>
                <span className="analytics-label">总任务数</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num" style={{ color: '#22c55e' }}>{completedTasks}</span>
                <span className="analytics-label">已完成</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num" style={{ color: '#3b82f6' }}>{inProgressTasks}</span>
                <span className="analytics-label">进行中</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num">{allAvgDays}</span>
                <span className="analytics-label">平均工期(天)</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num">{completedTasks > 0 ? `${Math.round(completedTasks / totalTasks * 100)}%` : '-'}</span>
                <span className="analytics-label">完成率</span>
              </div>
            </div>
          </section>

          {/* 部门效率 */}
          <section className="detail-section">
            <label>各部门效率</label>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>部门</th>
                    <th>人数</th>
                    <th>总任务</th>
                    <th>已完成</th>
                    <th>进行中</th>
                    <th>积压</th>
                    <th>平均工期</th>
                    <th>驳回率</th>
                    <th>人均任务</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.department}>
                      <td><strong>{s.department}</strong></td>
                      <td>{s.memberCount}</td>
                      <td>{s.total}</td>
                      <td style={{ color: '#22c55e' }}>{s.completed}</td>
                      <td style={{ color: '#3b82f6' }}>{s.inProgress}</td>
                      <td style={{ color: s.backlog > 0 ? '#f59e0b' : undefined }}>{s.backlog}</td>
                      <td>{s.avgDays}</td>
                      <td style={{ color: s.rejectRate !== '-' && parseFloat(s.rejectRate) > 30 ? '#ef4444' : undefined }}>{s.rejectRate}</td>
                      <td>{s.perMember}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 各阶段平均停留 */}
          <section className="detail-section">
            <label>各阶段平均停留时间 (天)</label>
            <div className="analytics-cards">
              {phaseStats.map((ps) => (
                <div key={ps.phase.key} className="analytics-card analytics-card-sm" style={{ borderLeftColor: ps.phase.color }}>
                  <span className="analytics-num analytics-num-sm">{ps.avg}</span>
                  <span className="analytics-label">{ps.phase.icon} {ps.phase.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 个人负载 */}
          <section className="detail-section">
            <label>个人负载</label>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>总任务</th>
                    <th>活跃中</th>
                    <th>已完成</th>
                    <th>完成率</th>
                  </tr>
                </thead>
                <tbody>
                  {assigneeWorkload.map((a) => (
                    <tr key={a.name}>
                      <td><strong>{a.name}</strong></td>
                      <td>{a.total}</td>
                      <td style={{ color: '#3b82f6' }}>{a.active}</td>
                      <td style={{ color: '#22c55e' }}>{a.done}</td>
                      <td>{a.total > 0 ? `${Math.round(a.done / a.total * 100)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { LevelDetail, LEVELS, PHASE_STATUS_OPTIONS, TOPIC_OPTIONS, LESSONS_PER_LEVEL, MemberProfile } from '../types'

interface Props {
  progress: LevelDetail[]
  memberProfiles: MemberProfile[]
  onUpdate: (progress: LevelDetail[]) => void
  onClose: () => void
}

const PHASE_COLUMNS = [
  { key: '教研制作', width: 100 },
  { key: '美术制作', width: 100 },
  { key: '动画制作', width: 100 },
  { key: '开发制作', width: 100 },
  { key: '测试制作', width: 100 },
  { key: '质检上线', width: 120 },
  { key: '随材', width: 100 },
] as const

type EditingCell = {
  rowIdx: number
  field: string
  value: string
} | null

const EMPTY_ROW = (level: string, topic: string, lesson: number, year: number): LevelDetail => ({
  level: level as LevelDetail['level'],
  year,
  lesson,
  topic,
  topicName: '',
  courseName: '',
  coursewareCode: '',
  person: '',
  教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '',
})

export default function LevelProgressPanel({ progress, memberProfiles, onUpdate, onClose }: Props) {
  const [editing, setEditing] = useState<EditingCell>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [addingLevel, setAddingLevel] = useState<string | null>(null)
  const [newTopic, setNewTopic] = useState('专题一')
  const [newLesson, setNewLesson] = useState(1)
  const [unlockedRows, setUnlockedRows] = useState<Set<number>>(new Set())

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const r of progress) set.add(r.year)
    const sorted = [...set].sort((a, b) => b - a)
    return sorted.length > 0 ? sorted : [new Date().getFullYear()]
  }, [progress])

  const [selectedYear, setSelectedYear] = useState(years[0])

  const filteredProgress = useMemo(
    () => progress.filter((r) => r.year === selectedYear),
    [progress, selectedYear]
  )

  const rowsByLevel = useMemo(() => {
    const map: Record<string, LevelDetail[]> = {}
    for (const l of LEVELS) map[l] = []
    for (const row of filteredProgress) {
      if (map[row.level]) map[row.level].push(row)
    }
    return map
  }, [filteredProgress])

  const allMemberNames = useMemo(
    () => [...new Set(memberProfiles.filter((p) => p.active !== false).map((p) => p.name))].sort(),
    [memberProfiles]
  )

  const toggleCollapse = (level: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const commitEdit = () => {
    if (!editing) return
    const updated = [...progress]
    updated[editing.rowIdx] = { ...updated[editing.rowIdx], [editing.field]: editing.value }
    onUpdate(updated)
    setEditing(null)
  }

  const startEdit = (rowIdx: number, field: string, value: string) => {
    setEditing({ rowIdx, field, value })
  }

  const addRow = (level: string) => {
    setAddingLevel(null)
    onUpdate([...progress, EMPTY_ROW(level, newTopic, newLesson, selectedYear)])
    setNewTopic('专题一')
    setNewLesson(1)
  }

  const deleteRow = (rowIdx: number) => {
    setEditing(null)
    const updated = progress.filter((_, i) => i !== rowIdx)
    onUpdate(updated)
  }

  const toggleLock = (globalIdx: number) => {
    setUnlockedRows((prev) => {
      const next = new Set(prev)
      if (next.has(globalIdx)) next.delete(globalIdx)
      else next.add(globalIdx)
      return next
    })
  }

  return (
    <div className="modal-overlay level-fullscreen-overlay" onClick={onClose}>
      <div className="modal-content level-fullscreen-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>S1-S9 课程进度详情</h2>
          <span className="modal-id">按年度管理 · 每个级别含课节 · 点击单元格编辑</span>
        </div>

        {/* Year tabs */}
        <div className="year-tabs">
          {years.map((y) => (
            <button key={y}
              className={`year-tab ${selectedYear === y ? 'active' : ''}`}
              onClick={() => { setSelectedYear(y); setCollapsed(new Set()) }}
            >{y}年</button>
          ))}
        </div>

        <div className="modal-body">
          {LEVELS.map((level) => {
            const rows = rowsByLevel[level]
            const isCollapsed = collapsed.has(level)
            const isEmpty = rows.length === 0
            return (
              <div key={level} className="level-section">
                <div className="level-section-header" onClick={() => toggleCollapse(level)}>
                  <span className="level-section-toggle">{isCollapsed ? '▶' : '▼'}</span>
                  <span className="level-section-title"><strong>{level}</strong></span>
                  <span className="level-section-count">{rows.length} 讲</span>
                  <div className="level-section-actions" onClick={(e) => e.stopPropagation()}>
                    {addingLevel === level ? (
                      <span className="add-row-inline">
                        <input className="form-input" type="number" min={1} max={LESSONS_PER_LEVEL}
                          style={{ width: 56, fontSize: 12, padding: '2px 4px' }}
                          value={newLesson}
                          onChange={(e) => setNewLesson(Math.max(1, Math.min(LESSONS_PER_LEVEL, Number(e.target.value) || 1)))}
                          placeholder="课节" />
                        <select className="form-input" style={{ width: 90, fontSize: 12, padding: '2px 4px' }}
                          value={newTopic} onChange={(e) => setNewTopic(e.target.value)}>
                          {TOPIC_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button className="btn-sm" onClick={() => addRow(level)}>确定</button>
                        <button className="btn-sm" onClick={() => setAddingLevel(null)}>取消</button>
                      </span>
                    ) : (
                      <button className="btn-sm" onClick={() => setAddingLevel(level)}>+ 新增</button>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="level-section-body">
                    {isEmpty ? (
                      <p className="empty-text" style={{ padding: 12 }}>暂无课件，点击"+ 新增"添加</p>
                    ) : (
                      <table className="level-detail-grid">
                        <thead>
                          <tr>
                            <th className="level-th">课节</th>
                            <th className="level-th">专题</th>
                            <th className="level-th">专题名称</th>
                            <th className="level-th">课程名称</th>
                            <th className="dept-th">课件编号</th>
                            <th className="dept-th">负责人</th>
                            {PHASE_COLUMNS.map((c) => (
                              <th key={c.key} className="dept-th" style={{ minWidth: c.width }}>{c.key}</th>
                            ))}
                            <th className="dept-th">备注</th>
                            <th className="dept-th" style={{ minWidth: 40 }}>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => {
                            const globalIdx = progress.indexOf(row)
                            return (
                              <tr key={`${level}-${idx}`}>
                                <td className="level-td">{row.lesson}</td>

                                {/* Topic dropdown */}
                                <td className={`dept-cell ${editing?.rowIdx === globalIdx && editing?.field === 'topic' ? 'editing' : ''}`}
                                  onClick={() => !editing && unlockedRows.has(globalIdx) && startEdit(globalIdx, 'topic', row.topic)}
                                >
                                  {editing?.rowIdx === globalIdx && editing?.field === 'topic' ? (
                                    <select className="form-input cell-input cell-input-wide"
                                      value={editing.value}
                                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                      onBlur={commitEdit}
                                      autoFocus
                                    >
                                      {TOPIC_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="cell-value">{row.topic || '-'}</span>
                                  )}
                                </td>

                                {/* Text fields: topicName, courseName, coursewareCode */}
                                {(['topicName', 'courseName', 'coursewareCode'] as const).map((f) => {
                                  const val = row[f] ?? ''
                                  const isEditing = editing?.rowIdx === globalIdx && editing?.field === f
                                  return (
                                    <td key={f}
                                      className={`dept-cell ${isEditing ? 'editing' : ''}`}
                                      onClick={() => !isEditing && unlockedRows.has(globalIdx) && startEdit(globalIdx, f, val)}
                                    >
                                      {isEditing ? (
                                        <input className="form-input cell-input cell-input-wide"
                                          value={editing!.value}
                                          onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitEdit() } }}
                                          onBlur={commitEdit}
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="cell-value">{val || '-'}</span>
                                      )}
                                    </td>
                                  )
                                })}

                                {/* Person - multi-select from member profiles */}
                                <td className={`dept-cell person-cell ${editing?.rowIdx === globalIdx && editing?.field === 'person' ? 'editing' : ''}`}
                                  onClick={() => !editing && unlockedRows.has(globalIdx) && startEdit(globalIdx, 'person', row.person)}
                                >
                                  {editing?.rowIdx === globalIdx && editing?.field === 'person' ? (
                                    <div className="person-multi-select">
                                      {allMemberNames.map((name) => {
                                        const selected = editing!.value.split(',').map((s) => s.trim()).filter(Boolean).includes(name)
                                        return (
                                          <label key={name} className="person-check-label">
                                            <input type="checkbox"
                                              checked={selected}
                                              onChange={() => {
                                                const current = editing!.value.split(',').map((s) => s.trim()).filter(Boolean)
                                                const next = selected
                                                  ? current.filter((n) => n !== name)
                                                  : [...current, name]
                                                setEditing({ ...editing!, value: next.join(', ') })
                                              }}
                                            />
                                            <span>{name}</span>
                                          </label>
                                        )
                                      })}
                                      <button className="btn-sm" style={{ marginTop: 4 }}
                                        onClick={commitEdit}>确认</button>
                                    </div>
                                  ) : (
                                    <span className="cell-value">
                                      {row.person
                                        ? row.person.split(',').map((s) => s.trim()).filter(Boolean).map((name, i) => (
                                            <span key={name} className="person-tag">{name}{i < row.person.split(',').length - 1 ? '' : ''}</span>
                                          ))
                                        : '-'}
                                    </span>
                                  )}
                                </td>

                                {/* Phase status dropdowns */}
                                {PHASE_COLUMNS.map((c) => {
                                  const val = (row as any)[c.key] ?? '-'
                                  const isEditing = editing?.rowIdx === globalIdx && editing?.field === c.key
                                  const options = PHASE_STATUS_OPTIONS[c.key] ?? []
                                  return (
                                    <td key={c.key}
                                      className={`dept-cell ${isEditing ? 'editing' : ''}`}
                                      onClick={() => !isEditing && unlockedRows.has(globalIdx) && startEdit(globalIdx, c.key, val)}
                                    >
                                      {isEditing ? (
                                        <select className="form-input cell-input"
                                          value={editing!.value}
                                          onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                                          onBlur={commitEdit}
                                          autoFocus
                                        >
                                          <option value="-">-</option>
                                          {options.map((o) => (
                                            <option key={o} value={o}>{o}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span className="cell-value phase-status" data-status={val}>{val}</span>
                                      )}
                                    </td>
                                  )
                                })}

                                {/* Remarks */}
                                <td className={`dept-cell ${editing?.rowIdx === globalIdx && editing?.field === '备注' ? 'editing' : ''}`}
                                  onClick={() => !editing && unlockedRows.has(globalIdx) && startEdit(globalIdx, '备注', row.备注)}
                                >
                                  {editing?.rowIdx === globalIdx && editing?.field === '备注' ? (
                                    <input className="form-input cell-input cell-input-wide"
                                      value={editing!.value}
                                      onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitEdit() } }}
                                      onBlur={commitEdit}
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="cell-value">{row.备注 || '-'}</span>
                                  )}
                                </td>

                                {/* Lock / Delete */}
                                <td className="dept-cell lock-cell">
                                  <button className="btn-sm lock-btn"
                                    onClick={() => toggleLock(globalIdx)}
                                    title={unlockedRows.has(globalIdx) ? '点击锁定' : '点击解锁'}
                                  >{unlockedRows.has(globalIdx) ? '🔓' : '🔒'}</button>
                                  <button className="btn-sm btn-danger"
                                    onClick={() => deleteRow(globalIdx)}
                                    title="删除此讲"
                                  >✕</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

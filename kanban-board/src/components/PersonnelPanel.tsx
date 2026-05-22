import { useMemo, useState } from 'react'
import { WorkItem, MemberProfile } from '../types'
import { DEPARTMENTS } from '../data/mockData'

interface Props {
  items: WorkItem[]
  profiles: MemberProfile[]
  onUpdate: (profiles: MemberProfile[]) => void
  onClose: () => void
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0d9488', '#14b8a6', '#0891b2', '#06b6d4', '#059669', '#10b981', '#d97706', '#dc2626', '#ef4444', '#ca8a04']

function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export default function PersonnelPanel({ items, profiles, onUpdate, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const [editMap, setEditMap] = useState<Record<string, MemberProfile>>({})
  const [newMemberDept, setNewMemberDept] = useState<string | null>(null)
  const [showDisabled, setShowDisabled] = useState(false)

  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of items) {
      if (item.phase !== 'released') {
        map[item.assignee] = (map[item.assignee] ?? 0) + 1
      }
    }
    return map
  }, [items])

  const displayedDepts = useMemo(() => {
    const depts = [...new Set(profiles.map((p) => p.department))]
    return DEPARTMENTS.filter((d) => depts.includes(d))
  }, [profiles])

  const handleStartEdit = (p: MemberProfile) => {
    setEditMap((prev) => ({ ...prev, [p.name]: { ...p } }))
  }

  const handleEditChange = (name: string, field: string, value: string | number | string[]) => {
    setEditMap((prev) => {
      const entry = prev[name]
      if (!entry) return prev
      return { ...prev, [name]: { ...entry, [field]: value } }
    })
  }

  const handleSaveEdit = (originalName: string) => {
    const edited = editMap[originalName]
    if (!edited || !edited.name.trim()) return

    const newProfiles = profiles.map((p) =>
      p.name === originalName ? edited : p
    )
    if (originalName !== edited.name && newProfiles.some((p) => p.name === edited.name && p !== edited)) {
      alert('姓名已存在')
      return
    }
    onUpdate(newProfiles)
    setEditMap((prev) => {
      const next = { ...prev }
      delete next[originalName]
      return next
    })
  }

  const handleCancelEdit = (name: string) => {
    setEditMap((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleToggleActive = (name: string) => {
    const profile = profiles.find((p) => p.name === name)
    if (!profile) return
    onUpdate(profiles.map((p) =>
      p.name === name ? { ...p, active: p.active === false ? true : false } : p
    ))
  }

  const handleAddMember = (dept: string) => {
    const newName = `新成员${Date.now().toString(36).slice(-4)}`
    const newProfile: MemberProfile = {
      name: newName,
      department: dept,
      role: '成员',
      skills: [],
      avatarColor: getRandomColor(),
      maxTasks: 5,
      active: true,
    }
    onUpdate([...profiles, newProfile])
    setEditMap((prev) => ({ ...prev, [newName]: newProfile }))
    setNewMemberDept(null)
  }

  const filteredProfiles = showDisabled ? profiles : profiles.filter((p) => p.active !== false)

  const renderMemberCard = (m: MemberProfile) => {
    const isDisabled = m.active === false
    const isEditingThis = editing && editMap[m.name]
    const currentLoad = workloadMap[m.name] ?? 0
    const loadPercent = Math.round((currentLoad / m.maxTasks) * 100)
    const loadColor = loadPercent >= 100 ? '#ef4444'
      : loadPercent >= 75 ? '#f59e0b'
      : loadPercent >= 50 ? '#3b82f6'
      : '#22c55e'

    if (isEditingThis) {
      const e = editMap[m.name]
      return (
        <div key={m.name} className="personnel-card editing">
          <div className="personnel-avatar" style={{ background: e.avatarColor }}>{e.name.charAt(0)}</div>
          <div className="personnel-body">
            <input className="form-input" style={{ fontSize: 13, marginBottom: 4 }} value={e.name}
              onChange={(v) => handleEditChange(m.name, 'name', v.target.value)} placeholder="姓名" />
            <input className="form-input" style={{ fontSize: 12, marginBottom: 4 }} value={e.role}
              onChange={(v) => handleEditChange(m.name, 'role', v.target.value)} placeholder="角色" />
            <input className="form-input" style={{ fontSize: 12, marginBottom: 4 }} value={e.skills.join(', ')}
              onChange={(v) => handleEditChange(m.name, 'skills', v.target.value.split(',').map((s) => s.trim()))} placeholder="技能（逗号分隔）" />
            <div className="personnel-load">
              <span className="load-text" style={{ fontSize: 12 }}>最大任务数:</span>
              <input className="form-input" style={{ width: 60, fontSize: 12 }} type="number" min={1} value={e.maxTasks}
                onChange={(v) => handleEditChange(m.name, 'maxTasks', Number(v.target.value))} />
            </div>
            <div className="edit-actions" style={{ marginTop: 6 }}>
              <button className="btn-sm" onClick={() => handleSaveEdit(m.name)}>💾 保存</button>
              <button className="btn-sm" onClick={() => handleCancelEdit(m.name)}>取消</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={m.name} className={`personnel-card ${isDisabled ? 'disabled' : ''}`}>
        <div className="personnel-avatar" style={{ background: m.avatarColor }}>{m.name.charAt(0)}</div>
        <div className="personnel-body">
          <div className="personnel-name">
            {m.name}
            {isDisabled && <span className="disabled-badge">已禁用</span>}
          </div>
          <div className="personnel-role">{m.role}</div>
          <div className="personnel-skills">
            {m.skills.map((s) => <span key={s} className="tag">{s}</span>)}
          </div>
          <div className="personnel-load">
            <div className="load-bar-bg">
              <div className="load-bar-fill" style={{ width: `${Math.min(loadPercent, 100)}%`, background: loadColor }} />
            </div>
            <span className="load-text" style={{ color: loadColor }}>
              {currentLoad}/{m.maxTasks} 任务{loadPercent >= 100 ? ' ⚠️已满' : ''}
            </span>
          </div>
          {editing && (
            <div className="edit-actions" style={{ marginTop: 6 }}>
              <button className="btn-sm" onClick={() => handleStartEdit(m)}>✏️ 编辑</button>
              <button className={`btn-sm ${isDisabled ? 'btn-restore' : ''}`}
                onClick={() => handleToggleActive(m.name)}>
                {isDisabled ? '✅ 启用' : '🚫 禁用'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>👤 各部门人物画像</h2>
              <span className="modal-id">共 {profiles.length} 人（含 {profiles.filter((p) => p.active === false).length} 已禁用）</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label className="filter-toggle-label">
                <input type="checkbox" checked={showDisabled}
                  onChange={(e) => setShowDisabled(e.target.checked)} />
                显示已禁用
              </label>
              <button
                className={`filter-tab ${editing ? 'active' : ''}`}
                onClick={() => { setEditing(!editing); setEditMap({}) }}
                style={{ fontSize: 13 }}
              >
                {editing ? '✅ 完成编辑' : '✏️ 编辑成员'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {displayedDepts.map((dept) => {
            const members = filteredProfiles.filter((p) => p.department === dept)
            return (
              <section key={dept} className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>{dept} ({members.length} 人)</label>
                  {editing && (
                    <button className="btn-sm" onClick={() => handleAddMember(dept)}>+ 新增成员</button>
                  )}
                </div>
                <div className="personnel-grid">
                  {members.map(renderMemberCard)}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

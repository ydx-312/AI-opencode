import { useMemo, useState, useEffect } from 'react'
import { Phase, WorkItem, PHASES, Priority, PRIORITY_LABELS, MemberProfile, LEVELS, LevelDetail, Level, LESSONS_PER_LEVEL, PHASE_DEPARTMENT } from '../types'
import { DEPARTMENTS, generateId, buildMembersFromProfiles } from '../data/mockData'
import TagManagerModal from './TagManagerModal'

interface Props {
  defaultPhase: Phase
  memberProfiles: MemberProfile[]
  tagOptions: string[]
  levelProgress: LevelDetail[]
  onUpdateTagOptions: (tags: string[]) => void
  onUpdateLevelProgress: (data: LevelDetail[]) => void
  onClose: () => void
  onCreated: (item: WorkItem) => void
}

export default function CreateItemModal({ defaultPhase, memberProfiles, tagOptions, levelProgress, onUpdateTagOptions, onUpdateLevelProgress, onClose, onCreated }: Props) {
  const activeProfiles = useMemo(() => memberProfiles.filter((p) => p.active !== false), [memberProfiles])
  const membersMap = useMemo(() => buildMembersFromProfiles(activeProfiles), [activeProfiles])
  const departments = useMemo(() => [...new Set(activeProfiles.map((p) => p.department))], [activeProfiles])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState<Phase>(defaultPhase)
  const [priority, setPriority] = useState<Priority>('medium')
  const [department, setDepartment] = useState(departments[0] ?? DEPARTMENTS[0])
  const [assignee, setAssignee] = useState((membersMap[department] ?? [DEPARTMENTS[0]])[0])
  const [tags, setTags] = useState<string[]>([])
  const [showTagManager, setShowTagManager] = useState(false)
  const [level, setLevel] = useState<Level>('S1')
  const [lesson, setLesson] = useState(1)
  const allNames = useMemo(() => Object.values(membersMap).flat(), [membersMap])
  const [creator, setCreator] = useState(allNames[0] ?? '张教研')

  const currentProfile = useMemo(
    () => activeProfiles.find((p) => p.name === assignee),
    [activeProfiles, assignee]
  )

  const isNewCourseware = tags[0] === '新课件制作'
  const isMaterialTask = tags[0] === '教材制作'

  const allowedPhases = useMemo(() =>
    isMaterialTask
      ? PHASES.filter((p) => p.key === 'material_design' || p.key === 'teaching_review')
      : PHASES,
    [isMaterialTask]
  )

  const allowedDepartments = useMemo(() => {
    if (!isMaterialTask) return departments
    const deptSet = new Set<string>()
    for (const p of allowedPhases) {
      deptSet.add(PHASE_DEPARTMENT[p.key])
    }
    return [...deptSet]
  }, [isMaterialTask, allowedPhases, departments])

  // Sync phase/department when tag changes to 教材制作
  useEffect(() => {
    if (isMaterialTask) {
      if (!allowedPhases.find((p) => p.key === phase)) {
        setPhase(allowedPhases[0].key)
      }
      if (!allowedDepartments.includes(department)) {
        handleDepartmentChange(allowedDepartments[0])
      }
    }
  }, [tags[0]])

  const selectTag = (t: string) => {
    setTags((prev) => prev[0] === t ? [] : [t])
  }

  const handleDepartmentChange = (d: string) => {
    setDepartment(d)
    const names = membersMap[d]
    if (names && names.length > 0) setAssignee(names[0])
  }

  const handleSubmit = () => {
    if (!title.trim() || tags.length === 0) return

    const now = new Date().toISOString()
    const newItem: WorkItem = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      phase,
      status: 'todo',
      assignee,
      department,
      creator,
      priority,
      tags,
      createdAt: now,
      updatedAt: now,
      feedbacks: [],
      timeline: [{ phase, enterTime: now }],
      ...(isNewCourseware ? { level, lesson } : {}),
    }
    onCreated(newItem)
    if (isNewCourseware) {
      const exists = levelProgress.find((r) => r.level === level && r.lesson === lesson)
      if (!exists) {
        onUpdateLevelProgress([
          ...levelProgress,
          {
            level,
            year: new Date().getFullYear(),
            lesson,
            topic: '',
            topicName: '',
            courseName: '',
            coursewareCode: '',
            person: creator,
            教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '',
          },
        ])
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>新建任务</h2>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <label>🏷️ 标签 * <span className="tag-select-hint">（从列表选择，唯一）</span></label>
            <div className="tag-section-header">
              <div className="tag-option-selector">
                {tagOptions.map((t) => (
                  <button key={t}
                    className={`tag-option-btn ${tags[0] === t ? 'selected' : ''}`}
                    onClick={() => selectTag(t)}
                  >{t}</button>
                ))}
              </div>
              <button className="btn-sm" onClick={() => setShowTagManager(true)}>管理标签</button>
            </div>
            {tags.length === 0 && <p className="empty-text" style={{ marginTop: 4 }}>请选择一个标签</p>}
          </div>

          {isNewCourseware && (
            <div className="detail-grid">
              <div className="detail-section">
                <label>级别</label>
                <select className="form-input" value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="detail-section">
                <label>课节</label>
                <select className="form-input" value={lesson}
                  onChange={(e) => setLesson(Number(e.target.value))}>
                  {Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>第{n}课</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="detail-section">
            <label>任务标题 *</label>
            <input className="form-input" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：小学数学-分数加减法" autoFocus />
          </div>

          <div className="detail-section">
            <label>描述</label>
            <textarea className="form-input" rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简单描述任务内容..." />
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <label>所属阶段</label>
              <select className="form-input" value={phase} onChange={(e) => setPhase(e.target.value as Phase)}>
                {allowedPhases.map((p) => (
                  <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
                ))}
              </select>
            </div>
            <div className="detail-section">
              <label>优先级</label>
              <div className="priority-selector">
                {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button key={p}
                    className={`priority-btn ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}>{PRIORITY_LABELS[p]}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <label>所属部门</label>
              <select className="form-input" value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}>
                {allowedDepartments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="detail-section">
              <label>负责人</label>
              <select className="form-input" value={assignee}
                onChange={(e) => setAssignee(e.target.value)}>
                {(membersMap[department] ?? []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="detail-section">
            <label>创建人</label>
            <select className="form-input" value={creator}
              onChange={(e) => setCreator(e.target.value)}>
              {allNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {currentProfile && (
            <div className="detail-section">
              <label>👤 负责人画像预览</label>
              <div className="profile-card profile-card-sm">
                <div className="profile-avatar" style={{ background: currentProfile.avatarColor }}>
                  {currentProfile.name.charAt(0)}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{currentProfile.name}</div>
                  <div className="profile-dept-role">{currentProfile.department} · {currentProfile.role}</div>
                  <div className="profile-skills">
                    {currentProfile.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>取消</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={!title.trim() || tags.length === 0}>创建任务</button>
          </div>
        </div>
      </div>

      {showTagManager && (
        <TagManagerModal
          tagOptions={tagOptions}
          onUpdate={onUpdateTagOptions}
          onClose={() => setShowTagManager(false)}
        />
      )}
    </div>
  )
}

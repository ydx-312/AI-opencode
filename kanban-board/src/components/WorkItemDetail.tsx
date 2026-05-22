import { useState } from 'react'
import { WorkItem, Phase, PHASES, STATUS_LABELS, getPhaseByKey, Priority, PRIORITY_LABELS, MemberProfile, PHASE_DEPARTMENT, MATERIAL_STATUS_OPTIONS } from '../types'
import { getProfile } from '../data/mockData'

interface Props {
  item: WorkItem
  onClose: () => void
  onUpdate: (item: WorkItem) => void
  memberProfiles: MemberProfile[]
}

export default function WorkItemDetail({ item, onClose, onUpdate, memberProfiles }: Props) {
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackPassed, setFeedbackPassed] = useState(true)
  const [hours, setHours] = useState(item.estimatedHours ?? 0)
  const [deadline, setDeadline] = useState(item.deadline ?? '')
  const [delayReason, setDelayReason] = useState(item.delayInfo?.reason ?? '')
  const [delayNode, setDelayNode] = useState(item.delayInfo?.resolveNode ?? '')
  const [delayPlan, setDelayPlan] = useState(item.delayInfo?.resolvePlan ?? '')
  const [editTitle, setEditTitle] = useState(item.title)
  const [editDesc, setEditDesc] = useState(item.description)
  const [editingMeta, setEditingMeta] = useState(false)

  const isLocked = item.isLocked === true
  const isAbandoned = item.abandoned === true

  const handleToggleLock = () => {
    onUpdate({ ...item, isLocked: !isLocked, updatedAt: new Date().toISOString() })
  }

  const handleToggleAbandoned = () => {
    onUpdate({ ...item, abandoned: !isAbandoned, isLocked: false, updatedAt: new Date().toISOString() })
  }

  const handleSaveMeta = () => {
    if (!editTitle.trim()) return
    onUpdate({
      ...item,
      title: editTitle.trim(),
      description: editDesc.trim(),
      updatedAt: new Date().toISOString(),
    })
    setEditingMeta(false)
  }

  const handlePhaseChange = (targetPhase: Phase) => {
    if (targetPhase === item.phase || isLocked) return
    const targetDept = PHASE_DEPARTMENT[targetPhase]
    const targetMembers = memberProfiles.filter((p) => p.department === targetDept)
    const newAssignee = targetMembers.length > 0 ? targetMembers[0].name : item.assignee
    const updated: WorkItem = {
      ...item,
      phase: targetPhase,
      department: targetDept,
      assignee: newAssignee,
      status: 'todo',
      materialStatus: targetPhase === 'material_design' ? '设计中' : item.materialStatus,
      updatedAt: new Date().toISOString(),
      feedbacks: [
        ...item.feedbacks,
        {
          id: `FB-${Date.now()}`,
          from: item.assignee,
          to: '系统',
          comment: `手动流转: ${getPhaseByKey(item.phase).label} → ${getPhaseByKey(targetPhase).label}`,
          passed: true,
          createdAt: new Date().toISOString(),
        },
      ],
      timeline: [
        ...item.timeline,
        { phase: targetPhase, enterTime: new Date().toISOString() },
      ],
    }
    onUpdate(updated)
  }

  const handleAssigneeChange = (name: string) => {
    if (isLocked) return
    const profile = memberProfiles.find((p) => p.name === name)
    onUpdate({
      ...item,
      assignee: name,
      department: profile?.department ?? item.department,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleStatusChange = (newStatus: string) => {
    if (isLocked) return
    if (isMaterialTask) {
      // Material design uses custom status
      const updated: Partial<WorkItem> = { materialStatus: newStatus, updatedAt: new Date().toISOString() }
      if (newStatus === '已完成') {
        // Auto-flow to teaching_review
        updated.phase = 'teaching_review'
        updated.status = 'todo'
        updated.department = PHASE_DEPARTMENT.teaching_review
        const members = memberProfiles.filter((p) => p.department === updated.department && p.active !== false)
        updated.assignee = members[0]?.name ?? item.assignee
        updated.timeline = [...item.timeline, { phase: 'teaching_review', enterTime: new Date().toISOString() }]
        updated.feedbacks = [
          ...item.feedbacks,
          {
            id: `FB-${Date.now()}`,
            from: item.assignee,
            to: updated.assignee,
            comment: '教材设计已完成，自动流转至教研审核',
            passed: true,
            createdAt: new Date().toISOString(),
          },
        ]
      }
      onUpdate({ ...item, ...updated })
      return
    }
    const updated: Partial<WorkItem> = {}
    if (newStatus === 'approved') {
      updated.isLocked = true
    }
    onUpdate({ ...item, ...updated, status: newStatus as WorkItem['status'], updatedAt: new Date().toISOString() })
  }

  const handlePriorityChange = (p: Priority) => {
    if (isLocked) return
    onUpdate({ ...item, priority: p, updatedAt: new Date().toISOString() })
  }

  const handleSaveEstimation = () => {
    onUpdate({
      ...item,
      estimatedHours: hours,
      deadline: deadline || undefined,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleSaveDelayReport = () => {
    if (!delayReason.trim() || !delayNode.trim() || !delayPlan.trim()) return
    onUpdate({
      ...item,
      delayInfo: {
        reason: delayReason,
        resolveNode: delayNode,
        resolvePlan: delayPlan,
        reportedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })
  }

  const handleAddFeedback = () => {
    if (!feedbackText.trim() || isLocked) return
    const updated: WorkItem = {
      ...item,
      updatedAt: new Date().toISOString(),
      feedbacks: [
        ...item.feedbacks,
        {
          id: `FB-${Date.now()}`,
          from: item.assignee,
          to: '下游部门',
          comment: feedbackText,
          passed: feedbackPassed,
          createdAt: new Date().toISOString(),
        },
      ],
    }
    onUpdate(updated)
    setFeedbackText('')
  }

  const currentPhase = getPhaseByKey(item.phase)
  const currentPhaseIndex = PHASES.findIndex((p) => p.key === item.phase)
  const isMaterialTask = item.tags[0] === '教材制作'
  const isOverdue = !!item.deadline && new Date(item.deadline) < new Date() && !isLocked && !isAbandoned
  const profile = getProfile(item.assignee)

  const activeMembers = memberProfiles.filter((p) => p.active !== false)
  const allDepartments = [...new Set(activeMembers.map((p) => p.department))].sort()
  const currentDeptMembers = activeMembers.filter((p) => p.department === item.department)
  const currentDeptMembersList = [...new Set([...currentDeptMembers.map((p) => p.name), item.assignee])]
  const sortedDeptMembers = currentDeptMembersList.sort()

  const handleDepartmentChange = (dept: string) => {
    if (isLocked) return
    const deptMembers = activeMembers.filter((p) => p.department === dept)
    const firstMember = deptMembers.length > 0 ? deptMembers[0].name : item.assignee
    onUpdate({
      ...item,
      department: dept,
      assignee: firstMember,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${isAbandoned ? 'modal-abandoned' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-header-row">
            <span className="modal-phase-badge" style={{ background: currentPhase.color }}>
              {currentPhase.icon} {currentPhase.label}
            </span>
            {isLocked && <span className="modal-locked-badge">🔒 已锁定</span>}
            {isAbandoned && <span className="modal-abandoned-badge">🗑️ 已废弃</span>}
            {isOverdue && <span className="modal-overdue-badge">⚠️ 已过截止日</span>}
          </div>

          {editingMeta && !isLocked ? (
            <div className="edit-meta-group">
              <input className="form-input" value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="任务标题" style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }} />
              <textarea className="form-input" rows={3} value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="任务描述" style={{ marginTop: 6 }} />
              <div className="edit-actions" style={{ marginTop: 6 }}>
                <button className="btn-primary" onClick={handleSaveMeta}
                  disabled={!editTitle.trim()}>💾 保存</button>
                <button className="btn-sm" onClick={() => { setEditingMeta(false); setEditTitle(item.title); setEditDesc(item.description) }}>取消</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className={isAbandoned ? 'title-abandoned' : ''} onClick={() => { if (!isLocked) { setEditTitle(item.title); setEditDesc(item.description); setEditingMeta(true) } }} style={{ cursor: isLocked ? 'default' : 'pointer' }}>
                {item.title}
                {!isLocked && <span className="edit-hint"> ✏️</span>}
              </h2>
              <p className={`detail-desc ${isAbandoned ? 'desc-abandoned' : ''}`} onClick={() => { if (!isLocked) { setEditTitle(item.title); setEditDesc(item.description); setEditingMeta(true) } }} style={{ cursor: isLocked ? 'default' : 'pointer' }}>
                {item.description || '暂无描述'}
                {!isLocked && <span className="edit-hint"> ✏️</span>}
              </p>
            </>
          )}
          {item.tags.length > 0 && (
            <div className="detail-tags" style={{ marginTop: 6 }}>
              {item.tags.map((tag) => (
                <span key={tag} className="tag tag-lg">{tag}</span>
              ))}
            </div>
          )}
          {item.level && (
            <div className="detail-level-info" style={{ marginTop: 6 }}>
              📚 级别: <strong>{item.level}</strong> · 课节: <strong>第{item.lesson}课</strong>
            </div>
          )}
          <div className="modal-creator">
            👤 创建人: <strong>{item.creator}</strong>
          </div>
          <span className="modal-id">{item.id}</span>
        </div>

        <div className="modal-body">
          {/* 废弃/恢复操作 */}
          {!isLocked && (
            <section className="detail-section">
              <label>🗑️ 任务状态</label>
              <div className="abandon-toggle-row">
                {isAbandoned ? (
                  <button className="btn-primary" onClick={handleToggleAbandoned}
                    style={{ background: '#059669' }}>↩️ 恢复任务</button>
                ) : (
                  <button className="btn-danger" onClick={handleToggleAbandoned}
                  >🗑️ 废弃任务</button>
                )}
                <span className="lock-hint">
                  {isAbandoned
                    ? '任务已废弃，拖拽和编辑已禁用。恢复后可继续流转。'
                    : '废弃后任务将不再参与流转，但数据保留可查。'}
                </span>
              </div>
            </section>
          )}

          <div className="detail-grid">
            <div className="detail-section">
              <label>负责人</label>
              {isLocked || isAbandoned ? (
                <div className="assignee-with-profile">
                  <span className="avatar-sm" style={{ background: profile?.avatarColor ?? '#6b7280' }}>
                    {item.assignee.charAt(0)}
                  </span>
                  <div>
                    <p>{item.assignee}</p>
                    {profile && <span className="profile-role">{profile.role}</span>}
                  </div>
                </div>
              ) : (
                <div className="assignee-editor">
                  <select className="form-input" value={item.assignee}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    style={{ marginTop: 2 }}
                  >
                    {sortedDeptMembers.length === 0 && <option value={item.assignee}>{item.assignee}</option>}
                    {sortedDeptMembers.map((name) => {
                      const p = memberProfiles.find((mp) => mp.name === name)
                      return (
                        <option key={name} value={name}>
                          {name}{p ? ` (${p.role})` : ''}
                        </option>
                      )
                    })}
                  </select>
                  {profile && (
                    <div className="assignee-preview" style={{ marginTop: 6 }}>
                      <div className="profile-card compact">
                        <div className="profile-avatar" style={{ background: profile.avatarColor, width: 28, height: 28, fontSize: 12 }}>
                          {profile.name.charAt(0)}
                        </div>
                        <div className="profile-info">
                          <div className="profile-name" style={{ fontSize: 13 }}>{profile.name}</div>
                          <div className="profile-dept-role" style={{ fontSize: 11 }}>{profile.department} · {profile.role}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="detail-section">
              <label>所属部门</label>
              {isLocked || isAbandoned ? (
                <p>{item.department}</p>
              ) : (
                <select className="form-input" value={item.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  style={{ marginTop: 2 }}
                >
                  {allDepartments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="detail-section">
              <label>优先级</label>
              {isLocked || isAbandoned ? (
                <p className={`priority-${item.priority}`}>{PRIORITY_LABELS[item.priority]}</p>
              ) : (
                <div className="priority-selector" style={{ marginTop: 2 }}>
                  {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button key={p}
                      className={`priority-btn ${item.priority === p ? 'active' : ''}`}
                      onClick={() => handlePriorityChange(p)}
                    >{PRIORITY_LABELS[p]}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="detail-section">
              <label>当前状态</label>
              <p>{STATUS_LABELS[item.status]}</p>
            </div>
          </div>

          {/* Lock Toggle */}
          <section className="detail-section lock-toggle-section">
            <label>🔒 锁定控制</label>
            <div className="lock-toggle-row">
              <button
                className={`lock-toggle ${isLocked ? 'locked' : 'unlocked'}`}
                onClick={handleToggleLock}
              >
                {isLocked ? '🔒 锁定中 - 点击解锁' : '🔓 未锁定 - 点击锁定'}
              </button>
              <span className="lock-hint">
                {isLocked
                  ? '任务已锁定，不可拖拽、流转或编辑'
                  : '任务可自由流转和编辑'}
              </span>
            </div>
            <p className="lock-note">提示: 状态改为"已通过"时会自动锁定，可在此手动解锁</p>
          </section>

          {/* Personnel Profile */}
          {profile && (
            <section className="detail-section">
              <label>👤 负责人画像</label>
              <div className="profile-card">
                <div className="profile-avatar" style={{ background: profile.avatarColor }}>
                  {profile.name.charAt(0)}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{profile.name}</div>
                  <div className="profile-dept-role">{profile.department} · {profile.role}</div>
                  <div className="profile-skills">
                    {profile.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                  </div>
                  <div className="profile-capacity">
                    负载: <strong>{/* computed externally */}?</strong> / {profile.maxTasks} 任务
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 预估工时 & 截止日 */}
          <section className="detail-section">
            <label>⏱ 任务预估 & 截止日</label>
            <div className="estimation-row">
              <div className="estimation-field">
                <span className="estimation-label">预估工时 (小时)</span>
                <input className="form-input estimation-input" type="number" min={0}
                  value={hours} onChange={(e) => setHours(Number(e.target.value))} disabled={isLocked || isAbandoned} />
              </div>
              <div className="estimation-field">
                <span className="estimation-label">必须完成日期</span>
                <input className="form-input estimation-input" type="date"
                  value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={isLocked || isAbandoned} />
              </div>
              {!isLocked && !isAbandoned && (
                <button className="btn-sm" onClick={handleSaveEstimation} style={{ marginTop: 18 }}>保存</button>
              )}
            </div>
          </section>

          {/* 手动流转阶段 */}
          <section className="detail-section">
            <label>操作 - 手动流转阶段</label>
            <div className="phase-flow-buttons">
              {(isMaterialTask
                ? PHASES.filter((p) => p.key === 'material_design' || p.key === 'teaching_review')
                : PHASES
              ).map((phase, i) => (
                <button key={phase.key}
                  className={`phase-btn ${phase.key === item.phase ? 'active' : ''} ${!isMaterialTask && i < currentPhaseIndex ? 'past' : ''}`}
                  style={{ borderColor: phase.color }}
                  onClick={() => handlePhaseChange(phase.key)}
                  disabled={phase.key === item.phase || isLocked || isAbandoned}
                >{phase.icon} {phase.label}</button>
              ))}
            </div>
            <p className="lock-note" style={{ marginTop: 4 }}>
              流转到目标部门后，指定该部门第一个人为负责人，可在上方「负责人」下拉框中更换
            </p>
            {(isLocked || isAbandoned) && <p className="locked-hint">任务已{isLocked ? '锁定' : '废弃'}，不可流转</p>}
          </section>

          {/* 更新状态 */}
          <section className="detail-section">
            <label>操作 - 更新状态</label>
            {isMaterialTask ? (
              <div className="status-buttons">
                {MATERIAL_STATUS_OPTIONS.map((s) => (
                  <button key={s}
                    className={`status-btn ${item.materialStatus === s ? 'active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={isLocked || isAbandoned}
                  >{s}</button>
                ))}
              </div>
            ) : (
              <div className="status-buttons">
                {(['todo', 'in_progress', 'pending_review', 'approved', 'rejected'] as const).map((s) => (
                  <button key={s}
                    className={`status-btn ${item.status === s ? 'active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={isLocked || isAbandoned}
                  >{STATUS_LABELS[s]}</button>
                ))}
              </div>
            )}
            {!isLocked && !isAbandoned && !isMaterialTask && <p className="lock-note">设置"已通过"后自动锁定任务</p>}
          </section>

          {/* 延迟报告 */}
          {!isLocked && !isAbandoned && (
            <section className="detail-section">
              <label>🚨 延迟预警报告</label>
              {item.delayInfo && (
                <div className="delay-current">
                  <p><strong>当前报告:</strong> {item.delayInfo.reason}</p>
                  <p><strong>预计完成节点:</strong> {item.delayInfo.resolveNode}</p>
                  <p><strong>解决方案:</strong> {item.delayInfo.resolvePlan}</p>
                  <p className="feedback-time">报告时间: {new Date(item.delayInfo.reportedAt).toLocaleString('zh-CN')}</p>
                </div>
              )}
              <div className="delay-form">
                <textarea className="form-input" rows={2} placeholder="延迟原因（为什么完成不了？）"
                  value={delayReason} onChange={(e) => setDelayReason(e.target.value)} />
                <input className="form-input" style={{ marginTop: 6 }} placeholder="预计在什么节点完成？（如：测试阶段前）"
                  value={delayNode} onChange={(e) => setDelayNode(e.target.value)} />
                <textarea className="form-input" style={{ marginTop: 6 }} rows={2} placeholder="解决方案（怎么补救？）"
                  value={delayPlan} onChange={(e) => setDelayPlan(e.target.value)} />
                <button className="btn-primary" style={{ marginTop: 8 }}
                  onClick={handleSaveDelayReport} disabled={!delayReason.trim() || !delayNode.trim() || !delayPlan.trim()}>
                  提交延迟报告
                </button>
              </div>
            </section>
          )}

          {/* 审核反馈 */}
          <section className="detail-section">
            <label>添加审核反馈</label>
            <div className="feedback-input-group">
              <textarea value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={isLocked || isAbandoned ? '已锁定，不可操作' : '输入审核意见...'}
                rows={3} disabled={isLocked || isAbandoned} />
              {!isLocked && !isAbandoned && (
                <div className="feedback-actions">
                  <label className="feedback-pass-toggle">
                    <input type="checkbox" checked={feedbackPassed}
                      onChange={(e) => setFeedbackPassed(e.target.checked)} />
                    {feedbackPassed ? '✅ 审核通过' : '❌ 驳回'}
                  </label>
                  <button className="btn-primary" onClick={handleAddFeedback}>提交反馈</button>
                </div>
              )}
            </div>
          </section>

          <section className="detail-section">
            <label>审核记录 ({item.feedbacks.length})</label>
            <div className="feedback-list">
              {item.feedbacks.length === 0 ? (
                <p className="empty-text">暂无审核记录</p>
              ) : (
                [...item.feedbacks].reverse().map((fb) => (
                  <div key={fb.id} className="feedback-item">
                    <div className="feedback-meta">
                      <strong>{fb.from}</strong>
                      <span className={`feedback-status ${fb.passed ? 'passed' : 'rejected'}`}>
                        {fb.passed ? '✅ 通过' : '❌ 驳回'}
                      </span>
                    </div>
                    <p>{fb.comment}</p>
                    <span className="feedback-time">{new Date(fb.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="detail-section">
            <label>时间线 ({item.timeline.length} 个阶段)</label>
            <div className="timeline-list">
              {item.timeline.map((tl, i) => {
                const phaseConfig = getPhaseByKey(tl.phase)
                return (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={{ background: phaseConfig.color }} />
                    <div className="timeline-content">
                      <strong>{phaseConfig.icon} {phaseConfig.label}</strong>
                      <span className="timeline-time">
                        进入: {new Date(tl.enterTime).toLocaleString('zh-CN')}
                        {tl.exitTime && ` → 离开: ${new Date(tl.exitTime).toLocaleString('zh-CN')}`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

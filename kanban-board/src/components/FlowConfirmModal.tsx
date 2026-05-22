import { useMemo, useState } from 'react'
import { WorkItem, Phase, PHASES, PHASE_DEPARTMENT, MemberProfile } from '../types'
import { buildMembersFromProfiles } from '../data/mockData'

interface Props {
  item: WorkItem
  targetPhase: Phase
  memberProfiles: MemberProfile[]
  onConfirm: (updatedItem: WorkItem) => void
  onCancel: () => void
}

export default function FlowConfirmModal({ item, targetPhase, memberProfiles, onConfirm, onCancel }: Props) {
  const activeProfiles = useMemo(() => memberProfiles.filter((p) => p.active !== false), [memberProfiles])
  const membersMap = useMemo(() => buildMembersFromProfiles(activeProfiles), [activeProfiles])
  const targetDept = PHASE_DEPARTMENT[targetPhase]
  const targetMembers = membersMap[targetDept] ?? []
  const [selectedAssignee, setSelectedAssignee] = useState(targetMembers[0] ?? item.assignee)

  const sourcePhaseLabel = PHASES.find((p) => p.key === item.phase)?.label ?? item.phase
  const targetPhaseLabel = PHASES.find((p) => p.key === targetPhase)?.label ?? targetPhase
  const sourceDept = item.department

  const handleConfirm = () => {
    const now = new Date().toISOString()
    const updated: WorkItem = {
      ...item,
      phase: targetPhase,
      department: targetDept,
      assignee: selectedAssignee,
      status: 'todo',
      updatedAt: now,
      materialStatus: targetPhase === 'material_design' ? '设计中' : item.materialStatus,
      feedbacks: [
        ...item.feedbacks,
        {
          id: `FB-${Date.now()}`,
          from: item.assignee,
          to: selectedAssignee,
          comment: `从 ${sourcePhaseLabel} 流转至 ${targetPhaseLabel}，部门：${sourceDept} → ${targetDept}`,
          passed: true,
          createdAt: now,
        },
      ],
      timeline: [
        ...item.timeline,
        { phase: targetPhase, enterTime: now },
      ],
    }
    onConfirm(updated)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content flow-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>✕</button>
        <div className="modal-header">
          <h2>确认流转</h2>
          <span className="modal-id">{item.title}</span>
        </div>
        <div className="modal-body">
          <div className="flow-confirm-info">
            <div className="flow-confirm-row">
              <span className="flow-confirm-label">当前阶段</span>
              <span className="flow-confirm-value">{sourcePhaseLabel}</span>
              <span className="flow-confirm-arrow">→</span>
              <span className="flow-confirm-label">目标阶段</span>
              <span className="flow-confirm-value highlight">{targetPhaseLabel}</span>
            </div>
            <div className="flow-confirm-row">
              <span className="flow-confirm-label">当前部门</span>
              <span className="flow-confirm-value">{sourceDept}</span>
              <span className="flow-confirm-arrow">→</span>
              <span className="flow-confirm-label">目标部门</span>
              <span className="flow-confirm-value highlight">{targetDept}</span>
            </div>
            <div className="flow-confirm-row">
              <span className="flow-confirm-label">当前负责人</span>
              <span className="flow-confirm-value">{item.assignee}</span>
              <span className="flow-confirm-arrow">→</span>
              <span className="flow-confirm-label">新负责人</span>
              <select className="form-input flow-confirm-select"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
                {targetMembers.length > 0 ? targetMembers.map((m) => (
                  <option key={m} value={m}>{m}</option>
                )) : <option value={item.assignee}>{item.assignee}</option>}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCancel}>取消</button>
            <button className="btn-primary" onClick={handleConfirm}>确认流转</button>
          </div>
        </div>
      </div>
    </div>
  )
}

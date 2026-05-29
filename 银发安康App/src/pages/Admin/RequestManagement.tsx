import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useAppStore, CareEndRequest, CaregiverChangeRequest } from '../../store'

export const AdminRequestPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, careEndRequests, caregiverChangeRequests, updateCareEndRequest, updateCaregiverChangeRequest, updateCaregiver, caregivers, addNotification } = useAppStore()
  const [tab, setTab] = useState<'end' | 'change'>('end')

  const handleApproveEnd = (req: CareEndRequest) => {
    updateCareEndRequest(req.id, { status: 'approved', resolvedAt: new Date().toISOString() })
    const cg = caregivers.find((c) => c.id === req.caregiverId)
    if (cg) {
      updateCaregiver(req.caregiverId, { currentPatients: Math.max(0, (cg.currentPatients || 1) - 1) })
    }
    addNotification({
      id: `n_end_${Date.now()}`,
      type: 'system',
      title: '护理结束已审批',
      content: `${req.elderlyName} 的护理结束申请已通过`,
      read: false,
      time: new Date().toISOString(),
    })
  }

  const handleRejectEnd = (req: CareEndRequest) => {
    updateCareEndRequest(req.id, { status: 'rejected', resolvedAt: new Date().toISOString() })
    addNotification({
      id: `n_end_rej_${Date.now()}`,
      type: 'system',
      title: '护理结束申请未通过',
      content: `${req.elderlyName} 的护理结束申请未通过审批`,
      read: false,
      time: new Date().toISOString(),
    })
  }

  const handleApproveChange = (req: CaregiverChangeRequest) => {
    updateCaregiverChangeRequest(req.id, { status: 'approved', resolvedAt: new Date().toISOString() })
    if (req.requestedCaregiverId) {
      const oldCg = caregivers.find((c) => c.id === req.currentCaregiverId)
      const newCg = caregivers.find((c) => c.id === req.requestedCaregiverId)
      if (oldCg) {
        updateCaregiver(req.currentCaregiverId, { currentPatients: Math.max(0, (oldCg.currentPatients || 1) - 1) })
      }
      if (newCg) {
        updateCaregiver(req.requestedCaregiverId, { currentPatients: (newCg.currentPatients || 0) + 1 })
      }
    }
    addNotification({
      id: `n_change_${Date.now()}`,
      type: 'system',
      title: '更换护工已审批',
      content: `${req.elderlyName} 的更换护工申请已通过`,
      read: false,
      time: new Date().toISOString(),
    })
  }

  const handleRejectChange = (req: CaregiverChangeRequest) => {
    updateCaregiverChangeRequest(req.id, { status: 'rejected', resolvedAt: new Date().toISOString() })
    addNotification({
      id: `n_change_rej_${Date.now()}`,
      type: 'system',
      title: '更换护工未通过',
      content: `${req.elderlyName} 的更换护工申请未通过审批`,
      read: false,
      time: new Date().toISOString(),
    })
  }

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '8px 0' }}>‹ 返回</button>
      <div className="page-header">
        <h1 className="page-title">📋 审批管理</h1>
        <p className="page-subtitle">管理员 · 处理护理结束/更换护工申请</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button variant={tab === 'end' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('end')}>
          结束护理 ({careEndRequests.filter((r) => r.status === 'pending').length})
        </Button>
        <Button variant={tab === 'change' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('change')}>
          更换护工 ({caregiverChangeRequests.filter((r) => r.status === 'pending').length})
        </Button>
      </div>

      {tab === 'end' && (
        careEndRequests.length === 0 ? (
          <Card><div className="empty-state" style={{ padding: 20 }}>暂无护理结束申请</div></Card>
        ) : (
          careEndRequests.map((req) => (
            <Card key={req.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>护工：{req.caregiverName}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>护理对象：{req.elderlyName}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>原因：{req.reason}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>申请时间：{new Date(req.createdAt).toLocaleString()}</div>
                </div>
                <span style={{
                  fontSize: 12, padding: '2px 10px', borderRadius: 10, fontWeight: 600,
                  background: req.status === 'pending' ? '#FFF8E1' : req.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                  color: req.status === 'pending' ? '#F57F17' : req.status === 'approved' ? '#2E7D32' : '#C62828',
                }}>
                  {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                </span>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button variant="primary" size="sm" onClick={() => handleApproveEnd(req)}>✅ 同意</Button>
                  <Button variant="danger" size="sm" onClick={() => handleRejectEnd(req)}>❌ 拒绝</Button>
                </div>
              )}
            </Card>
          ))
        )
      )}

      {tab === 'change' && (
        caregiverChangeRequests.length === 0 ? (
          <Card><div className="empty-state" style={{ padding: 20 }}>暂无更换护工申请</div></Card>
        ) : (
          caregiverChangeRequests.map((req) => (
            <Card key={req.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>申请老人：{req.elderlyName}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>当前护工：{req.currentCaregiverName}</div>
                  {req.requestedCaregiverName && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>期望护工：{req.requestedCaregiverName}</div>
                  )}
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>原因：{req.reason}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>申请时间：{new Date(req.createdAt).toLocaleString()}</div>
                </div>
                <span style={{
                  fontSize: 12, padding: '2px 10px', borderRadius: 10, fontWeight: 600,
                  background: req.status === 'pending' ? '#FFF8E1' : req.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                  color: req.status === 'pending' ? '#F57F17' : req.status === 'approved' ? '#2E7D32' : '#C62828',
                }}>
                  {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                </span>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button variant="primary" size="sm" onClick={() => handleApproveChange(req)}>✅ 同意更换</Button>
                  <Button variant="danger" size="sm" onClick={() => handleRejectChange(req)}>❌ 拒绝</Button>
                </div>
              )}
            </Card>
          ))
        )
      )}
    </div>
  )
}

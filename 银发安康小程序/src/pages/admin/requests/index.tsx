import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore, CareEndRequest, CaregiverChangeRequest } from '../../../store'

export default function AdminRequestPage() {
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
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>📋 审批管理</Text>
        <Text className='page-subtitle'>管理员 · 处理护理结束/更换护工申请</Text>
      </View>

      <View style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <View onClick={() => setTab('end')} style={{
          padding: '8px 12px', fontSize: '14px',
          fontWeight: 600, borderRadius: '8px', minHeight: 36,
          background: tab === 'end' ? '#2E7D32' : '#FFFFFF',
          color: tab === 'end' ? 'white' : '#2E7D32',
          border: tab === 'end' ? 'none' : '2px solid #2E7D32',
          display: 'flex', alignItems: 'center',
        }}>
          <Text>结束护理 ({careEndRequests.filter((r) => r.status === 'pending').length})</Text>
        </View>
        <View onClick={() => setTab('change')} style={{
          padding: '8px 12px', fontSize: '14px',
          fontWeight: 600, borderRadius: '8px', minHeight: 36,
          background: tab === 'change' ? '#2E7D32' : '#FFFFFF',
          color: tab === 'change' ? 'white' : '#2E7D32',
          border: tab === 'change' ? 'none' : '2px solid #2E7D32',
          display: 'flex', alignItems: 'center',
        }}>
          <Text>更换护工 ({caregiverChangeRequests.filter((r) => r.status === 'pending').length})</Text>
        </View>
      </View>

      {tab === 'end' && (
        careEndRequests.length === 0 ? (
          <View className='card'><View className='empty-state' style={{ padding: 20 }}><Text>暂无护理结束申请</Text></View></View>
        ) : (
          careEndRequests.map((req) => (
            <View className='card' key={req.id}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>护工：{req.caregiverName}</Text>
                  <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, display: 'block' }}>护理对象：{req.elderlyName}</Text>
                  <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>原因：{req.reason}</Text>
                </View>
                <Text style={{
                  fontSize: 12, padding: '2px 10px', borderRadius: 10, fontWeight: 600,
                  background: req.status === 'pending' ? '#FFF8E1' : req.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                  color: req.status === 'pending' ? '#F57F17' : req.status === 'approved' ? '#2E7D32' : '#C62828',
                }}>
                  {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                </Text>
              </View>
              {req.status === 'pending' && (
                <View style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <View onClick={() => handleApproveEnd(req)} style={{ padding: '8px 12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                    <Text>✅ 同意</Text>
                  </View>
                  <View onClick={() => handleRejectEnd(req)} style={{ padding: '8px 12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', background: '#D32F2F', color: 'white', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                    <Text>❌ 拒绝</Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )
      )}

      {tab === 'change' && (
        caregiverChangeRequests.length === 0 ? (
          <View className='card'><View className='empty-state' style={{ padding: 20 }}><Text>暂无更换护工申请</Text></View></View>
        ) : (
          caregiverChangeRequests.map((req) => (
            <View className='card' key={req.id}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>申请老人：{req.elderlyName}</Text>
                  <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, display: 'block' }}>当前护工：{req.currentCaregiverName}</Text>
                  {req.requestedCaregiverName && (
                    <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>期望护工：{req.requestedCaregiverName}</Text>
                  )}
                  <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>原因：{req.reason}</Text>
                </View>
                <Text style={{
                  fontSize: 12, padding: '2px 10px', borderRadius: 10, fontWeight: 600,
                  background: req.status === 'pending' ? '#FFF8E1' : req.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                  color: req.status === 'pending' ? '#F57F17' : req.status === 'approved' ? '#2E7D32' : '#C62828',
                }}>
                  {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : '已拒绝'}
                </Text>
              </View>
              {req.status === 'pending' && (
                <View style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <View onClick={() => handleApproveChange(req)} style={{ padding: '8px 12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                    <Text>✅ 同意更换</Text>
                  </View>
                  <View onClick={() => handleRejectChange(req)} style={{ padding: '8px 12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', background: '#D32F2F', color: 'white', minHeight: 36, display: 'flex', alignItems: 'center' }}>
                    <Text>❌ 拒绝</Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )
      )}
    </View>
  )
}

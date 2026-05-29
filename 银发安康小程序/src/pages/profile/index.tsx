import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore, Permissions } from '../../store'
import { mockElderly } from '../../utils/mockData'

export default function ProfilePage() {
  const { user, logout } = useAppStore()
  const [showBind, setShowBind] = useState(false)
  const [bindMode, setBindMode] = useState<'code' | 'phone'>('code')
  const [bindCode, setBindCode] = useState('')
  const [bindPhone, setBindPhone] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)

  const elderlyList = mockElderly

  const handleLogout = () => {
    logout()
    Taro.redirectTo({ url: '/pages/login/index' })
  }

  const isFamily = Permissions.isFamily(user?.role)
  const isCaregiver = Permissions.isCaregiver(user?.role)
  const isAdmin = Permissions.isAdmin(user?.role)

  const menuSections = [
    ...(isFamily ? [{
      title: '👨‍👩‍👧‍👦 家人看护',
      items: [
        { icon: '👨‍👩‍👧‍👦', label: '家人管理', desc: '绑定/解绑家人', onClick: () => setShowBind(!showBind), path: '' },
        { icon: '📋', label: '健康档案', desc: '查看老人健康档案', path: '/pages/healthRecords/index', onClick: undefined },
        { icon: '📋', label: '护理记录', desc: '查看历史护理记录', path: '/pages/careTracking/index', onClick: undefined },
        { icon: '💬', label: '留言评价', desc: '对服务留言、评价', path: '/pages/messages/index', onClick: undefined },
        { icon: '🔄', label: '申请更换护工', desc: '申请更换当前护工', path: '', onClick: () => {
          useAppStore.getState().addCaregiverChangeRequest({
            id: `change_${Date.now()}`, elderlyId: 'e1', elderlyName: '张秀英',
            currentCaregiverId: 'c1', currentCaregiverName: '王芳',
            reason: '家属申请更换护工', status: 'pending', createdAt: new Date().toISOString(),
          })
          Taro.showToast({ title: '✅ 已提交更换护工申请，等待管理员审批', icon: 'none' })
        }},
        { icon: '⭐', label: '服务评价', desc: '管理服务评价', path: '/pages/reviews/index', onClick: undefined },
      ],
    }] : []),
    ...(isCaregiver ? [{
      title: '👩‍⚕️ 护工工作台',
      items: [
        { icon: '📋', label: '护理记录', desc: '新增/编辑护理记录', path: '/pages/careTracking/index', onClick: undefined },
        { icon: '💬', label: '消息沟通', desc: '回复家属留言、发送消息', path: '/pages/messages/index', onClick: undefined },
        { icon: '👤', label: '我的档案', desc: '查看护工个人信息', path: user?.caregiverId ? `/pages/caregiverDetail/index?id=${user.caregiverId}` : '', onClick: undefined },
        { icon: '📋', label: '申请结束护理', desc: '申请结束当前护理服务', path: '', onClick: () => {
          useAppStore.getState().addCareEndRequest({
            id: `end_${Date.now()}`, caregiverId: user?.caregiverId || '',
            caregiverName: user?.name || '', elderlyId: 'e1', elderlyName: '张秀英',
            reason: '护工主动申请结束护理', status: 'pending', createdAt: new Date().toISOString(),
          })
          Taro.showToast({ title: '✅ 已提交护理结束申请，等待管理员审批', icon: 'none' })
        }},
        { icon: '⭐', label: '服务评价', desc: '查看我的评价', path: '/pages/reviews/index', onClick: undefined },
      ],
    }] : []),
    ...(isAdmin ? [{
      title: '⚙️ 管理后台',
      items: [
        { icon: '👨‍⚕️', label: '护工管理', desc: '管理护工档案、审核资质、添加/编辑护工', path: '/pages/admin/caregivers/index', onClick: undefined },
        { icon: '📋', label: '审批管理', desc: '处理护理结束/更换护工申请', path: '/pages/admin/requests/index', onClick: undefined },
        { icon: '📊', label: '数据统计', desc: '查看平台运营数据', path: '', onClick: undefined },
      ],
    }] : []),
    {
      title: '系统设置',
      items: [
        { icon: '🔔', label: '消息通知', desc: '推送通知、提醒设置', path: '/pages/settings/index', onClick: undefined },
        { icon: '🔒', label: '账号安全', desc: '修改密码、设备管理', path: '', onClick: undefined },
        { icon: '📱', label: '登录设备', desc: '查看和管理登录设备', path: '', onClick: undefined },
      ],
    },
    {
      title: '其他',
      items: [
        { icon: '❓', label: '使用帮助', desc: '常见问题、操作指南', path: '', onClick: undefined },
        { icon: '📞', label: '联系客服', desc: '400-888-8888', path: '', onClick: undefined },
        { icon: '📝', label: '意见反馈', desc: '帮助我们做得更好', path: '', onClick: undefined },
        { icon: 'ℹ️', label: '关于银发安康', desc: 'v1.0.0', path: '', onClick: undefined },
      ],
    },
  ]

  return (
    <View className='page' style={{ paddingBottom: 80 }}>
      <View style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%)',
        margin: '0 -24px', padding: '24px 24px 28px', color: 'white',
        borderRadius: '0 0 28px 28px',
      }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>
            <Text>{user?.name?.charAt(0) || '用'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{user?.name || '用户'}</Text>
              <Text className='tag' style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, padding: '2px 10px' }}>
                {user?.role === 'admin' ? '管理员' : user?.role === 'family' ? '家属' : user?.role === 'caregiver' ? '护工' : '用户'}
              </Text>
              {user?.caregiverLevel && (
                <Text style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                  {user.caregiverLevel}
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 13, opacity: 0.8, marginTop: 4, color: 'white' }}>{user?.phone}</Text>
          </View>
        </View>
      </View>

      <View className='card' style={{ marginTop: 16 }}>
        <Text className='card-title'>我的家人</Text>
        {elderlyList.length === 0 ? (
          <View style={{ textAlign: 'center', padding: 16, color: '#9E9E9E' }}>
            <Text style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>👨‍👩‍👧‍👦</Text>
            <Text>暂未绑定家人</Text>
          </View>
        ) : (
          elderlyList.map((elderly) => (
            <View key={elderly.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #E0E0E0' }}>
              <View style={{ width: 44, height: 44, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
                <Text>{elderly.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>
                  {elderly.name}
                  <Text className='tag tag-warning' style={{ fontSize: 10, padding: '1px 6px', marginLeft: 6 }}>{elderly.careLevel}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>{elderly.relation} · {elderly.age}岁 · {elderly.address}</Text>
              </View>
              <Text className='tag tag-primary' style={{ fontSize: 11 }}>已绑定</Text>
            </View>
          ))
        )}
        <View onClick={() => setShowBind(!showBind)} style={{ marginTop: 12, padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', textAlign: 'center' }}>
          <Text>+ 绑定家人</Text>
        </View>
      </View>

      {showBind && (
        <View className='card'>
          <Text className='card-title'>绑定家人</Text>
          <View style={{ display: 'flex', gap: 6, marginBottom: 12, background: '#F5F5F5', borderRadius: 8, padding: 3 }}>
            <View onClick={() => setBindMode('code')} style={{ flex: 1, padding: '7px 12px', borderRadius: 6, background: bindMode === 'code' ? '#2E7D32' : 'transparent', color: bindMode === 'code' ? 'white' : '#616161', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>
              <Text>绑定码</Text>
            </View>
            <View onClick={() => setBindMode('phone')} style={{ flex: 1, padding: '7px 12px', borderRadius: 6, background: bindMode === 'phone' ? '#2E7D32' : 'transparent', color: bindMode === 'phone' ? 'white' : '#616161', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>
              <Text>手机号</Text>
            </View>
          </View>
          {bindMode === 'code' ? (
            <>
              <Text style={{ fontSize: 13, color: '#616161', marginBottom: 8, display: 'block' }}>请输入老人或家属提供的6位绑定码</Text>
              <Input placeholder='输入绑定码' value={bindCode} onInput={(e) => setBindCode(e.detail.value)} maxlength={6} style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48, boxSizing: 'border-box' }} />
              <View style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <View style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
                  <Text>确认绑定</Text>
                </View>
                <View onClick={() => setShowBind(false)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 36 }}>
                  <Text>取消</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 13, color: '#616161', marginBottom: 8, display: 'block' }}>输入老人的手机号发起绑定申请</Text>
              <Input placeholder='输入老人手机号' type='number' value={bindPhone} onInput={(e) => setBindPhone(e.detail.value)} maxlength={11} style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48, boxSizing: 'border-box' }} />
              <View style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <View style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
                  <Text>发送申请</Text>
                </View>
                <View onClick={() => setShowBind(false)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 36 }}>
                  <Text>取消</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {menuSections.map((section) => (
        <View key={section.title} style={{ marginTop: 12 }}>
          <Text className='section-title'>{section.title}</Text>
          {section.items.map((item, idx) => (
            <View className='card' key={idx} onClick={() => { if (item.path) Taro.navigateTo({ url: item.path }); else if (item.onClick) item.onClick(); }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: 500, display: 'block' }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{item.desc}</Text>
                </View>
                <Text style={{ fontSize: 16, color: '#9E9E9E' }}>›</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={{ padding: '24px 0' }}>
        <View onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 32px', fontSize: '20px',
          fontWeight: 600, borderRadius: '8px',
          background: '#D32F2F', color: 'white', minHeight: 56,
        }}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { Input } from '../../components/common/Input'
import { useAppStore, Permissions } from '../../store'
import { mockElderly } from '../../utils/mockData'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAppStore()
  const [showBind, setShowBind] = useState(false)
  const [bindMode, setBindMode] = useState<'code' | 'phone'>('code')
  const [bindCode, setBindCode] = useState('')
  const [bindPhone, setBindPhone] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)

  const elderlyList = mockElderly

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isFamily = Permissions.isFamily(user?.role)
  const isCaregiver = Permissions.isCaregiver(user?.role)
  const isAdmin = Permissions.isAdmin(user?.role)

  const menuSections = [
    ...(isFamily ? [{
      title: '👨‍👩‍👧‍👦 家人看护',
      items: [
        { icon: '👨‍👩‍👧‍👦', label: '家人管理', desc: '绑定/解绑家人', onClick: () => setShowBind(!showBind), path: '' },
        { icon: '📋', label: '健康档案', desc: '查看老人健康档案', path: '/health-records', onClick: undefined },
        { icon: '📋', label: '护理记录', desc: '查看历史护理记录', path: '/care-tracking', onClick: undefined },
        { icon: '💬', label: '留言评价', desc: '对服务留言、评价', path: '/messages', onClick: undefined },
        { icon: '🔄', label: '申请更换护工', desc: '申请更换当前护工', path: '', onClick: () => {
          useAppStore.getState().addCaregiverChangeRequest({
            id: `change_${Date.now()}`, elderlyId: 'e1', elderlyName: '张秀英',
            currentCaregiverId: 'c1', currentCaregiverName: '王芳',
            reason: '家属申请更换护工', status: 'pending', createdAt: new Date().toISOString(),
          })
          alert('✅ 已提交更换护工申请，等待管理员审批')
        }},
        { icon: '⭐', label: '服务评价', desc: '管理服务评价', path: '/reviews', onClick: undefined },
      ],
    }] : []),
    ...(isCaregiver ? [{
      title: '👩‍⚕️ 护工工作台',
      items: [
        { icon: '📋', label: '护理记录', desc: '新增/编辑护理记录', path: '/care-tracking', onClick: undefined },
        { icon: '💬', label: '消息沟通', desc: '回复家属留言、发送消息', path: '/messages', onClick: undefined },
        { icon: '👤', label: '我的档案', desc: '查看护工个人信息', path: user?.caregiverId ? `/caregivers/${user.caregiverId}` : '', onClick: undefined },
        { icon: '📋', label: '申请结束护理', desc: '申请结束当前护理服务', path: '', onClick: () => {
          useAppStore.getState().addCareEndRequest({
            id: `end_${Date.now()}`, caregiverId: user?.caregiverId || '',
            caregiverName: user?.name || '', elderlyId: 'e1', elderlyName: '张秀英',
            reason: '护工主动申请结束护理', status: 'pending', createdAt: new Date().toISOString(),
          })
          alert('✅ 已提交护理结束申请，等待管理员审批')
        }},
        { icon: '⭐', label: '服务评价', desc: '查看我的评价', path: '/reviews', onClick: undefined },
      ],
    }] : []),
    ...(isAdmin ? [{
      title: '⚙️ 管理后台',
      items: [
        { icon: '👨‍⚕️', label: '护工管理', desc: '管理护工档案、审核资质、添加/编辑护工', path: '/admin/caregivers', onClick: undefined },
        { icon: '📋', label: '审批管理', desc: '处理护理结束/更换护工申请', path: '/admin/requests', onClick: undefined },
        { icon: '📊', label: '数据统计', desc: '查看平台运营数据', path: '', onClick: undefined },
      ],
    }] : []),
    {
      title: '系统设置',
      items: [
        { icon: '🔔', label: '消息通知', desc: '推送通知、提醒设置', path: '/settings', onClick: undefined },
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
    <div className="page" style={{ paddingBottom: 80 }}>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%)',
        margin: '0 -24px', padding: '24px 24px 28px', color: 'white',
        borderRadius: '0 0 28px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={user?.name || '用户'} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name || '用户'}</h2>
              <span className="tag" style={{
                background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11,
                padding: '2px 10px',
              }}>
                {user?.role === 'admin' ? '管理员' : user?.role === 'family' ? '家属' : user?.role === 'caregiver' ? '护工' : '用户'}
              </span>
              {user?.caregiverLevel && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.25)', color: 'white',
                }}>
                  {user.caregiverLevel}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{user?.phone}</p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>{user?.address || '北京市海淀区'}</p>
          </div>
          <button onClick={() => setEditingProfile(!editingProfile)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            ✏️ 编辑
          </button>
        </div>
        {editingProfile && (
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
            <Input label="姓名" defaultValue={user?.name} />
            <Input label="手机号" defaultValue={user?.phone} />
            <Input label="地址" defaultValue={user?.address} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button variant="primary" size="sm" onClick={() => setEditingProfile(false)}>💾 保存</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingProfile(false)}>取消</Button>
            </div>
          </div>
        )}
      </div>

      {/* Family Management */}
      <Card title="我的家人" style={{ marginTop: 16 }}>
        {elderlyList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-light)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍👩‍👧‍👦</div>
            <div>暂未绑定家人</div>
          </div>
        ) : (
          elderlyList.map((elderly) => (
            <div key={elderly.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <Avatar name={elderly.name} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {elderly.name}
                  <span className="tag tag-warning" style={{ fontSize: 10, padding: '1px 6px', marginLeft: 6 }}>
                    {elderly.careLevel}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {elderly.relation} · {elderly.age}岁 · {elderly.address}
                </div>
              </div>
              <span className="tag tag-primary" style={{ fontSize: 11 }}>已绑定</span>
              <button style={{ color: 'var(--color-danger)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>解绑</button>
            </div>
          ))
        )}
        <Button variant="secondary" size="sm" block onClick={() => setShowBind(!showBind)} style={{ marginTop: 12 }}>
          + 绑定家人
        </Button>
      </Card>

      {/* Bind Form */}
      {showBind && (
        <Card>
          <div className="card-title">绑定家人</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: 'var(--color-bg)', borderRadius: 8, padding: 3 }}>
            <button onClick={() => setBindMode('code')} style={bindTabStyle(bindMode === 'code')}>绑定码</button>
            <button onClick={() => setBindMode('phone')} style={bindTabStyle(bindMode === 'phone')}>手机号</button>
          </div>
          {bindMode === 'code' ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                请输入老人或家属提供的6位绑定码
              </p>
              <Input placeholder="输入绑定码" value={bindCode} onChange={(e) => setBindCode(e.target.value)} maxLength={6} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button variant="primary" size="sm">确认绑定</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowBind(false)}>取消</Button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                输入老人的手机号发起绑定申请
              </p>
              <Input placeholder="输入老人手机号" type="tel" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} maxLength={11} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button variant="primary" size="sm">发送申请</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowBind(false)}>取消</Button>
              </div>
            </>
          )}
          <div style={{ marginTop: 12, padding: 12, background: '#E3F2FD', borderRadius: 8, fontSize: 13, color: 'var(--color-info)' }}>
            💡 绑定后可查看老人的健康档案、护理记录，并进行留言评价和监督服务
          </div>
        </Card>
      )}

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title} style={{ marginTop: 12 }}>
          <h3 className="section-title">{section.title}</h3>
          {section.items.map((item, idx) => (
            <Card key={idx} onClick={() => { if (item.path) navigate(item.path); else if (item.onClick) item.onClick(); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: 16, color: 'var(--color-text-light)' }}>›</span>
              </div>
            </Card>
          ))}
        </div>
      ))}

      {/* Logout */}
      <div style={{ padding: '24px 0' }}>
        <Button variant="danger" size="lg" block onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  )
}

const bindTabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
  background: active ? 'var(--color-primary)' : 'transparent',
  color: active ? 'white' : 'var(--color-text-secondary)',
  fontWeight: 500, fontSize: 13,
})

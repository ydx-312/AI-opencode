import { useState, useEffect } from 'react'
import { View, Text, Image, Input, Textarea, Switch, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore, Permissions, Caregiver } from '../../../store'

export default function AdminCaregiverPage() {
  const { user } = useAppStore()
  const isAdmin = Permissions.isAdmin(user?.role)

  if (!isAdmin) {
    return (
      <View className='page'>
        <View className='empty-state'>
          <Text className='empty-state-icon'>🔒</Text>
          <Text className='empty-state-text' style={{ fontSize: 18, marginTop: 12 }}>无管理员权限</Text>
          <Text style={{ fontSize: 14, color: '#616161', marginTop: 8, display: 'block' }}>请联系平台管理员获取访问权限</Text>
        </View>
      </View>
    )
  }

  return <AdminCaregiverConsole />
}

const AdminCaregiverConsole: React.FC = () => {
  const storeCaregivers = useAppStore((s) => s.caregivers)
  const setStoreCaregivers = useAppStore((s) => s.setCaregivers)
  const caregiverEditLogs = useAppStore((s) => s.caregiverEditLogs)
  const addCaregiverEditLog = useAppStore((s) => s.addCaregiverEditLog)
  const storeUser = useAppStore((s) => s.user)

  const [caregivers, setCaregivers] = useState<Caregiver[]>(storeCaregivers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogFor, setShowLogFor] = useState<string | null>(null)

  useEffect(() => { setStoreCaregivers(caregivers) }, [caregivers, setStoreCaregivers])

  const filtered = caregivers.filter((c) =>
    c.name.includes(searchTerm) || c.phone?.includes(searchTerm) || c.serviceArea?.includes(searchTerm)
  )

  const [form, setForm] = useState<Partial<Caregiver>>({
    name: '', age: 40, gender: '女', yearsOfExp: 3, level: '初级护工', price: 35,
    phone: '', serviceArea: '', skills: [], certs: [], tags: [],
    introduction: '', available: true, locked: false, photos: [],
  })

  const handleDelete = (id: string) => {
    Taro.showModal({ title: '确认删除', content: '确定要删除该护工吗？', success: (res) => {
      if (res.confirm) setCaregivers(caregivers.filter((c) => c.id !== id))
    }})
  }

  const handleToggleAvailable = (id: string) => {
    setCaregivers(caregivers.map((c) => c.id === id ? { ...c, available: !c.available } : c))
  }

  const editingCg = editingId ? caregivers.find((c) => c.id === editingId) : null

  if (editingCg) {
    const cg = editingCg
    const update = (patch: Partial<Caregiver>) => {
      setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, ...patch } : c))
    }
    return <EditCaregiverView cg={cg} update={update} onBack={() => setEditingId(null)} onSave={() => {
      addCaregiverEditLog({
        id: `editlog_${Date.now()}`,
        caregiverId: cg.id,
        caregiverName: cg.name,
        editorId: storeUser?.id || '',
        editorName: storeUser?.name || '管理员',
        changes: { level: cg.level, available: cg.available, price: cg.price, maxPatients: cg.maxPatients, phone: cg.phone, serviceArea: cg.serviceArea },
        timestamp: new Date().toISOString(),
      })
      setEditingId(null)
    }} caregivers={caregivers} />
  }

  if (showAddForm) {
    return (
      <View className='page'>
        <View onClick={() => setShowAddForm(false)} style={{ fontSize: 22, padding: '8px 0' }}><Text>‹ 返回</Text></View>
        <View className='page-header'><Text className='page-title'>新增护工</Text></View>

        <View className='card'>
          <Text className='card-title'>基本信息</Text>
          <View className='form-group'>
            <Text className='form-label'>姓名</Text>
            <Input className='form-input' value={form.name || ''} onInput={(e) => setForm({ ...form, name: e.detail.value })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>性别</Text>
            <View style={{ display: 'flex', gap: 8 }}>
              {['女', '男'].map((g) => (
                <View key={g} onClick={() => setForm({ ...form, gender: g })} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, textAlign: 'center',
                  background: form.gender === g ? '#2E7D32' : '#F5F5F5',
                  color: form.gender === g ? 'white' : '#616161',
                  fontWeight: 500, fontSize: 14,
                }}>
                  <Text>{g}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className='form-group'>
            <Text className='form-label'>年龄</Text>
            <Input type='number' className='form-input' value={form.age} onInput={(e) => setForm({ ...form, age: Number(e.detail.value) })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>从业年限</Text>
            <Input type='number' className='form-input' value={form.yearsOfExp} onInput={(e) => setForm({ ...form, yearsOfExp: Number(e.detail.value) })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>护工等级</Text>
            <Picker mode='selector' range={['初级护工', '中级护工', '高级护工']} value={form.level === '中级护工' ? 1 : form.level === '高级护工' ? 2 : 0} onChange={(e) => setForm({ ...form, level: ['初级护工', '中级护工', '高级护工'][e.detail.value] as any })}>
              <View className='form-input'>{form.level || '初级护工'}</View>
            </Picker>
          </View>
          <View className='form-group'>
            <Text className='form-label'>服务价格(元/小时)</Text>
            <Input type='number' className='form-input' value={form.price} onInput={(e) => setForm({ ...form, price: Number(e.detail.value) })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>手机号</Text>
            <Input className='form-input' value={form.phone || ''} onInput={(e) => setForm({ ...form, phone: e.detail.value })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>服务区域</Text>
            <Input className='form-input' value={form.serviceArea || ''} onInput={(e) => setForm({ ...form, serviceArea: e.detail.value })} />
          </View>
          <View className='form-group'>
            <Text className='form-label'>个人介绍</Text>
            <Textarea className='form-input' value={form.introduction || ''} onInput={(e) => setForm({ ...form, introduction: e.detail.value })} style={{ minHeight: 80 }} />
          </View>
        </View>

        <View className='card'>
          <Text className='card-title'>初始资质证书</Text>
          {['养老护理证', '健康管理师', '营养师', '康复治疗师', '急救证'].map((cert) => (
            <Text key={cert} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <Switch checked={form.certs?.includes(cert) || false} onChange={() => setForm({
                ...form,
                certs: form.certs?.includes(cert) ? form.certs.filter((c) => c !== cert) : [...(form.certs || []), cert],
              })} color='#2E7D32' />
              <Text style={{ fontSize: 14 }}>{cert}</Text>
            </Text>
          ))}
        </View>

        <View style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <View onClick={() => {
            const newCg: Caregiver = {
              ...form as Caregiver,
              id: `cg_new_${Date.now()}`,
              rating: 0, serviceCount: 0, completionRate: 0,
              photos: [],
              certifications: [],
              avatar: '',
            }
            setCaregivers([newCg, ...caregivers])
            setShowAddForm(false)
          }} style={{ flex: 1, padding: '16px 32px', background: '#2E7D32', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>✅ 创建护工</Text>
          </View>
          <View onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '16px 32px', border: '2px solid #2E7D32', color: '#2E7D32', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>取消</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>⚙️ 护工管理后台</Text>
        <Text className='page-subtitle'>管理员 · 管理护工档案、审核资质</Text>
      </View>

      <View className='card'>
        <View style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input className='form-input' placeholder='搜索护工姓名/手机号/区域...' value={searchTerm} onInput={(e) => setSearchTerm(e.detail.value)} style={{ flex: 1, minHeight: 44, fontSize: 14 }} />
          <View onClick={() => setShowAddForm(true)} style={{ padding: '12px 24px', background: '#2E7D32', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '18px', minHeight: 48, display: 'flex', alignItems: 'center' }}>
            <Text>+ 新增护工</Text>
          </View>
        </View>
      </View>

      <View className='card'>
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
          <View><Text style={{ fontSize: 24, fontWeight: 700, color: '#2E7D32', display: 'block' }}>{caregivers.length}</Text><Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>总护工</Text></View>
          <View><Text style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50', display: 'block' }}>{caregivers.filter((c) => c.available).length}</Text><Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>可接单</Text></View>
          <View><Text style={{ fontSize: 24, fontWeight: 700, color: '#FF9800', display: 'block' }}>{caregivers.reduce((s, c) => s + c.serviceCount, 0)}</Text><Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>总服务</Text></View>
          <View><Text style={{ fontSize: 24, fontWeight: 700, color: '#2196F3', display: 'block' }}>{(caregivers.reduce((s, c) => s + c.rating, 0) / Math.max(caregivers.length, 1)).toFixed(1)}</Text><Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>平均评分</Text></View>
        </View>
        <View style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }}>
            高级: {caregivers.filter((c) => c.level === '高级护工').length}
          </Text>
          <Text style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFF3E0', color: '#E65100', fontWeight: 600 }}>
            中级: {caregivers.filter((c) => c.level === '中级护工').length}
          </Text>
          <Text style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#E3F2FD', color: '#1565C0', fontWeight: 600 }}>
            初级: {caregivers.filter((c) => c.level === '初级护工').length}
          </Text>
        </View>
        <View style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFF8E1', color: '#F57F17', fontWeight: 600 }}>📅 请假: {caregivers.filter((c) => c.onLeave).length}人</Text>
          <Text style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFEBEE', color: '#C62828', fontWeight: 600 }}>⚡ 满员: {caregivers.filter((c) => (c.currentPatients || 0) >= (c.maxPatients || 5)).length}人</Text>
        </View>
      </View>

      {filtered.map((cg) => (
        <View className='card' key={cg.id}>
          <View style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 52, height: 52, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>
              <Text>{cg.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>{cg.name}</Text>
                <Text className={`tag ${cg.available ? 'tag-primary' : 'tag-danger'}`} style={{ fontSize: 10 }}>
                  {cg.locked ? '🔒 已锁定' : (cg.available ? '可接单' : '休息中')}
                </Text>
                {cg.onLeave && <Text className='tag tag-warning' style={{ fontSize: 10, background: '#FFF8E1', color: '#F57F17' }}>📅 请假中</Text>}
                {(cg.currentPatients || 0) >= (cg.maxPatients || 5) && <Text className='tag tag-danger' style={{ fontSize: 10 }}>满员</Text>}
                <Text style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10,
                  background: cg.level === '高级护工' ? '#E8F5E9' : cg.level === '中级护工' ? '#FFF3E0' : '#E3F2FD',
                  color: cg.level === '高级护工' ? '#1B5E20' : cg.level === '中级护工' ? '#E65100' : '#1565C0',
                }}>{cg.level || '未定级'}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#9E9E9E', marginTop: 1, display: 'block' }}>
                {cg.gender} · {cg.age}岁 · {cg.yearsOfExp}年
              </Text>
              <Text style={{ fontSize: 12, color: '#616161', marginTop: 1, display: 'block' }}>
                {cg.serviceArea} · ¥{cg.price}/h · ⭐{cg.rating} · {cg.serviceCount}单 · 📱{cg.phone}
              </Text>
              <View style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {(cg.skills || []).slice(0, 3).map((s) => (
                  <Text key={s} className='tag tag-info' style={{ fontSize: 10, padding: '1px 6px' }}>{s}</Text>
                ))}
              </View>
            </View>
            <View style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <View onClick={() => { setEditingId(cg.id) }} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #2E7D32', borderRadius: 6, color: '#2E7D32' }}>
                <Text>✏️ 编辑</Text>
              </View>
              <View onClick={() => handleToggleAvailable(cg.id)} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #2E7D32', borderRadius: 6, color: '#2E7D32' }}>
                <Text>{cg.available ? '设为休息' : '设为可接'}</Text>
              </View>
              <View onClick={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, locked: !c.locked } : c))} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #2E7D32', borderRadius: 6, color: '#2E7D32', background: cg.locked ? '#FFF3E0' : 'transparent' }}>
                <Text>{cg.locked ? '🔒 解锁' : '🔓 锁定'}</Text>
              </View>
              <View onClick={() => setShowLogFor(showLogFor === cg.id ? null : cg.id)} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #2E7D32', borderRadius: 6, color: '#2E7D32' }}>
                <Text>{showLogFor === cg.id ? '收起记录' : '📋 记录'}</Text>
              </View>
              <View onClick={() => handleDelete(cg.id)} style={{ padding: '4px 10px', fontSize: 12, background: '#D32F2F', borderRadius: 6, color: 'white' }}>
                <Text>🗑️ 删除</Text>
              </View>
            </View>
          </View>
          {showLogFor === cg.id && (() => {
            const logs = caregiverEditLogs.filter((l) => l.caregiverId === cg.id)
            return (
              <View style={{ marginTop: 8, padding: 8, background: '#F5F5F5', borderRadius: 8, fontSize: 12 }}>
                <Text style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>修改记录</Text>
                {logs.length === 0 ? (
                  <Text style={{ color: '#9E9E9E', display: 'block' }}>暂无修改记录</Text>
                ) : (
                  logs.map((log) => (
                    <View key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #E0E0E0', fontSize: 11 }}>
                      <Text style={{ color: '#9E9E9E', display: 'block' }}>{new Date(log.timestamp).toLocaleString()} - {log.editorName}</Text>
                      <Text style={{ color: '#616161', marginTop: 2, display: 'block' }}>
                        {Object.entries(log.changes).filter(([k]) => !['id', 'name', 'avatar', 'photos'].includes(k)).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )
          })()}
        </View>
      ))}
    </View>
  )
}

const EditCaregiverView: React.FC<{
  cg: Caregiver
  update: (patch: Partial<Caregiver>) => void
  onBack: () => void
  onSave: () => void
  caregivers: Caregiver[]
}> = ({ cg, update, onBack, onSave, caregivers }) => {
  const addSkill = () => {
    Taro.showModal({ title: '添加技能', content: '', editable: true, placeholderText: '输入技能名称' }).then((res) => {
      if (res.confirm && res.content) {
        update({ skills: [...(cg.skills || []), res.content] })
      }
    })
  }

  return (
    <View className='page'>
      <View onClick={onBack} style={{ fontSize: 22, padding: '8px 0' }}><Text>‹ 返回</Text></View>
      <View className='page-header'><Text className='page-title'>编辑护工 - {cg.name}</Text></View>

      <View className='card'>
        <Text className='card-title'>基本信息</Text>
        <View className='form-group'>
          <Text className='form-label'>姓名</Text>
          <Input className='form-input' value={cg.name} onInput={(e) => update({ name: e.detail.value })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>手机号</Text>
          <Input className='form-input' value={cg.phone || ''} onInput={(e) => update({ phone: e.detail.value })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>性别</Text>
          <View style={{ display: 'flex', gap: 8 }}>
            {['女', '男'].map((g) => (
              <View key={g} onClick={() => update({ gender: g })} style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, textAlign: 'center',
                background: cg.gender === g ? '#2E7D32' : '#F5F5F5',
                color: cg.gender === g ? 'white' : '#616161',
                fontWeight: 500, fontSize: 14,
              }}>
                <Text>{g}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className='form-group'>
          <Text className='form-label'>年龄</Text>
          <Input type='number' className='form-input' value={cg.age} onInput={(e) => update({ age: Number(e.detail.value) })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>从业年限</Text>
          <Input type='number' className='form-input' value={cg.yearsOfExp} onInput={(e) => update({ yearsOfExp: Number(e.detail.value) })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>护工等级</Text>
          <Picker mode='selector' range={['初级护工', '中级护工', '高级护工']} value={cg.level === '中级护工' ? 1 : cg.level === '高级护工' ? 2 : 0} onChange={(e) => update({ level: ['初级护工', '中级护工', '高级护工'][e.detail.value] as any })}>
            <View className='form-input'>{cg.level || '初级护工'}</View>
          </Picker>
        </View>
        <View className='form-group'>
          <Text className='form-label'>服务价格(元/小时)</Text>
          <Input type='number' className='form-input' value={cg.price} onInput={(e) => update({ price: Number(e.detail.value) })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>服务区域</Text>
          <Input className='form-input' value={cg.serviceArea || ''} onInput={(e) => update({ serviceArea: e.detail.value })} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>个人介绍</Text>
          <Textarea className='form-input' value={cg.introduction || ''} onInput={(e) => update({ introduction: e.detail.value })} style={{ minHeight: 80 }} />
        </View>
      </View>

      <View className='card'>
        <Text className='card-title'>资质证书审核</Text>
        {(cg.certifications || []).length === 0 ? (
          <Text style={{ fontSize: 13, color: '#9E9E9E', display: 'block' }}>暂无证书信息</Text>
        ) : (
          (cg.certifications || []).map((cert) => (
            <View key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #E0E0E0' }}>
              <Text style={{ fontSize: 18 }}>📜</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 500, fontSize: 14, display: 'block' }}>{cert.name}</Text>
                <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{cert.issuer} · {cert.issueDate}</Text>
              </View>
              <View onClick={() => {
                const updated = (cg.certifications || []).map((c) =>
                  c.id === cert.id ? { ...c, verified: !c.verified } : c
                )
                update({ certifications: updated })
              }} style={{
                padding: '4px 10px', borderRadius: 6,
                background: cert.verified ? '#E8F5E9' : '#FFF3E0',
                color: cert.verified ? '#2E7D32' : '#E65100',
                fontSize: 12, fontWeight: 500,
              }}>
                <Text>{cert.verified ? '✅ 已认证' : '⏳ 待认证'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View className='card'>
        <Text className='card-title'>技能标签</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {(cg.skills || []).map((s, i) => (
            <Text key={i} className='tag tag-info' style={{ fontSize: 13 }}>
              {s}
              <Text style={{ marginLeft: 6, opacity: 0.6 }} onClick={() => update({ skills: (cg.skills || []).filter((_, j) => j !== i) })}>×</Text>
            </Text>
          ))}
        </View>
        <View onClick={addSkill} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #2E7D32', borderRadius: 6, color: '#2E7D32', display: 'inline-block' }}>
          <Text>+ 添加技能</Text>
        </View>
      </View>

      <View className='card'>
        <Text className='card-title'>服务状态</Text>
        <Text style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Switch checked={cg.available} onChange={() => update({ available: !cg.available })} color='#2E7D32' />
          <Text style={{ fontSize: 15 }}>{cg.available ? '可接单' : '休息中'}</Text>
        </Text>
        <Text style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch checked={cg.locked || false} onChange={() => update({ locked: !cg.locked })} color='#2E7D32' />
          <Text style={{ fontSize: 15 }}>{cg.locked ? '🔒 已锁定（不可下单）' : '🔓 未锁定'}</Text>
        </Text>
        {cg.locked && (
          <View style={{ marginTop: 8, padding: '8px 12px', background: '#FFF3E0', borderRadius: 8, fontSize: 13, color: '#E65100' }}>
            <Text>⚠️ 该护工已被锁定，家属无法选择其进行服务下单</Text>
          </View>
        )}
      </View>

      <View className='card'>
        <Text className='card-title'>请假管理</Text>
        <Text style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Switch checked={cg.onLeave || false} onChange={() => update({ onLeave: !cg.onLeave })} color='#2E7D32' />
          <Text style={{ fontSize: 15 }}>{cg.onLeave ? '📅 请假中' : '工作中'}</Text>
        </Text>
        {cg.onLeave && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input className='form-input' placeholder='请假原因' value={cg.leaveReason || ''} onInput={(e) => update({ leaveReason: e.detail.value })} />
            <View style={{ display: 'flex', gap: 8 }}>
              <Input className='form-input' placeholder='开始日期 (YYYY-MM-DD)' value={cg.leaveStart || ''} onInput={(e) => update({ leaveStart: e.detail.value })} style={{ flex: 1 }} />
              <Input className='form-input' placeholder='结束日期 (YYYY-MM-DD)' value={cg.leaveEnd || ''} onInput={(e) => update({ leaveEnd: e.detail.value })} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </View>

      <View className='card'>
        <Text className='card-title'>接单容量</Text>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14 }}>当前护理人数</Text>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>{cg.currentPatients || 0} 人</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14 }}>最大上限</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <View onClick={() => update({ maxPatients: Math.max(1, (cg.maxPatients || 5) - 1) })} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <Text>−</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{cg.maxPatients || 5}</Text>
              <View onClick={() => update({ maxPatients: Math.min(20, (cg.maxPatients || 5) + 1) })} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <Text>+</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#9E9E9E' }}>人</Text>
            </View>
          </View>
          <View style={{ height: 6, background: '#E0E0E0', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${Math.min(100, ((cg.currentPatients || 0) / (cg.maxPatients || 5)) * 100)}%`, background: (cg.currentPatients || 0) >= (cg.maxPatients || 5) ? '#D32F2F' : '#2E7D32', borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>
            {(cg.currentPatients || 0) >= (cg.maxPatients || 5) ? '⚠️ 已满员，无法接新单' : `还可接收 ${(cg.maxPatients || 5) - (cg.currentPatients || 0)} 人`}
          </Text>
        </View>
      </View>

      {cg.onLeave && (
        <View className='card'>
          <Text className='card-title'>临时接班安排</Text>
          <Text style={{ fontSize: 13, color: '#616161', marginBottom: 8, display: 'block' }}>
            护工请假期间，安排临时接班护工替代护理。主护工仍为 {cg.name}，接班护工将记录在护理档案中。
          </Text>
          <View style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Picker
              mode='selector'
              range={[
                '-- 请选择接班护工 --',
                ...caregivers.filter((c) => c.id !== cg.id && c.available && !c.onLeave).map((c) => `${c.name} (${c.level})`)
              ]}
              value={
                cg.substituteId
                  ? caregivers.filter((c) => c.id !== cg.id && c.available && !c.onLeave).findIndex((c) => c.id === cg.substituteId) + 1
                  : 0
              }
              onChange={(e) => {
                const idx = e.detail.value
                if (idx === 0) {
                  update({ substituteId: undefined })
                } else {
                  const sub = caregivers.filter((c) => c.id !== cg.id && c.available && !c.onLeave)[idx - 1]
                  if (sub) update({ substituteId: sub.id })
                }
              }}
            >
              <View className='form-input' style={{ flex: 1, padding: '8px 10px', fontSize: 13 }}>
                {cg.substituteId
                  ? (() => { const sub = caregivers.find((c) => c.id === cg.substituteId); return sub ? `${sub.name} (${sub.level})` : '-- 请选择接班护工 --' })()
                  : '-- 请选择接班护工 --'}
              </View>
            </Picker>
          </View>
          {cg.substituteId && (() => {
            const sub = caregivers.find((c) => c.id === cg.substituteId)
            return sub ? (
              <View style={{ marginTop: 8, padding: '8px 12px', background: '#E3F2FD', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>✅ 已安排接班：</Text>
                <Text style={{ fontWeight: 600 }}>{sub.name}</Text>
                <Text style={{ color: '#9E9E9E' }}>({sub.level})</Text>
              </View>
            ) : null
          })()}
        </View>
      )}

      <View style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <View onClick={onSave} style={{ flex: 1, padding: '16px 32px', background: '#2E7D32', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text>💾 保存修改</Text>
        </View>
        <View onClick={onBack} style={{ flex: 1, padding: '16px 32px', border: '2px solid #2E7D32', color: '#2E7D32', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text>取消</Text>
        </View>
      </View>
    </View>
  )
}

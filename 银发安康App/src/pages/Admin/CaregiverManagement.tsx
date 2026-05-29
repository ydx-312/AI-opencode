import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { ImageUpload } from '../../components/common/ImageUpload'
import { useAppStore, Permissions, Caregiver } from '../../store'

export const AdminCaregiverPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const isAdmin = Permissions.isAdmin(user?.role)

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-text" style={{ fontSize: 18, marginTop: 12 }}>无管理员权限</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8 }}>请联系平台管理员获取访问权限</p>
          <Button variant="primary" size="md" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>返回</Button>
        </div>
      </div>
    )
  }

  return <AdminCaregiverConsole />
}

const AdminCaregiverConsole: React.FC = () => {
  const navigate = useNavigate()
  const storeCaregivers = useAppStore((s) => s.caregivers)
  const setStoreCaregivers = useAppStore((s) => s.setCaregivers)
  const updateStoreCaregiver = useAppStore((s) => s.updateCaregiver)
  const caregiverEditLogs = useAppStore((s) => s.caregiverEditLogs)
  const [caregivers, setCaregivers] = useState<Caregiver[]>(storeCaregivers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogFor, setShowLogFor] = useState<string | null>(null)

  useEffect(() => { setStoreCaregivers(caregivers) }, [caregivers])

  const filtered = caregivers.filter((c) =>
    c.name.includes(searchTerm) || c.phone?.includes(searchTerm) || c.serviceArea?.includes(searchTerm)
  )

  const [form, setForm] = useState<Partial<Caregiver>>({
    name: '', age: 40, gender: '女', yearsOfExp: 3, level: '初级护工', price: 35,
    phone: '', serviceArea: '', skills: [], certs: [], tags: [],
    introduction: '', available: true, locked: false, photos: [],
  })
  const [photos, setPhotos] = useState<string[]>([])

  const handleSave = (cg?: Caregiver) => {
    if (cg) {
      setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...cg, photos } : c))
    } else {
      const newCg: Caregiver = {
        ...form as Caregiver,
        id: `cg_new_${Date.now()}`,
        rating: 0, serviceCount: 0, completionRate: 0,
        photos,
        certifications: [],
        avatar: '',
      }
      setCaregivers([newCg, ...caregivers])
    }
    setShowAddForm(false)
    setEditingId(null)
    setPhotos([])
  }

  const handleDelete = (id: string) => {
    setCaregivers(caregivers.filter((c) => c.id !== id))
  }

  const handleVerifyCert = (cgId: string, certId: string) => {
    setCaregivers(caregivers.map((cg) => {
      if (cg.id !== cgId || !cg.certifications) return cg
      return {
        ...cg,
        certifications: cg.certifications.map((cert) =>
          cert.id === certId ? { ...cert, verified: !cert.verified } : cert
        ),
      }
    }))
  }

  const handleToggleAvailable = (id: string) => {
    setCaregivers(caregivers.map((c) =>
      c.id === id ? { ...c, available: !c.available } : c
    ))
  }

  if (editingId) {
    const cg = caregivers.find((c) => c.id === editingId)
    if (!cg) return null
    return (
      <div className="page">
        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '8px 0' }}>‹ 返回</button>
        <div className="page-header"><h1 className="page-title">编辑护工 - {cg.name}</h1></div>

        <Card title="基本信息">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">姓名</label><input className="form-input" value={cg.name} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, name: e.target.value } : c))} /></div>
            <div className="form-group"><label className="form-label">手机号</label><input className="form-input" value={cg.phone || ''} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, phone: e.target.value } : c))} /></div>
            <div className="form-group"><label className="form-label">性别</label><select className="form-input" value={cg.gender} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, gender: e.target.value } : c))}><option>女</option><option>男</option></select></div>
            <div className="form-group"><label className="form-label">年龄</label><input className="form-input" type="number" value={cg.age} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, age: Number(e.target.value) } : c))} /></div>
            <div className="form-group"><label className="form-label">从业年限</label><input className="form-input" type="number" value={cg.yearsOfExp} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, yearsOfExp: Number(e.target.value) } : c))} /></div>
            <div className="form-group"><label className="form-label">护工等级</label><select className="form-input" value={cg.level || '初级护工'} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, level: e.target.value as any } : c))}><option value="初级护工">初级护工</option><option value="中级护工">中级护工</option><option value="高级护工">高级护工</option></select></div>
            <div className="form-group"><label className="form-label">服务价格(元/小时)</label><input className="form-input" type="number" value={cg.price} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, price: Number(e.target.value) } : c))} /></div>
            <div className="form-group"><label className="form-label">服务区域</label><input className="form-input" value={cg.serviceArea || ''} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, serviceArea: e.target.value } : c))} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">个人介绍</label>
            <textarea className="form-input" rows={3} value={cg.introduction || ''} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, introduction: e.target.value } : c))} />
          </div>
        </Card>

        <Card title="照片">
          <ImageUpload images={cg.photos || []} onImagesChange={(imgs) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, photos: imgs } : c))} max={6} label="" shape="square" size={80} />
        </Card>

        <Card title="资质证书审核">
          {(cg.certifications || []).map((cert) => (
            <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 18 }}>📜</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{cert.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{cert.issuer} · {cert.issueDate}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {cert.imageUrl ? (
                  <span style={{ fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer' }}>查看证书</span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>未上传</span>
                )}
                <button onClick={() => handleVerifyCert(cg.id, cert.id)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: cert.verified ? '#E8F5E9' : '#FFF3E0',
                  color: cert.verified ? 'var(--color-primary)' : 'var(--color-secondary)',
                  fontSize: 12, fontWeight: 500,
                }}>
                  {cert.verified ? '✅ 已认证' : '⏳ 待认证'}
                </button>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" style={{ marginTop: 8 }}>+ 添加证书</Button>
        </Card>

        <Card title="技能标签">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {cg.skills.map((s, i) => (
              <span key={i} className="tag tag-info" style={{ fontSize: 13 }}>
                {s}
                <span style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }} onClick={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, skills: c.skills.filter((_, j) => j !== i) } : c))}>×</span>
              </span>
            ))}
          </div>
          <Button variant="secondary" size="sm">+ 添加技能</Button>
        </Card>

        <Card title="服务状态">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={cg.available} onChange={() => handleToggleAvailable(cg.id)} />
            <span style={{ fontSize: 15 }}>{cg.available ? '可接单' : '休息中'}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 10 }}>
            <input type="checkbox" checked={cg.locked || false} onChange={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, locked: !c.locked } : c))} />
            <span style={{ fontSize: 15 }}>{cg.locked ? '🔒 已锁定（不可下单）' : '🔓 未锁定'}</span>
          </label>
          {cg.locked && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#FFF3E0', borderRadius: 8, fontSize: 13, color: '#E65100' }}>
              ⚠️ 该护工已被锁定，家属无法选择其进行服务下单
            </div>
          )}
        </Card>

        {/* 请假设置 */}
        <Card title="请假管理">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={cg.onLeave || false} 
              onChange={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, onLeave: !c.onLeave } : c))} />
            <span style={{ fontSize: 15 }}>{cg.onLeave ? '📅 请假中' : '工作中'}</span>
          </label>
          {cg.onLeave && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="form-input" placeholder="请假原因" value={cg.leaveReason || ''} 
                onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, leaveReason: e.target.value } : c))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="date" placeholder="开始日期" value={cg.leaveStart || ''} 
                  onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, leaveStart: e.target.value } : c))} />
                <input className="form-input" type="date" placeholder="结束日期" value={cg.leaveEnd || ''} 
                  onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, leaveEnd: e.target.value } : c))} />
              </div>
            </div>
          )}
        </Card>

        <Card title="接单容量">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>当前护理人数</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{cg.currentPatients || 0} 人</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>最大上限</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, maxPatients: Math.max(1, (c.maxPatients || 5) - 1) } : c))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{cg.maxPatients || 5}</span>
                <button onClick={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, maxPatients: Math.min(20, (c.maxPatients || 5) + 1) } : c))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', fontSize: 16 }}>+</button>
                <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>人</span>
              </div>
            </div>
            <div style={{ height: 6, background: '#E0E0E0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((cg.currentPatients || 0) / (cg.maxPatients || 5)) * 100)}%`, background: (cg.currentPatients || 0) >= (cg.maxPatients || 5) ? 'var(--color-danger)' : 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
              {(cg.currentPatients || 0) >= (cg.maxPatients || 5) ? '⚠️ 已满员，无法接新单' : `还可接收 ${(cg.maxPatients || 5) - (cg.currentPatients || 0)} 人`}
            </div>
          </div>
        </Card>

        {cg.onLeave && (
          <Card title="临时接班安排">
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              护工请假期间，安排临时接班护工替代护理。主护工仍为 {cg.name}，接班护工将记录在护理档案中。
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-input" value={cg.substituteId || ''} onChange={(e) => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, substituteId: e.target.value || undefined } : c))}
                style={{ flex: 1, padding: '8px 10px', fontSize: 13, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <option value="">-- 请选择接班护工 --</option>
                {caregivers.filter((c) => c.id !== cg.id && c.available && !c.onLeave).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>
            {cg.substituteId && (() => {
              const sub = caregivers.find((c) => c.id === cg.substituteId)
              return sub ? (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#E3F2FD', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✅ 已安排接班：</span>
                  <strong>{sub.name}</strong>
                  <span style={{ color: 'var(--color-text-light)' }}>({sub.level})</span>
                </div>
              ) : null
            })()}
          </Card>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="primary" size="lg" block onClick={() => {
            useAppStore.getState().addCaregiverEditLog({
              id: `editlog_${Date.now()}`,
              caregiverId: cg.id,
              caregiverName: cg.name,
              editorId: useAppStore.getState().user?.id || '',
              editorName: useAppStore.getState().user?.name || '管理员',
              changes: { level: cg.level, available: cg.available, price: cg.price, maxPatients: cg.maxPatients, phone: cg.phone, serviceArea: cg.serviceArea },
              timestamp: new Date().toISOString(),
            })
            setEditingId(null)
          }}>💾 保存修改</Button>
          <Button variant="secondary" size="lg" block onClick={() => setEditingId(null)}>取消</Button>
        </div>
      </div>
    )
  }

  if (showAddForm) {
    return (
      <div className="page">
        <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '8px 0' }}>‹ 返回</button>
        <div className="page-header"><h1 className="page-title">新增护工</h1></div>

        <Card title="基本信息">
          <div className="form-group"><label className="form-label">姓名</label><input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">性别</label><select className="form-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>女</option><option>男</option></select></div>
            <div className="form-group"><label className="form-label">年龄</label><input className="form-input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">从业年限</label><input className="form-input" type="number" value={form.yearsOfExp} onChange={(e) => setForm({ ...form, yearsOfExp: Number(e.target.value) })} /></div>
            <div className="form-group"><label className="form-label">护工等级</label><select className="form-input" value={form.level || '初级护工'} onChange={(e) => setForm({ ...form, level: e.target.value as any })}><option value="初级护工">初级护工</option><option value="中级护工">中级护工</option><option value="高级护工">高级护工</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">服务价格(元/小时)</label><input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div className="form-group"><label className="form-label">手机号</label><input className="form-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">服务区域</label><input className="form-input" value={form.serviceArea || ''} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">个人介绍</label><textarea className="form-input" rows={3} value={form.introduction || ''} onChange={(e) => setForm({ ...form, introduction: e.target.value })} /></div>
        </Card>

        <Card title="照片上传">
          <ImageUpload images={photos} onImagesChange={setPhotos} max={6} shape="square" size={80} />
        </Card>

        <Card title="初始资质证书">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['养老护理证', '健康管理师', '营养师', '康复治疗师', '急救证'].map((cert) => (
              <label key={cert} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                <input type="checkbox" checked={form.certs?.includes(cert) || false}
                  onChange={() => setForm({
                    ...form,
                    certs: form.certs?.includes(cert)
                      ? form.certs.filter((c) => c !== cert)
                      : [...(form.certs || []), cert],
                  })}
                />
                <span style={{ fontSize: 14 }}>{cert}</span>
              </label>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="primary" size="lg" block onClick={() => handleSave()}>✅ 创建护工</Button>
          <Button variant="secondary" size="lg" block onClick={() => setShowAddForm(false)}>取消</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">⚙️ 护工管理后台</h1>
        <p className="page-subtitle">管理员 · 管理护工档案、审核资质</p>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="搜索护工姓名/手机号/区域..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minHeight: 44, fontSize: 14 }} />
          <Button variant="primary" size="md" onClick={() => setShowAddForm(true)}>+ 新增护工</Button>
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
          <div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{caregivers.length}</div><div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>总护工</div></div>
          <div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)' }}>{caregivers.filter((c) => c.available).length}</div><div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>可接单</div></div>
          <div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-secondary)' }}>{caregivers.reduce((s, c) => s + c.serviceCount, 0)}</div><div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>总服务</div></div>
          <div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-info)' }}>{(caregivers.reduce((s, c) => s + c.rating, 0) / caregivers.length).toFixed(1)}</div><div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>平均评分</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center' }}>
          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }}>
            高级: {caregivers.filter((c) => c.level === '高级护工').length}
          </span>
          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFF3E0', color: '#E65100', fontWeight: 600 }}>
            中级: {caregivers.filter((c) => c.level === '中级护工').length}
          </span>
          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#E3F2FD', color: '#1565C0', fontWeight: 600 }}>
             初级: {caregivers.filter((c) => c.level === '初级护工').length}
           </span>
         </div>
         <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
           <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFF8E1', color: '#F57F17', fontWeight: 600 }}>📅 请假: {caregivers.filter((c) => c.onLeave).length}人</span>
           <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 10, background: '#FFEBEE', color: '#C62828', fontWeight: 600 }}>⚡ 满员: {caregivers.filter((c) => (c.currentPatients || 0) >= (c.maxPatients || 5)).length}人</span>
         </div>
       </Card>

      {/* Caregiver List (Admin View) */}
      {filtered.map((cg) => (
        <Card key={cg.id}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar name={cg.name} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{cg.name}</span>
                <span className={`tag ${cg.available ? 'tag-primary' : 'tag-danger'}`} style={{ fontSize: 10 }}>
                  {cg.locked ? '🔒 已锁定' : (cg.available ? '可接单' : '休息中')}
                </span>
                {cg.onLeave && <span className="tag tag-warning" style={{ fontSize: 10, background: '#FFF8E1', color: '#F57F17' }}>📅 请假中</span>}
                {(cg.currentPatients || 0) >= (cg.maxPatients || 5) && <span className="tag tag-danger" style={{ fontSize: 10 }}>满员</span>}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10,
                  background: cg.level === '高级护工' ? '#E8F5E9' : cg.level === '中级护工' ? '#FFF3E0' : '#E3F2FD',
                  color: cg.level === '高级护工' ? '#1B5E20' : cg.level === '中级护工' ? '#E65100' : '#1565C0',
                }}>
                  {cg.level || '未定级'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{cg.gender} · {cg.age}岁 · {cg.yearsOfExp}年</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {cg.serviceArea} · ¥{cg.price}/h · ⭐{cg.rating} · {cg.serviceCount}单 · 📱{cg.phone}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {cg.skills.slice(0, 3).map((s) => (
                  <span key={s} className="tag tag-info" style={{ fontSize: 10, padding: '1px 6px' }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Button variant="secondary" size="sm" onClick={() => { setEditingId(cg.id) }}>✏️ 编辑</Button>
              <Button variant="secondary" size="sm" onClick={() => handleToggleAvailable(cg.id)}>
                {cg.available ? '🟢 设为休息' : '🔴 设为可接'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCaregivers(caregivers.map((c) => c.id === cg.id ? { ...c, locked: !c.locked } : c))} style={{ background: cg.locked ? '#FFF3E0' : undefined, color: cg.locked ? '#E65100' : undefined }}>
                {cg.locked ? '🔒 解锁' : '🔓 锁定'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(cg.id)}>🗑️ 删除</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowLogFor(showLogFor === cg.id ? null : cg.id)}>
                {showLogFor === cg.id ? '收起记录' : '📋 修改记录'}
              </Button>
            </div>
          </div>
          {showLogFor === cg.id && (() => {
            const logs = caregiverEditLogs.filter((l) => l.caregiverId === cg.id)
            return (
              <div style={{ marginTop: 8, padding: 8, background: '#F5F5F5', borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>修改记录</div>
                {logs.length === 0 ? (
                  <div style={{ color: 'var(--color-text-light)' }}>暂无修改记录</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #E0E0E0', fontSize: 11 }}>
                      <span style={{ color: 'var(--color-text-light)' }}>{new Date(log.timestamp).toLocaleString()} - {log.editorName}</span>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {Object.entries(log.changes).filter(([k]) => !['id', 'name', 'avatar', 'photos'].includes(k)).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          })()}
        </Card>
      ))}
    </div>
  )
}

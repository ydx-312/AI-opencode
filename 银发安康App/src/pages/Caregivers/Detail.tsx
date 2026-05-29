import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { StarRating } from '../../components/common/StarRating'
import { ImageUpload } from '../../components/common/ImageUpload'
import { useAppStore, Permissions, CaregiverLevel, getCaregiverLevel } from '../../store'
import { mockReviews } from '../../utils/mockData'
import { Caregiver } from '../../store'

export const CaregiverDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateCaregiver, caregivers } = useAppStore()
  const caregiver = caregivers.find((c) => c.id === id)
  const reviews = mockReviews.filter((r) => r.caregiverId === id)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Caregiver>>({})
  const [photos, setPhotos] = useState<string[]>([])

  const isAdmin = Permissions.isAdmin(user?.role)
  const isOwner = user?.id === `cg_${id}`

  if (!caregiver) {
    return <div className="page"><div className="empty-state"><div className="empty-state-icon">😕</div><div className="empty-state-text">未找到护工信息</div></div></div>
  }

  const handleStartEdit = () => {
    setEditForm({ ...caregiver })
    setPhotos(caregiver.photos || [])
    setEditing(true)
  }

  const handleSaveEdit = () => {
    updateCaregiver(caregiver.id, { ...editForm, photos })
    setEditing(false)
  }

  const canEdit = isAdmin || isOwner

  if (editing && canEdit) {
    return (
      <div className="page">
        <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '8px 0', color: 'var(--color-text)' }}>‹ 返回</button>
        <div className="page-header"><h1 className="page-title">编辑护工档案</h1></div>

        <Card title="基本信息">
          <div className="form-group">
            <label className="form-label">姓名</label>
            <input className="form-input" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">性别</label>
              <select className="form-input" value={editForm.gender || ''} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="女">女</option><option value="男">男</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">年龄</label>
              <input className="form-input" type="number" value={editForm.age || ''} onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">从业年限</label>
            <input className="form-input" type="number" value={editForm.yearsOfExp || ''} onChange={(e) => setEditForm({ ...editForm, yearsOfExp: Number(e.target.value) })} />
          </div>
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">护工等级</label>
              <select className="form-input" value={editForm.level || '初级护工'} onChange={(e) => setEditForm({ ...editForm, level: e.target.value as CaregiverLevel })}>
                <option value="初级护工">初级护工</option>
                <option value="中级护工">中级护工</option>
                <option value="高级护工">高级护工</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">服务区域</label>
            <input className="form-input" value={editForm.serviceArea || ''} onChange={(e) => setEditForm({ ...editForm, serviceArea: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">服务价格（元/小时）</label>
            <input className="form-input" type="number" value={editForm.price || ''} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">手机号</label>
            <input className="form-input" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </div>
        </Card>

        <Card title="个人介绍">
          <textarea className="form-input" rows={3} value={editForm.introduction || ''} onChange={(e) => setEditForm({ ...editForm, introduction: e.target.value })} />
        </Card>

        <Card title="正面照/工作照">
          <ImageUpload images={photos} onImagesChange={setPhotos} max={6} label="" shape="square" size={80} />
        </Card>

        <Card title="资质证书">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(editForm.certs || []).map((cert, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="tag tag-primary" style={{ fontSize: 13 }}>📜 {cert}</span>
                <button style={{ color: 'var(--color-danger)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>删除</button>
              </div>
            ))}
            <Button variant="secondary" size="sm">+ 添加证书</Button>
          </div>
        </Card>

        <Card title="技能标签">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {(editForm.skills || []).map((skill, i) => (
              <span key={i} className="tag tag-info" style={{ fontSize: 13 }}>
                {skill}
                <span style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }} onClick={() => setEditForm({ ...editForm, skills: (editForm.skills || []).filter((_, j) => j !== i) })}>×</span>
              </span>
            ))}
          </div>
          <Button variant="secondary" size="sm">+ 添加技能</Button>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="primary" size="lg" block onClick={handleSaveEdit}>💾 保存修改</Button>
          <Button variant="secondary" size="lg" block onClick={() => setEditing(false)}>取消</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '8px 0', color: 'var(--color-text)' }}>
        ‹ 返回
      </button>

      {/* Profile Header */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={caregiver.name} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{caregiver.name}</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12,
                background: caregiver.level === '高级护工' ? '#E8F5E9' : caregiver.level === '中级护工' ? '#FFF3E0' : '#E3F2FD',
                color: caregiver.level === '高级护工' ? '#1B5E20' : caregiver.level === '中级护工' ? '#E65100' : '#1565C0',
              }}>
                {caregiver.level || getCaregiverLevel(caregiver.yearsOfExp)}
              </span>
              {caregiver.onLeave && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#FFF8E1', color: '#F57F17', fontWeight: 600 }}>📅 请假中</span>}
              {canEdit && (
                <button onClick={handleStartEdit} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
                  ✏️ 编辑档案
                </button>
              )}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {caregiver.gender} · {caregiver.age}岁 · {caregiver.yearsOfExp}年经验 · {caregiver.serviceArea}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <StarRating value={Math.round(caregiver.rating)} readonly size={18} />
              <span style={{ fontSize: 18, color: 'var(--color-secondary)', fontWeight: 700 }}>{caregiver.rating}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>· {caregiver.serviceCount}单</span>
              {caregiver.completionRate && (
                <span className="tag tag-primary" style={{ fontSize: 11 }}>完成率 {caregiver.completionRate}%</span>
              )}
            </div>
          </div>
        </div>
        {caregiver.introduction && (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 12, lineHeight: 1.7, padding: '10px 14px', background: '#F5F5F5', borderRadius: 8 }}>
            {caregiver.introduction}
          </p>
        )}
      </Card>

      {/* Price & Book */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 28, color: 'var(--color-danger)', fontWeight: 700 }}>¥{caregiver.price}</span>
            <span style={{ fontSize: 14, color: 'var(--color-text-light)' }}>/小时</span>
          </div>
          <Button variant="primary" disabled={!caregiver.available} size="lg">
            {caregiver.available ? '立即预约' : '暂不可约'}
          </Button>
        </div>
      </Card>

      {/* Photo Wall */}
      {(caregiver.photos && caregiver.photos.length > 0) && (
        <Card title="工作风采">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {caregiver.photos.map((photo, i) => (
              <div key={i} style={{
                width: 140, height: 100, borderRadius: 8,
                background: `url(${photo}) center/cover no-repeat`,
                border: '1px solid var(--color-border)', flexShrink: 0,
              }} />
            ))}
            {canEdit && (
              <div onClick={handleStartEdit} style={{
                width: 100, height: 100, borderRadius: 8,
                background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                border: '2px dashed var(--color-border)', flexShrink: 0,
                color: 'var(--color-text-light)', fontSize: 12,
              }}>
                <span style={{ fontSize: 24 }}>+</span>
                <span>上传照片</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Certifications with Gallery */}
      <Card title="资质证书">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {caregiver.certifications && caregiver.certifications.length > 0 ? (
            caregiver.certifications.map((cert) => (
              <div key={cert.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: '#F9F9F9', borderRadius: 8,
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: cert.imageUrl ? `url(${cert.imageUrl}) center/cover no-repeat` : '#E8F5E9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {!cert.imageUrl && '📜'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cert.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>颁发：{cert.issuer}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>日期：{cert.issueDate}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {cert.verified ? (
                    <span className="tag tag-primary" style={{ fontSize: 11 }}>✅ 已认证</span>
                  ) : (
                    <span className="tag tag-danger" style={{ fontSize: 11 }}>待审核</span>
                  )}
                  {canEdit && (
                    <button style={{ display: 'block', marginTop: 4, fontSize: 11, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      上传证书
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            caregiver.certs.map((cert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span className="tag tag-primary" style={{ fontSize: 13, padding: '6px 14px' }}>📜 {cert}</span>
                <span className="tag tag-primary" style={{ fontSize: 11 }}>✅ 已认证</span>
              </div>
            ))
          )}
        </div>
        {canEdit && (
          <Button variant="secondary" size="sm" onClick={handleStartEdit} style={{ marginTop: 12 }}>
            + 添加证书
          </Button>
        )}
      </Card>

      {/* Skills */}
      <Card title="擅长领域">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {caregiver.skills.map((skill) => (
            <span key={skill} className="tag tag-info" style={{ padding: '6px 16px', fontSize: 14 }}>{skill}</span>
          ))}
        </div>
      </Card>

      {/* Tags */}
      <Card title="个人标签">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {caregiver.tags.map((tag) => (
            <span key={tag} style={{ fontSize: 13, color: 'var(--color-text-secondary)', background: '#F5F5F5', padding: '4px 10px', borderRadius: 16 }}>#{tag}</span>
          ))}
        </div>
      </Card>

      {/* Admin Management */}
      {isAdmin && (
        <Card title="🔧 管理员管理">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>服务状态</span>
              <button onClick={() => updateCaregiver(caregiver.id, { available: !caregiver.available })} style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: caregiver.available ? '#E8F5E9' : '#FFEBEE',
                color: caregiver.available ? '#2E7D32' : '#C62828', fontWeight: 600, fontSize: 13,
              }}>
                {caregiver.available ? '🟢 服务中' : '🔴 休息中'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>当前等级</span>
              <select value={caregiver.level} onChange={(e) => updateCaregiver(caregiver.id, { level: e.target.value as CaregiverLevel })} style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13, background: 'white',
              }}>
                <option value="初级护工">初级护工</option>
                <option value="中级护工">中级护工</option>
                <option value="高级护工">高级护工</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>服务单数</span>
              <span style={{ fontWeight: 600 }}>{caregiver.serviceCount} 单</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>请假状态</span>
              <button onClick={() => updateCaregiver(caregiver.id, { onLeave: !caregiver.onLeave })}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: caregiver.onLeave ? '#FFF8E1' : '#E8F5E9',
                  color: caregiver.onLeave ? '#F57F17' : '#2E7D32', fontWeight: 600, fontSize: 13,
                }}>
                {caregiver.onLeave ? '📅 请假中' : '工作中'}
              </button>
            </div>
            {caregiver.onLeave && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#FFF8E1', borderRadius: 8, fontSize: 13, color: '#F57F17' }}>
                原因：{caregiver.leaveReason || '未填写'}{caregiver.leaveStart ? ` · ${caregiver.leaveStart}~${caregiver.leaveEnd || '未知'}` : ''}
              </div>
            )}
            {caregiver.substituteId && (() => {
              const sub = caregivers.find((c) => c.id === caregiver.substituteId)
              return sub ? (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#E3F2FD', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🔄 接班护工：</span>
                  <strong>{sub.name}</strong>
                  <span style={{ color: 'var(--color-text-light)' }}>({sub.level})</span>
                </div>
              ) : null
            })()}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 14 }}>接单容量</span>
              <span style={{ fontWeight: 600 }}>{caregiver.currentPatients || 0}/{caregiver.maxPatients || 5} 人</span>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews */}
      <Card title={`服务评价 (${reviews.length})`}>
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: 16 }}>暂无评价</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{review.elderlyName}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>{review.createdAt}</span>
              </div>
              <StarRating value={review.rating} readonly size={16} />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6 }}>{review.content}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--color-text-light)' }}>
                <span>态度 {review.dimensions.attitude}★</span>
                <span>专业 {review.dimensions.professional}★</span>
                <span>耐心 {review.dimensions.patience}★</span>
                <span>响应 {review.dimensions.response}★</span>
                <span>效果 {review.dimensions.effectiveness}★</span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

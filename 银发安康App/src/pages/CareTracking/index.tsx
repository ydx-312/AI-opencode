import React, { useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { mockCareRecords } from '../../utils/mockData'
import { useAppStore, CareRecord, Permissions } from '../../store'
import { formatDateTime, generateId } from '../../utils'

export const CareTrackingPage: React.FC = () => {
  const { user, caregivers } = useAppStore()
  const isAdmin = Permissions.isAdmin(user?.role)
  const saved = JSON.parse(localStorage.getItem('caretrack_records') || 'null')
  const [records, setRecords] = useState<CareRecord[]>(saved || mockCareRecords)
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history' | 'timeline'>('ongoing')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editData, setEditData] = useState<Partial<CareRecord>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const persistRecords = (newRecords: CareRecord[]) => {
    setRecords(newRecords)
    localStorage.setItem('caretrack_records', JSON.stringify(newRecords))
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = true
    input.click()
  }

  const handleSubmitRecord = (data: Partial<CareRecord>, images: string[], videos: string[]) => {
    const currentCg = user?.caregiverId ? caregivers.find((c) => c.id === user.caregiverId) : null
    const substitute = currentCg?.onLeave && currentCg.substituteId
      ? caregivers.find((c) => c.id === currentCg.substituteId)
      : null
    const newRecord: CareRecord = {
      id: `cr_new_${Date.now()}`,
      elderlyId: data.elderlyId || 'e1',
      elderlyName: data.elderlyId === 'e2' ? '李建国' : '张秀英',
      caregiverId: currentCg?.id || 'c1',
      caregiverName: currentCg?.name || '王芳',
      substituteId: substitute?.id,
      substituteName: substitute?.name,
      startTime: `${new Date().toISOString().slice(0, 10)}T${data.startTime || '09:00'}:00`,
      endTime: `${new Date().toISOString().slice(0, 10)}T${data.endTime || '10:00'}:00`,
      content: data.content || '',
      medications: data.medications || '',
      diet: data.diet || '',
      training: data.training || '',
      notes: data.notes || '',
      status: 'ongoing',
      images,
      videos,
    }
    persistRecords([newRecord, ...records])
    setSubmitSuccess(true)
    setTimeout(() => { setShowAddForm(false); setSubmitSuccess(false) }, 1200)
  }

  const handleEdit = (record: CareRecord) => {
    setEditingId(record.id)
    setEditData({ ...record })
  }

  const handleSave = (updatedData?: Partial<CareRecord>) => {
    if (editingId) {
      persistRecords(records.map((r) => r.id === editingId ? { ...r, ...(updatedData || editData) } as CareRecord : r))
    }
    setEditingId(null)
    setEditData({})
  }

  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) return
    persistRecords(records.filter((r) => r.id !== id))
  }

  if (showAddForm) {
    if (submitSuccess) {
      return (
        <div className="page">
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, color: 'var(--color-primary-dark)' }}>护理记录提交成功！</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8 }}>正在跳转回护理记录列表...</p>
          </div>
        </div>
      )
    }
    return <AddCareRecordForm onSubmit={handleSubmitRecord} onClose={() => setShowAddForm(false)} />
  }

  const searchMatch = (r: CareRecord) => !searchQuery || searchQuery === '' ||
    [r.elderlyName, r.caregiverName, r.content, r.medications, r.diet, r.training, r.notes].some(
      (v) => v && v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  const ongoing = records.filter((r) => r.status === 'ongoing' && searchMatch(r))
  const completed = records.filter((r) => r.status === 'completed' && searchMatch(r))
  const filtered = activeTab === 'ongoing' ? ongoing : activeTab === 'history' ? completed : records.filter(searchMatch)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">护理记录</h1>
        <p className="page-subtitle">全程记录服务过程，实时可查可追溯</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 3 }}>
        {(['ongoing', 'history', 'timeline'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
            color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
            fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
          }}>
            {tab === 'ongoing' ? '🟢 进行中' : tab === 'history' ? '📋 历史记录' : '📅 时间线'}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <Button variant="primary" size="md" block onClick={() => setShowAddForm(true)} style={{ marginBottom: 12 }}>
        + 新建护理记录
      </Button>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜索护理记录（老人、护工、内容、用药等）"
          style={{
            width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
            border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box',
            background: 'var(--color-bg)',
          }}
        />
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">暂无护理记录</div>
        </div>
      ) : activeTab === 'timeline' ? (
        <TimelineView records={filtered} editingId={editingId} editData={editData} onEdit={handleEdit} onEditChange={setEditData} onSave={handleSave} onDelete={handleDeleteRecord} isAdmin={isAdmin} onImageClick={setPreviewImage} onVideoClick={setPreviewVideo} />
      ) : (
        filtered.map((record) => (
          editingId === record.id ? (
            <EditRecordCard key={record.id} data={editData} onChange={setEditData} onSave={(d) => { setEditData(d); handleSave(d) }} onCancel={() => setEditingId(null)} />
          ) : (
            <RecordCard key={record.id} record={record} onEdit={() => handleEdit(record)} onDelete={() => handleDeleteRecord(record.id)} isAdmin={isAdmin} onImageClick={setPreviewImage} onVideoClick={setPreviewVideo} />
          )
        ))
      )}
      {/* Image Preview Overlay */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <img src={previewImage} alt="预览" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      {/* Video Preview Overlay */}
      {previewVideo && (
        <div onClick={() => setPreviewVideo(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <button onClick={() => setPreviewVideo(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <video src={previewVideo} controls autoPlay style={{ maxWidth: '95%', maxHeight: '80%', borderRadius: 12 }} onClick={(e) => e.stopPropagation()} onEnded={() => setTimeout(() => setPreviewVideo(null), 500)} />
        </div>
      )}
    </div>
  )
}

/* ─── Record Card ─── */
const RecordCard: React.FC<{ record: CareRecord; onEdit: () => void; onDelete?: () => void; isAdmin?: boolean; onImageClick?: (url: string) => void; onVideoClick?: (url: string) => void }> = ({ record, onEdit, onDelete, isAdmin, onImageClick, onVideoClick }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <Avatar name={record.caregiverName} size={38} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {record.caregiverName}
          {record.substituteId && record.substituteName && (
            <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 8, background: '#E3F2FD', color: '#1565C0', marginLeft: 6 }}>
              接班: {record.substituteName}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{record.elderlyName}</div>
      </div>
      <span className={`tag ${record.status === 'ongoing' ? 'tag-primary' : 'tag-info'}`} style={{ fontSize: 11 }}>
        {record.status === 'ongoing' ? '进行中' : '已完成'}
      </span>
    </div>
    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-text-light)', marginBottom: 8 }}>
      <span>🕐 {record.startTime.slice(11, 16)}{record.endTime ? ` - ${record.endTime.slice(11, 16)}` : ''}</span>
      <span>📅 {record.startTime.slice(0, 10)}</span>
    </div>
    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 2 }}>
      <DetailRow icon="📝" label="服务内容" value={record.content} />
      <DetailRow icon="💊" label="用药记录" value={record.medications} />
      <DetailRow icon="🍚" label="饮食记录" value={record.diet} />
      <DetailRow icon="🏃" label="康复训练" value={record.training} />
      <DetailRow icon="📌" label="备注" value={record.notes} />
    </div>
    {/* Image previews */}
    {record.images.length > 0 && (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {record.images.map((img, i) => (
          <img key={i} src={img} alt="护理照片" onClick={() => onImageClick?.(img)} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--color-border)', cursor: 'pointer' }} />
        ))}
      </div>
    )}
    {/* Video previews */}
    {record.videos.length > 0 && (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {record.videos.map((url, i) => (
          <div key={i} onClick={() => onVideoClick?.(url)} style={{ width: 64, height: 64, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--color-border)', position: 'relative' }}>
            <span style={{ fontSize: 28, opacity: 0.8 }}>▶️</span>
          </div>
        ))}
      </div>
    )}
    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <Button variant="secondary" size="sm" onClick={onEdit}>✏️ 编辑（含上传影像）</Button>
      {isAdmin && onDelete && (
        <Button variant="danger" size="sm" onClick={onDelete}>🗑️ 删除</Button>
      )}
    </div>
  </Card>
)

/* ─── Edit Record Card ─── */
const EditRecordCard: React.FC<{ data: Partial<CareRecord>; onChange: (d: Partial<CareRecord>) => void; onSave: (d: Partial<CareRecord>) => void; onCancel: () => void }> = ({ data, onChange, onSave, onCancel }) => {
  const [editImages, setEditImages] = useState<string[]>(data.images || [])
  const [editVideos, setEditVideos] = useState<string[]>(data.videos || [])

  const handleEditAttach = (type: 'image' | 'video') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'image' ? 'image/*' : 'video/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          if (type === 'image') {
            setEditImages((prev) => [...prev, e.target!.result as string])
          } else {
            setEditVideos((prev) => [...prev, e.target!.result as string])
          }
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <Card>
      <div className="card-title">✏️ 编辑护理记录</div>
      <div className="form-group">
        <label className="form-label">服务内容</label>
        <textarea className="form-input" rows={3} value={data.content || ''} onChange={(e) => onChange({ ...data, content: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">用药记录</label>
        <textarea className="form-input" rows={2} value={data.medications || ''} onChange={(e) => onChange({ ...data, medications: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">饮食记录</label>
        <textarea className="form-input" rows={2} value={data.diet || ''} onChange={(e) => onChange({ ...data, diet: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">康复训练</label>
        <textarea className="form-input" rows={2} value={data.training || ''} onChange={(e) => onChange({ ...data, training: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea className="form-input" rows={2} value={data.notes || ''} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">附件</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {editImages.map((url, i) => (
            <div key={`img-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: `url(${url}) center/cover no-repeat`, border: '1px solid var(--color-border)' }}>
              <button onClick={() => setEditImages(editImages.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
            </div>
          ))}
          {editVideos.map((url, i) => (
            <div key={`vid-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: '#000', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28 }}>▶️</span>
              <button onClick={() => setEditVideos(editVideos.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
            </div>
          ))}
          <div onClick={() => handleEditAttach('image')} style={{ width: 72, height: 72, borderRadius: 8, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px dashed var(--color-border)', cursor: 'pointer' }}>+</div>
        </div>
        <div style={{ marginTop: 6 }}>
          <button onClick={() => handleEditAttach('video')} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>🎬 添加视频</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" size="sm" onClick={() => onSave({ ...data, images: editImages, videos: editVideos })}>💾 保存</Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>取消</Button>
      </div>
      <div style={{ marginTop: 12, padding: 12, background: '#E8F5E9', borderRadius: 8, fontSize: 13, color: 'var(--color-primary-dark)' }}>
        💡 修改后点击保存，所有变更将实时同步至家属端
      </div>
    </Card>
  )
}

/* ─── Add New Record Form ─── */
const AddCareRecordForm: React.FC<{ onSubmit: (data: Partial<CareRecord>, images: string[], videos: string[]) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    elderlyId: 'e1', content: '', medications: '', diet: '', training: '', notes: '',
    startTime: new Date().toISOString().slice(11, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(11, 16),
  })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])

  const handleAttachImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      files.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) setUploadedFiles((prev) => [...prev, e.target!.result as string])
        }
        reader.readAsDataURL(f)
      })
    }
    input.click()
  }

  const handleAttachVideo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      files.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) setUploadedVideos((prev) => [...prev, e.target!.result as string])
        }
        reader.readAsDataURL(f)
      })
    }
    input.click()
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">新建护理记录</h1>
      </div>
      <Card>
        <div className="form-group">
          <label className="form-label">服务对象</label>
          <select className="form-input" value={form.elderlyId} onChange={(e) => setForm({ ...form, elderlyId: e.target.value })}>
            <option value="e1">张秀英</option>
            <option value="e2">李建国</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">⏰ 服务时间段</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="time" className="form-input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} style={{ flex: 1 }} />
            <span style={{ color: 'var(--color-text-light)' }}>至</span>
            <input type="time" className="form-input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">服务内容</label>
          <textarea className="form-input" rows={3} placeholder="描述本次护理服务内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">用药记录</label>
          <textarea className="form-input" rows={2} placeholder="记录用药情况" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">饮食记录</label>
          <textarea className="form-input" rows={2} placeholder="记录饮食情况" value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">康复训练</label>
          <textarea className="form-input" rows={2} placeholder="记录康复训练内容" value={form.training} onChange={(e) => setForm({ ...form, training: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">附件上传</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {uploadedFiles.map((url, i) => (
              <div key={`img-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: `url(${url}) center/cover no-repeat`, border: '1px solid var(--color-border)' }}>
                <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
              </div>
            ))}
            {uploadedVideos.map((url, i) => (
              <div key={`vid-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: '#000', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28 }}>▶️</span>
                <button onClick={() => setUploadedVideos(uploadedVideos.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
              </div>
            ))}
            <div onClick={handleAttachImage} style={{ width: 72, height: 72, borderRadius: 8, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px dashed var(--color-border)', cursor: 'pointer' }}>+</div>
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <button onClick={handleAttachImage} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>📷 添加图片</button>
            <button onClick={handleAttachVideo} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>🎬 添加视频</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button variant="primary" size="md" block onClick={() => { onSubmit(form, uploadedFiles, uploadedVideos); setUploadedFiles([]); setUploadedVideos([]) }}>📤 提交记录</Button>
          <Button variant="secondary" size="md" block onClick={() => { setUploadedFiles([]); setUploadedVideos([]); onClose() }}>取消</Button>
        </div>
      </Card>
    </div>
  )
}

/* ─── Timeline View ─── */
const TimelineView: React.FC<{ records: CareRecord[]; editingId: string | null; editData: Partial<CareRecord>; onEdit: (r: CareRecord) => void; onEditChange: (d: Partial<CareRecord>) => void; onSave: (d?: Partial<CareRecord>) => void; onDelete?: (id: string) => void; isAdmin?: boolean; onImageClick?: (url: string) => void; onVideoClick?: (url: string) => void }> = ({ records, editingId, editData, onEdit, onEditChange, onSave, onDelete, isAdmin, onImageClick, onVideoClick }) => (
  <div style={{ position: 'relative', paddingLeft: 24 }}>
    {records.map((record, idx) => (
      <div key={record.id} style={{ position: 'relative', paddingBottom: 20 }}>
        {/* Timeline dot + line */}
        <div style={{ position: 'absolute', left: -24, top: 8, width: 12, height: 12, borderRadius: '50%', background: record.status === 'ongoing' ? 'var(--color-primary)' : 'var(--color-text-light)', border: '3px solid var(--color-bg)' }} />
        {idx < records.length - 1 && <div style={{ position: 'absolute', left: -19, top: 20, width: 2, height: 'calc(100% - 12px)', background: 'var(--color-border)' }} />}
        
        {editingId === record.id ? (
          <EditRecordCard data={editData} onChange={onEditChange} onSave={(d) => { onEditChange(d); onSave(d) }} onCancel={() => {}} />
        ) : (
          <RecordCard record={record} onEdit={() => onEdit(record)} onDelete={() => onDelete?.(record.id)} isAdmin={isAdmin} onImageClick={onImageClick} onVideoClick={onVideoClick} />
        )}
      </div>
    ))}
  </div>
)

const DetailRow: React.FC<{ icon: string; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value || value === '无') return null
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span>{icon}</span>
      <span style={{ color: 'var(--color-text-light)', minWidth: 56, fontSize: 13 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

import { useState } from 'react'
import { View, Text, Image, Input, Textarea, Picker, Video } from '@tarojs/components'
import { useAppStore, CareRecord, Permissions } from '../../store'
import { chooseAndSaveImage, chooseAndSaveVideo, saveTempFile } from '../../utils/fileStorage'

export default function CareTrackingPage() {
  const { user, caregivers, careRecords, addCareRecord, updateCareRecord, setCareRecords } = useAppStore()
  const isAdmin = Permissions.isAdmin(user?.role)
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history' | 'timeline'>('ongoing')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmitRecord = async (data: Partial<CareRecord>, images: string[], videos: string[]) => {
    const savedImages = images.map(saveTempFile)
    const savedVideos = videos.map(saveTempFile)
    const currentCg = user?.caregiverId ? caregivers.find((c) => c.id === user.caregiverId) : null
    const substitute = currentCg?.onLeave && currentCg.substituteId
      ? caregivers.find((c) => c.id === currentCg.substituteId)
      : null
    const newRecord: CareRecord = {
      id: `cr_${Date.now()}`,
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
      images: savedImages,
      videos: savedVideos,
    }
    addCareRecord(newRecord)
    setSubmitSuccess(true)
    setTimeout(() => { setShowAddForm(false); setSubmitSuccess(false) }, 1200)
  }

  const handleEdit = (record: CareRecord) => {
    setEditingId(record.id)
  }

  const handleSave = (d: CareRecord) => {
    updateCareRecord(d.id, d)
    setEditingId(null)
  }

  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) return
    setCareRecords(careRecords.filter((r) => r.id !== id))
  }

  const ongoing = careRecords.filter((r) => r.status === 'ongoing')
  const history = careRecords.filter((r) => r.status === 'completed')
  const filtered = (activeTab === 'ongoing' ? ongoing : activeTab === 'history' ? history : careRecords).filter((r) =>
    r.elderlyName.includes(searchQuery) || r.caregiverName.includes(searchQuery) || r.content.includes(searchQuery)
  )

  if (showAddForm) {
    if (submitSuccess) {
      return (
        <View className='page'>
          <View style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Text style={{ fontSize: 64, marginBottom: 16, display: 'block' }}>✅</Text>
            <Text style={{ fontSize: 20, color: '#1B5E20', display: 'block' }}>护理记录提交成功！</Text>
            <Text style={{ fontSize: 14, color: '#616161', marginTop: 8, display: 'block' }}>正在跳转回护理记录列表...</Text>
          </View>
        </View>
      )
    }
    return <AddCareRecordForm onSubmit={handleSubmitRecord} onClose={() => setShowAddForm(false)} />
  }

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>📋 护理记录</Text>
      </View>

      <View style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#F5F5F5', borderRadius: 12, padding: 3 }}>
        {(['ongoing', 'history', 'timeline'] as const).map((tab) => (
          <View key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '9px 12px', borderRadius: 8,
            background: activeTab === tab ? '#2E7D32' : 'transparent',
            color: activeTab === tab ? 'white' : '#616161',
            fontWeight: 500, fontSize: 13, textAlign: 'center',
          }}>
            <Text>{tab === 'ongoing' ? '🟢 进行中' : tab === 'history' ? '✅ 历史记录' : '📅 时间线'}</Text>
          </View>
        ))}
      </View>

      <View style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <Input
          placeholder='搜索老人/护工/服务内容...'
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.detail.value)}
          style={{
            flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: 12,
            border: '1px solid #E0E0E0', background: '#F5F5F5', minHeight: 44,
          }}
        />
        <View onClick={() => setShowAddForm(true)} style={{
          padding: '12px 20px', background: '#2E7D32', color: 'white', borderRadius: 10,
          fontWeight: 600, fontSize: 16, minHeight: 44, display: 'flex', alignItems: 'center',
        }}>
          <Text>+ 新建</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state-icon'>📋</Text>
          <Text className='empty-state-text'>暂无护理记录</Text>
        </View>
      ) : (
        filtered.map((record) => (
          editingId === record.id ? (
            <EditRecordCard key={record.id} record={record} onSave={(d) => handleSave(d)} onCancel={() => setEditingId(null)} />
          ) : (
            <RecordCard key={record.id} record={record} onEdit={() => handleEdit(record)} onDelete={() => handleDeleteRecord(record.id)} isAdmin={isAdmin} onImageClick={setPreviewImage} onVideoClick={setPreviewVideo} />
          )
        ))
      )}

      {previewImage && (
        <View onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <Text>✕</Text>
          </View>
          <Image src={previewImage} mode='aspectFit' style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: 8 }} />
        </View>
      )}
      {previewVideo && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: '#000' }}>
          <View onClick={() => setPreviewVideo(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <Text>✕</Text>
          </View>
          <Video src={previewVideo} autoplay controls style={{ width: '100%', height: '100%' }} />
        </View>
      )}
    </View>
  )
}

const RecordCard: React.FC<{ record: CareRecord; onEdit: () => void; onDelete?: () => void; isAdmin?: boolean; onImageClick?: (url: string) => void; onVideoClick?: (url: string) => void }> = ({ record, onEdit, onDelete, isAdmin, onImageClick, onVideoClick }) => (
  <View className='card'>
    <View style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <View style={{ width: 38, height: 38, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>
        <Text>{record.caregiverName.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>
          {record.caregiverName}
          {record.substituteId && record.substituteName && (
            <Text style={{ fontSize: 11, padding: '1px 8px', borderRadius: 8, background: '#E3F2FD', color: '#1565C0', marginLeft: 6 }}>
              接班: {record.substituteName}
            </Text>
          )}
        </Text>
        <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{record.elderlyName}</Text>
      </View>
      <Text className={`tag ${record.status === 'ongoing' ? 'tag-primary' : 'tag-info'}`} style={{ fontSize: 11 }}>
        {record.status === 'ongoing' ? '进行中' : '已完成'}
      </Text>
    </View>
    <View style={{ display: 'flex', gap: 8, fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>
      <Text>🕐 {record.startTime.slice(11, 16)}{record.endTime ? ` - ${record.endTime.slice(11, 16)}` : ''}</Text>
      <Text>📅 {record.startTime.slice(0, 10)}</Text>
    </View>
    <View style={{ fontSize: 14, color: '#616161', lineHeight: 2 }}>
      <DetailRow icon='📝' label='服务内容' value={record.content} />
      <DetailRow icon='💊' label='用药记录' value={record.medications} />
      <DetailRow icon='🍚' label='饮食记录' value={record.diet} />
      <DetailRow icon='🏃' label='康复训练' value={record.training} />
      <DetailRow icon='📌' label='备注' value={record.notes} />
    </View>
    {record.images.length > 0 && (
      <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {record.images.map((img, i) => (
          <Image key={i} src={img} mode='aspectFill' onClick={() => onImageClick?.(img)} style={{ width: 64, height: 64, borderRadius: 8, border: '1px solid #E0E0E0' }} />
        ))}
      </View>
    )}
    {record.videos.length > 0 && (
      <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {record.videos.map((url, i) => (
          <View key={i} onClick={() => onVideoClick?.(url)} style={{ width: 64, height: 64, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E0E0E0' }}>
            <Text style={{ fontSize: 28, opacity: 0.8 }}>▶️</Text>
          </View>
        ))}
      </View>
    )}
    <View style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <View onClick={onEdit} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32' }}>
        <Text>✏️ 编辑（含上传影像）</Text>
      </View>
      {isAdmin && onDelete && (
        <View onClick={onDelete} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', background: '#D32F2F', color: 'white' }}>
          <Text>🗑️ 删除</Text>
        </View>
      )}
    </View>
  </View>
)

const EditRecordCard: React.FC<{ record: CareRecord; onSave: (d: CareRecord) => void; onCancel: () => void }> = ({ record, onSave, onCancel }) => {
  const [editData, setEditData] = useState<CareRecord>(record)
  const [editImages, setEditImages] = useState<string[]>(record.images)
  const [editVideos, setEditVideos] = useState<string[]>(record.videos)

  const handleEditAttach = async (type: 'image' | 'video') => {
    if (type === 'image') {
      const files = await chooseAndSaveImage(1)
      setEditImages((prev) => [...prev, ...files])
    } else {
      const files = await chooseAndSaveVideo()
      setEditVideos((prev) => [...prev, ...files])
    }
  }

  return (
    <View className='card'>
      <Text className='card-title'>✏️ 编辑护理记录</Text>
      <View className='form-group'>
        <Text className='form-label'>服务内容</Text>
        <Textarea className='form-input' value={editData.content || ''} onInput={(e) => setEditData({ ...editData, content: e.detail.value })} style={{ minHeight: 80 }} />
      </View>
      <View className='form-group'>
        <Text className='form-label'>用药记录</Text>
        <Textarea className='form-input' value={editData.medications || ''} onInput={(e) => setEditData({ ...editData, medications: e.detail.value })} style={{ minHeight: 60 }} />
      </View>
      <View className='form-group'>
        <Text className='form-label'>饮食记录</Text>
        <Textarea className='form-input' value={editData.diet || ''} onInput={(e) => setEditData({ ...editData, diet: e.detail.value })} style={{ minHeight: 60 }} />
      </View>
      <View className='form-group'>
        <Text className='form-label'>康复训练</Text>
        <Textarea className='form-input' value={editData.training || ''} onInput={(e) => setEditData({ ...editData, training: e.detail.value })} style={{ minHeight: 60 }} />
      </View>
      <View className='form-group'>
        <Text className='form-label'>备注</Text>
        <Textarea className='form-input' value={editData.notes || ''} onInput={(e) => setEditData({ ...editData, notes: e.detail.value })} style={{ minHeight: 60 }} />
      </View>
      <View className='form-group'>
        <Text className='form-label'>附件</Text>
        <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {editImages.map((url, i) => (
            <View key={`img-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <Image src={url} mode='aspectFill' style={{ width: '100%', height: '100%' }} />
              <View onClick={() => setEditImages(editImages.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D32F2F', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {editVideos.map((url, i) => (
            <View key={`vid-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: '#000', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 28 }}>▶️</Text>
              <View onClick={() => setEditVideos(editVideos.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D32F2F', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          <View onClick={() => handleEditAttach('image')} style={{ width: 72, height: 72, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px dashed #E0E0E0' }}>
            <Text>+</Text>
          </View>
        </View>
        <View style={{ marginTop: 6 }}>
          <View onClick={() => handleEditAttach('video')} style={{ fontSize: 12, color: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 6, padding: '3px 10px', display: 'inline-flex' }}>
            <Text>🎬 添加视频</Text>
          </View>
        </View>
      </View>
      <View style={{ display: 'flex', gap: 8 }}>
        <View onClick={() => onSave({ ...editData, images: editImages, videos: editVideos })} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', background: '#2E7D32', color: 'white' }}>
          <Text>💾 保存</Text>
        </View>
        <View onClick={onCancel} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32' }}>
          <Text>取消</Text>
        </View>
      </View>
    </View>
  )
}

const AddCareRecordForm: React.FC<{ onSubmit: (data: Partial<CareRecord>, images: string[], videos: string[]) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    elderlyId: 'e1', content: '', medications: '', diet: '', training: '', notes: '',
    startTime: new Date().toISOString().slice(11, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(11, 16),
  })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])

  const handleAttachImage = async () => {
    const files = await chooseAndSaveImage(9)
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleAttachVideo = async () => {
    const files = await chooseAndSaveVideo()
    setUploadedVideos((prev) => [...prev, ...files])
  }

  const elderlyList = ['张秀英', '李建国']

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>新建护理记录</Text>
      </View>
      <View className='card'>
        <View className='form-group'>
          <Text className='form-label'>服务对象</Text>
          <Picker mode='selector' range={elderlyList} value={form.elderlyId === 'e2' ? 1 : 0} onChange={(e) => setForm({ ...form, elderlyId: e.detail.value === 1 ? 'e2' : 'e1' })}>
            <View className='form-input'>{form.elderlyId === 'e2' ? '李建国' : '张秀英'}</View>
          </Picker>
        </View>
        <View className='form-group'>
          <Text className='form-label'>⏰ 服务时间段</Text>
          <View style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input type='text' value={form.startTime} onInput={(e) => setForm({ ...form, startTime: e.detail.value })} style={{ flex: 1, padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48 }} />
            <Text style={{ color: '#9E9E9E' }}>至</Text>
            <Input type='text' value={form.endTime} onInput={(e) => setForm({ ...form, endTime: e.detail.value })} style={{ flex: 1, padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48 }} />
          </View>
        </View>
        <View className='form-group'>
          <Text className='form-label'>服务内容</Text>
          <Textarea className='form-input' placeholder='描述本次护理服务内容' value={form.content} onInput={(e) => setForm({ ...form, content: e.detail.value })} style={{ minHeight: 80 }} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>用药记录</Text>
          <Textarea className='form-input' placeholder='记录用药情况' value={form.medications} onInput={(e) => setForm({ ...form, medications: e.detail.value })} style={{ minHeight: 60 }} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>饮食记录</Text>
          <Textarea className='form-input' placeholder='记录饮食情况' value={form.diet} onInput={(e) => setForm({ ...form, diet: e.detail.value })} style={{ minHeight: 60 }} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>康复训练</Text>
          <Textarea className='form-input' placeholder='记录康复训练内容' value={form.training} onInput={(e) => setForm({ ...form, training: e.detail.value })} style={{ minHeight: 60 }} />
        </View>
        <View className='form-group'>
          <Text className='form-label'>附件上传</Text>
          <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {uploadedFiles.map((url, i) => (
              <View key={`img-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
                <Image src={url} mode='aspectFill' style={{ width: '100%', height: '100%' }} />
                <View onClick={() => setUploadedFiles(uploadedFiles.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D32F2F', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {uploadedVideos.map((url, i) => (
              <View key={`vid-${i}`} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, background: '#000', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28 }}>▶️</Text>
                <View onClick={() => setUploadedVideos(uploadedVideos.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D32F2F', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            <View onClick={handleAttachImage} style={{ width: 72, height: 72, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px dashed #E0E0E0' }}>
              <Text>+</Text>
            </View>
          </View>
          <View style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <View onClick={handleAttachImage} style={{ fontSize: 12, color: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 6, padding: '3px 10px', display: 'inline-flex' }}>
              <Text>📷 添加图片</Text>
            </View>
            <View onClick={handleAttachVideo} style={{ fontSize: 12, color: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 6, padding: '3px 10px', display: 'inline-flex' }}>
              <Text>🎬 添加视频</Text>
            </View>
          </View>
        </View>
        <View style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <View onClick={() => { onSubmit(form, uploadedFiles, uploadedVideos); setUploadedFiles([]); setUploadedVideos([]) }} style={{ flex: 1, padding: '12px 24px', fontSize: '18px', fontWeight: 600, borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>📤 提交记录</Text>
          </View>
          <View onClick={() => { setUploadedFiles([]); setUploadedVideos([]); onClose() }} style={{ flex: 1, padding: '12px 24px', fontSize: '18px', fontWeight: 600, borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>取消</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const DetailRow: React.FC<{ icon: string; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value || value === '无') return null
  return (
    <View style={{ display: 'flex', gap: 8 }}>
      <Text>{icon}</Text>
      <Text style={{ color: '#9E9E9E', minWidth: 56, fontSize: 13 }}>{label}</Text>
      <Text>{value}</Text>
    </View>
  )
}
